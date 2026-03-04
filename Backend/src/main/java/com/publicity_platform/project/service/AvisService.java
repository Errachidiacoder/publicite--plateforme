package com.publicity_platform.project.service;

import com.publicity_platform.project.dto.AvisResponseDto;
import com.publicity_platform.project.entity.*;
import com.publicity_platform.project.repository.AvisRepository;
import com.publicity_platform.project.repository.CommandeRepository;
import com.publicity_platform.project.repository.ProduitRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AvisService {

    private static final Logger log = LoggerFactory.getLogger(AvisService.class);

    private final AvisRepository avisRepository;
    private final ProduitRepository produitRepository;
    private final CommandeRepository commandeRepository;

    public AvisService(AvisRepository avisRepository, ProduitRepository produitRepository,
            CommandeRepository commandeRepository) {
        this.avisRepository = avisRepository;
        this.produitRepository = produitRepository;
        this.commandeRepository = commandeRepository;
    }

    public List<Avis> getAvisProduit(Long produitId) {
        return avisRepository.findByProduitIdOrderByDateAvisDesc(produitId);
    }

    /**
     * Returns review DTOs with user names for frontend display.
     */
    public List<AvisResponseDto> getAvisProduitDto(Long produitId) {
        return avisRepository.findByProduitIdOrderByDateAvisDesc(produitId).stream()
                .map(a -> new AvisResponseDto(
                        a.getId(),
                        a.getNote(),
                        a.getCommentaire(),
                        a.getDateAvis(),
                        a.getUtilisateur() != null ? a.getUtilisateur().getNomComplet() : "Anonyme",
                        a.getProduit() != null ? a.getProduit().getId() : null,
                        a.getCommandeId()))
                .collect(Collectors.toList());
    }

    public List<Avis> getAvisUtilisateur(Long utilisateurId) {
        return avisRepository.findByUtilisateurId(utilisateurId);
    }

    /**
     * Checks if a client is eligible to review a product.
     * Returns the commandeId if eligible, null otherwise.
     */
    @Transactional(readOnly = true)
    public Long canClientReview(Long clientId, Long produitId) {
        // Find a commande where paiementConfirme=true that contains this product
        List<Commande> commandes = commandeRepository.findByAcheteurIdOrderByDatePassageCommandeDesc(clientId);
        for (Commande cmd : commandes) {
            if (Boolean.TRUE.equals(cmd.getPaiementConfirme()) && cmd.getLignes() != null) {
                for (LigneCommande ligne : cmd.getLignes()) {
                    if (ligne.getProduitCommande() != null
                            && ligne.getProduitCommande().getId().equals(produitId)
                            && !Boolean.TRUE.equals(ligne.getAvisDepose())) {
                        // Eligible: payment confirmed and no review yet for this line
                        return cmd.getId();
                    }
                }
            }
        }
        return null; // Not eligible
    }

    /**
     * Creates a review with eligibility enforcement.
     */
    @Transactional
    public Avis creerAvis(Long produitId, Utilisateur utilisateur, int note, String commentaire, Long commandeId) {
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        // Validate: commande must exist and belong to this user
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        if (!commande.getAcheteur().getId().equals(utilisateur.getId())) {
            throw new RuntimeException("Cette commande ne vous appartient pas.");
        }

        // Validate: payment must be confirmed
        if (!Boolean.TRUE.equals(commande.getPaiementConfirme())) {
            throw new RuntimeException("Le paiement de cette commande n'a pas encore été confirmé.");
        }

        // Validate: no duplicate review for this (user, product, commande)
        if (avisRepository.existsByUtilisateurIdAndProduitIdAndCommandeId(
                utilisateur.getId(), produitId, commandeId)) {
            throw new RuntimeException("Vous avez déjà laissé un avis pour ce produit sur cette commande.");
        }

        // Find and mark the LigneCommande as reviewed
        boolean ligneFound = false;
        if (commande.getLignes() != null) {
            for (LigneCommande ligne : commande.getLignes()) {
                if (ligne.getProduitCommande() != null
                        && ligne.getProduitCommande().getId().equals(produitId)) {
                    ligne.setAvisDepose(true);
                    ligneFound = true;
                    break;
                }
            }
        }
        if (!ligneFound) {
            throw new RuntimeException("Ce produit ne fait pas partie de cette commande.");
        }

        // Create the review
        Avis avis = new Avis();
        avis.setProduit(produit);
        avis.setUtilisateur(utilisateur);
        avis.setNote(note);
        avis.setCommentaire(commentaire);
        avis.setCommandeId(commandeId);
        Avis saved = avisRepository.save(avis);

        // Update product stats
        mettreAJourStatsProduit(produit);

        // Update boutique average rating
        if (produit.getBoutique() != null) {
            mettreAJourStatsBoutique(produit.getBoutique());
        }

        log.info("Review created: user={} product={} commande={} note={}",
                utilisateur.getId(), produitId, commandeId, note);

        return saved;
    }

    /**
     * Backward-compatible overload (no commandeId — for legacy calls).
     */
    @Transactional
    public Avis creerAvis(Long produitId, Utilisateur utilisateur, int note, String commentaire) {
        // Try to find a valid commandeId
        Long commandeId = canClientReview(utilisateur.getId(), produitId);
        if (commandeId == null) {
            throw new RuntimeException(
                    "Vous ne pouvez pas laisser un avis: aucune commande payée trouvée pour ce produit.");
        }
        return creerAvis(produitId, utilisateur, note, commentaire, commandeId);
    }

    /**
     * Recalculates average rating and review count for a product.
     */
    private void mettreAJourStatsProduit(Produit produit) {
        Double moyenne = avisRepository.findAverageNoteByProduitId(produit.getId());
        long total = avisRepository.countByProduitId(produit.getId());

        produit.setNoteMoyenne(moyenne != null ? moyenne : 0.0);
        produit.setNombreAvis((int) total);
        produitRepository.save(produit);
    }

    /**
     * Recalculates the boutique's average rating across all its products.
     */
    private void mettreAJourStatsBoutique(Boutique boutique) {
        try {
            List<Produit> produits = boutique.getProduits();
            if (produits == null || produits.isEmpty())
                return;

            double totalNote = 0;
            int totalAvis = 0;
            for (Produit p : produits) {
                if (p.getNombreAvis() != null && p.getNombreAvis() > 0) {
                    totalNote += (p.getNoteMoyenne() != null ? p.getNoteMoyenne() : 0) * p.getNombreAvis();
                    totalAvis += p.getNombreAvis();
                }
            }
            boutique.setNoteMoyenne(totalAvis > 0 ? totalNote / totalAvis : 0.0);
        } catch (Exception e) {
            log.warn("Could not update boutique rating: {}", e.getMessage());
        }
    }
}

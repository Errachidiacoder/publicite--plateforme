package com.publicity_platform.project.service;

import com.publicity_platform.project.dto.CommandeResponseDto;
import com.publicity_platform.project.dto.LigneCommandeDto;
import com.publicity_platform.project.entity.*;
import com.publicity_platform.project.enumm.StatutCommande;
import com.publicity_platform.project.repository.CommandeRepository;
import com.publicity_platform.project.repository.ProduitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommandeService {

    private final CommandeRepository commandeRepository;
    private final PanierService panierService;
    private final ProduitRepository produitRepository;

    public CommandeService(CommandeRepository commandeRepository,
            PanierService panierService,
            ProduitRepository produitRepository) {
        this.commandeRepository = commandeRepository;
        this.panierService = panierService;
        this.produitRepository = produitRepository;
    }

    /**
     * Crée une commande à partir du contenu actuel du panier.
     */
    @Transactional
    public CommandeResponseDto passerCommande(Utilisateur acheteur, String adresseLivraison,
            String telephoneContact, String notesLivraison,
            String methodePaiement) {

        Panier panier = panierService.getPanierUtilisateur(acheteur);

        if (panier.getLignes() == null || panier.getLignes().isEmpty()) {
            throw new RuntimeException("Le panier est vide, impossible de passer commande");
        }

        Commande commande = new Commande();
        commande.setAcheteur(acheteur);
        commande.setAdresseLivraison(adresseLivraison);
        commande.setTelephoneContact(telephoneContact);
        commande.setNotesLivraison(notesLivraison);

        // Déterminer le statut initial selon la méthode de paiement
        if ("PAIEMENT_A_LIVRAISON".equals(methodePaiement)) {
            commande.setStatutCommande(StatutCommande.EN_PREPARATION);
            commande.setMethodePaiement(
                    com.publicity_platform.project.enumm.MethodePaiement.PAIEMENT_A_LIVRAISON);
        } else {
            commande.setStatutCommande(StatutCommande.EN_ATTENTE_PAIEMENT);
            try {
                commande.setMethodePaiement(
                        com.publicity_platform.project.enumm.MethodePaiement.valueOf(methodePaiement));
            } catch (IllegalArgumentException e) {
                commande.setMethodePaiement(
                        com.publicity_platform.project.enumm.MethodePaiement.PAIEMENT_A_LIVRAISON);
            }
        }

        // Convertir les lignes du panier en lignes de commande
        double totalTTC = 0.0;
        commande.setLignes(new ArrayList<>());

        for (LignePanier lignePanier : panier.getLignes()) {
            Produit produit = lignePanier.getProduit();

            // Re-validate stock at checkout time
            if (produit.getQuantiteStock() != null
                    && lignePanier.getQuantite() > produit.getQuantiteStock()) {
                throw new RuntimeException(
                        "Stock insuffisant pour '" + produit.getTitreProduit()
                                + "'. Disponible : " + produit.getQuantiteStock());
            }

            double prixEffectif = resolvePrix(produit);

            LigneCommande ligneCommande = new LigneCommande();
            ligneCommande.setProduitCommande(produit);
            ligneCommande.setQuantiteCommandee(lignePanier.getQuantite());
            ligneCommande.setPrixUnitaireTTC(prixEffectif);
            ligneCommande.setCommandeParente(commande);
            commande.getLignes().add(ligneCommande);

            totalTTC += prixEffectif * lignePanier.getQuantite();

            // Mettre à jour le stock et le compteur de ventes
            if (produit.getQuantiteStock() != null && produit.getQuantiteStock() > 0) {
                produit.setQuantiteStock(
                        produit.getQuantiteStock() - lignePanier.getQuantite());
            }
            produit.setNombreVentes(
                    (produit.getNombreVentes() != null ? produit.getNombreVentes() : 0) + lignePanier.getQuantite());
            produitRepository.save(produit);
        }

        commande.setMontantTotalTTC(totalTTC);
        Commande saved = commandeRepository.save(commande);

        // Vider le panier après la commande
        panierService.viderPanier(acheteur);

        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CommandeResponseDto> getCommandesAcheteur(Long acheteurId) {
        return commandeRepository.findByAcheteurIdOrderByDatePassageCommandeDesc(acheteurId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CommandeResponseDto getCommandeById(Long id) {
        Commande commande = commandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
        return toDto(commande);
    }

    @Transactional(readOnly = true)
    public List<CommandeResponseDto> getCommandesBoutique(Long boutiqueId) {
        return commandeRepository.findByBoutiqueId(boutiqueId)
                .stream().map(c -> toDtoForBoutique(c, boutiqueId)).collect(Collectors.toList());
    }

    public List<Commande> getCommandesLivreur(Long livreurId) {
        return commandeRepository.findByLivreurId(livreurId);
    }

    /**
     * Met à jour le statut d'une commande (livreur ou admin).
     */
    @Transactional
    public Commande mettreAJourStatut(Long commandeId, StatutCommande nouveauStatut) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
        commande.setStatutCommande(nouveauStatut);
        return commandeRepository.save(commande);
    }

    /**
     * Assigne un livreur à une commande.
     */
    @Transactional
    public Commande assignerLivreur(Long commandeId, Utilisateur livreur) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
        commande.setLivreur(livreur);
        commande.setStatutCommande(StatutCommande.EN_LIVRAISON);
        return commandeRepository.save(commande);
    }

    // ─── DTO Conversion ───────────────────────────

    private CommandeResponseDto toDto(Commande commande) {
        CommandeResponseDto dto = new CommandeResponseDto();
        dto.setId(commande.getId());
        dto.setReferenceCommande(commande.getReferenceCommande());
        dto.setStatutCommande(commande.getStatutCommande());
        dto.setMethodePaiement(commande.getMethodePaiement());
        dto.setMontantTotal(commande.getMontantTotalTTC());
        dto.setAdresseLivraison(commande.getAdresseLivraison());
        dto.setTelephoneContact(commande.getTelephoneContact());
        dto.setNotesLivraison(commande.getNotesLivraison());
        dto.setDatePassageCommande(commande.getDatePassageCommande());

        if (commande.getLignes() != null) {
            dto.setLignes(commande.getLignes().stream()
                    .map(this::toLigneDto)
                    .collect(Collectors.toList()));
            dto.setNombreArticles(commande.getLignes().stream()
                    .mapToInt(LigneCommande::getQuantiteCommandee)
                    .sum());
        } else {
            dto.setLignes(new ArrayList<>());
            dto.setNombreArticles(0);
        }

        return dto;
    }

    /**
     * Converts a Commande to DTO but only includes line items belonging to the
     * given boutique.
     * Recalculates montantTotal and nombreArticles based on filtered lines only.
     */
    private CommandeResponseDto toDtoForBoutique(Commande commande, Long boutiqueId) {
        CommandeResponseDto dto = new CommandeResponseDto();
        dto.setId(commande.getId());
        dto.setReferenceCommande(commande.getReferenceCommande());
        dto.setStatutCommande(commande.getStatutCommande());
        dto.setMethodePaiement(commande.getMethodePaiement());
        dto.setAdresseLivraison(commande.getAdresseLivraison());
        dto.setTelephoneContact(commande.getTelephoneContact());
        dto.setNotesLivraison(commande.getNotesLivraison());
        dto.setDatePassageCommande(commande.getDatePassageCommande());

        // Filter lines to only include products from this boutique
        List<LigneCommande> filteredLines = (commande.getLignes() != null)
                ? commande.getLignes().stream()
                        .filter(l -> l.getProduitCommande() != null
                                && l.getProduitCommande().getBoutique() != null
                                && boutiqueId.equals(l.getProduitCommande().getBoutique().getId()))
                        .collect(Collectors.toList())
                : new ArrayList<>();

        dto.setLignes(filteredLines.stream().map(this::toLigneDto).collect(Collectors.toList()));
        dto.setNombreArticles(filteredLines.stream().mapToInt(LigneCommande::getQuantiteCommandee).sum());

        // Recalculate montant based on merchant's items only
        double merchantTotal = filteredLines.stream()
                .mapToDouble(l -> l.getSousTotalLigne() != null ? l.getSousTotalLigne() : 0.0)
                .sum();
        dto.setMontantTotal(merchantTotal);

        return dto;
    }

    private LigneCommandeDto toLigneDto(LigneCommande ligne) {
        LigneCommandeDto dto = new LigneCommandeDto();
        dto.setId(ligne.getId());
        dto.setQuantite(ligne.getQuantiteCommandee());
        dto.setPrixUnitaire(ligne.getPrixUnitaireTTC());
        dto.setSousTotal(ligne.getSousTotalLigne());

        Produit p = ligne.getProduitCommande();
        if (p != null) {
            dto.setProduitId(p.getId());
            dto.setProduitNom(p.getTitreProduit());
            dto.setProduitImage(resolvePrimaryImage(p));
        }

        return dto;
    }

    // ─── Helpers ──────────────────────────────────

    private double resolvePrix(Produit produit) {
        if (produit.getPrixPromo() != null) {
            return produit.getPrixPromo().doubleValue();
        }
        if (produit.getPrix() != null) {
            return produit.getPrix().doubleValue();
        }
        if (produit.getPrixAfiche() != null) {
            return produit.getPrixAfiche();
        }
        return 0.0;
    }

    private String resolvePrimaryImage(Produit produit) {
        if (produit.getImages() != null && !produit.getImages().isEmpty()) {
            return produit.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .findFirst()
                    .map(ProductImage::getUrl)
                    .orElse(produit.getImages().get(0).getUrl());
        }
        return produit.getImageUrl();
    }
}

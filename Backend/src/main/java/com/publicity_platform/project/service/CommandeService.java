package com.publicity_platform.project.service;

import com.publicity_platform.project.entity.*;
import com.publicity_platform.project.enumm.StatutCommande;
import com.publicity_platform.project.repository.CommandeRepository;
import com.publicity_platform.project.repository.ProduitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
    public Commande passerCommande(Utilisateur acheteur, String adresseLivraison,
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
                        com.publicity_platform.project.enumm.MethodePaiement.CARTE_BANCAIRE);
            }
        }

        // Convertir les lignes du panier en lignes de commande
        double totalTTC = 0.0;
        for (LignePanier lignePanier : panier.getLignes()) {
            LigneCommande ligneCommande = new LigneCommande();
            ligneCommande.setProduitCommande(lignePanier.getProduit());
            ligneCommande.setQuantiteCommandee(lignePanier.getQuantite());
            ligneCommande.setPrixUnitaireTTC(lignePanier.getProduit().getPrixAfiche());
            ligneCommande.setCommandeParente(commande);

            if (commande.getLignes() == null) {
                commande.setLignes(new java.util.ArrayList<>());
            }
            commande.getLignes().add(ligneCommande);

            totalTTC += lignePanier.getProduit().getPrixAfiche() * lignePanier.getQuantite();

            // Mettre à jour le stock et le compteur de ventes
            Produit produit = lignePanier.getProduit();
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

        return saved;
    }

    public List<Commande> getCommandesAcheteur(Long acheteurId) {
        return commandeRepository.findByAcheteurIdOrderByDatePassageCommandeDesc(acheteurId);
    }

    public Commande getCommandeById(Long id) {
        return commandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
    }

    public List<Commande> getCommandesBoutique(Long boutiqueId) {
        return commandeRepository.findByBoutiqueId(boutiqueId);
    }

    public List<Commande> getCommandesLivreur(Long livreurId) {
        return commandeRepository.findByLivreurId(livreurId);
    }

    /**
     * Met à jour le statut d'une commande (livreur ou admin).
     */
    @Transactional
    public Commande mettreAJourStatut(Long commandeId, StatutCommande nouveauStatut) {
        Commande commande = getCommandeById(commandeId);
        commande.setStatutCommande(nouveauStatut);
        return commandeRepository.save(commande);
    }

    /**
     * Assigne un livreur à une commande.
     */
    @Transactional
    public Commande assignerLivreur(Long commandeId, Utilisateur livreur) {
        Commande commande = getCommandeById(commandeId);
        commande.setLivreur(livreur);
        commande.setStatutCommande(StatutCommande.EN_LIVRAISON);
        return commandeRepository.save(commande);
    }
}

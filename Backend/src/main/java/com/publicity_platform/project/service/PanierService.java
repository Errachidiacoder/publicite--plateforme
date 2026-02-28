package com.publicity_platform.project.service;

import com.publicity_platform.project.entity.LignePanier;
import com.publicity_platform.project.entity.Panier;
import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.repository.PanierRepository;
import com.publicity_platform.project.repository.ProduitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
public class PanierService {

    private final PanierRepository panierRepository;
    private final ProduitRepository produitRepository;

    public PanierService(PanierRepository panierRepository, ProduitRepository produitRepository) {
        this.panierRepository = panierRepository;
        this.produitRepository = produitRepository;
    }

    /**
     * Récupère le panier de l'utilisateur, ou en crée un s'il n'existe pas.
     */
    public Panier getPanierUtilisateur(Utilisateur utilisateur) {
        return panierRepository.findByUtilisateurId(utilisateur.getId())
                .orElseGet(() -> {
                    Panier nouveau = new Panier();
                    nouveau.setUtilisateur(utilisateur);
                    nouveau.setLignes(new ArrayList<>());
                    return panierRepository.save(nouveau);
                });
    }

    /**
     * Ajoute un produit au panier, ou incrémente la quantité s'il y est déjà.
     */
    @Transactional
    public Panier ajouterAuPanier(Utilisateur utilisateur, Long produitId, int quantite) {
        Panier panier = getPanierUtilisateur(utilisateur);
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        // Vérifier si le produit est déjà dans le panier
        LignePanier ligneExistante = panier.getLignes().stream()
                .filter(l -> l.getProduit().getId().equals(produitId))
                .findFirst()
                .orElse(null);

        if (ligneExistante != null) {
            ligneExistante.setQuantite(ligneExistante.getQuantite() + quantite);
            ligneExistante.setSousTotal(produit.getPrixAfiche() * ligneExistante.getQuantite());
        } else {
            LignePanier nouvelleLigne = new LignePanier();
            nouvelleLigne.setPanier(panier);
            nouvelleLigne.setProduit(produit);
            nouvelleLigne.setQuantite(quantite);
            nouvelleLigne.setSousTotal(produit.getPrixAfiche() * quantite);
            panier.getLignes().add(nouvelleLigne);
        }

        return panierRepository.save(panier);
    }

    /**
     * Modifie la quantité d'un produit dans le panier.
     */
    @Transactional
    public Panier modifierQuantite(Utilisateur utilisateur, Long produitId, int nouvelleQuantite) {
        Panier panier = getPanierUtilisateur(utilisateur);

        LignePanier ligne = panier.getLignes().stream()
                .filter(l -> l.getProduit().getId().equals(produitId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Produit absent du panier"));

        if (nouvelleQuantite <= 0) {
            panier.getLignes().remove(ligne);
        } else {
            ligne.setQuantite(nouvelleQuantite);
            ligne.setSousTotal(ligne.getProduit().getPrixAfiche() * nouvelleQuantite);
        }

        return panierRepository.save(panier);
    }

    /**
     * Supprime un produit du panier.
     */
    @Transactional
    public Panier supprimerDuPanier(Utilisateur utilisateur, Long produitId) {
        Panier panier = getPanierUtilisateur(utilisateur);
        panier.getLignes().removeIf(l -> l.getProduit().getId().equals(produitId));
        return panierRepository.save(panier);
    }

    /**
     * Vide complètement le panier.
     */
    @Transactional
    public Panier viderPanier(Utilisateur utilisateur) {
        Panier panier = getPanierUtilisateur(utilisateur);
        panier.getLignes().clear();
        return panierRepository.save(panier);
    }
}

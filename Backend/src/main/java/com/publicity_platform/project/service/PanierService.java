package com.publicity_platform.project.service;

import com.publicity_platform.project.dto.LignePanierDto;
import com.publicity_platform.project.dto.PanierDto;
import com.publicity_platform.project.entity.*;
import com.publicity_platform.project.enumm.StatutProduit;
import com.publicity_platform.project.repository.PanierRepository;
import com.publicity_platform.project.repository.ProduitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.stream.Collectors;

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
     * Récupère le panier en tant que DTO enrichi.
     */
    public PanierDto getPanierDto(Utilisateur utilisateur) {
        Panier panier = getPanierUtilisateur(utilisateur);
        return toDto(panier);
    }

    /**
     * Ajoute un produit au panier avec validation de stock.
     */
    @Transactional
    public PanierDto ajouterAuPanier(Utilisateur utilisateur, Long produitId, int quantite) {
        Panier panier = getPanierUtilisateur(utilisateur);
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        // Vérifier que le produit est actif
        if (produit.getStatutProduit() != StatutProduit.ACTIVE) {
            throw new RuntimeException("Ce produit n'est pas disponible à la vente");
        }

        // Calculer la quantité totale demandée (existante + nouvelle)
        LignePanier ligneExistante = panier.getLignes().stream()
                .filter(l -> l.getProduit().getId().equals(produitId))
                .findFirst()
                .orElse(null);

        int totalDemande = quantite + (ligneExistante != null ? ligneExistante.getQuantite() : 0);

        // Validation du stock
        if (produit.getQuantiteStock() != null && totalDemande > produit.getQuantiteStock()) {
            throw new RuntimeException("Stock insuffisant. Disponible : " + produit.getQuantiteStock());
        }

        // Déterminer le prix effectif
        double prixEffectif = resolvePrix(produit);

        if (ligneExistante != null) {
            ligneExistante.setQuantite(totalDemande);
            ligneExistante.setSousTotal(prixEffectif * totalDemande);
        } else {
            LignePanier nouvelleLigne = new LignePanier();
            nouvelleLigne.setPanier(panier);
            nouvelleLigne.setProduit(produit);
            nouvelleLigne.setQuantite(quantite);
            nouvelleLigne.setSousTotal(prixEffectif * quantite);
            panier.getLignes().add(nouvelleLigne);
        }

        return toDto(panierRepository.save(panier));
    }

    /**
     * Modifie la quantité d'un produit dans le panier.
     */
    @Transactional
    public PanierDto modifierQuantite(Utilisateur utilisateur, Long produitId, int nouvelleQuantite) {
        Panier panier = getPanierUtilisateur(utilisateur);

        LignePanier ligne = panier.getLignes().stream()
                .filter(l -> l.getProduit().getId().equals(produitId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Produit absent du panier"));

        if (nouvelleQuantite <= 0) {
            panier.getLignes().remove(ligne);
        } else {
            // Valider le stock
            Produit produit = ligne.getProduit();
            if (produit.getQuantiteStock() != null && nouvelleQuantite > produit.getQuantiteStock()) {
                throw new RuntimeException("Stock insuffisant. Disponible : " + produit.getQuantiteStock());
            }
            double prixEffectif = resolvePrix(produit);
            ligne.setQuantite(nouvelleQuantite);
            ligne.setSousTotal(prixEffectif * nouvelleQuantite);
        }

        return toDto(panierRepository.save(panier));
    }

    /**
     * Supprime un produit du panier.
     */
    @Transactional
    public PanierDto supprimerDuPanier(Utilisateur utilisateur, Long produitId) {
        Panier panier = getPanierUtilisateur(utilisateur);
        panier.getLignes().removeIf(l -> l.getProduit().getId().equals(produitId));
        return toDto(panierRepository.save(panier));
    }

    /**
     * Vide complètement le panier.
     */
    @Transactional
    public PanierDto viderPanier(Utilisateur utilisateur) {
        Panier panier = getPanierUtilisateur(utilisateur);
        panier.getLignes().clear();
        return toDto(panierRepository.save(panier));
    }

    /**
     * Retourne le nombre total d'articles dans le panier.
     */
    public int getCartCount(Utilisateur utilisateur) {
        Panier panier = panierRepository.findByUtilisateurId(utilisateur.getId()).orElse(null);
        if (panier == null)
            return 0;
        return panier.getNombreArticles();
    }

    // ─── DTO Conversion ───────────────────────────

    private PanierDto toDto(Panier panier) {
        PanierDto dto = new PanierDto();
        dto.setId(panier.getId());
        dto.setTotalItems(panier.getNombreArticles());
        dto.setTotalAmount(panier.calculerTotal());

        if (panier.getLignes() != null) {
            dto.setLignes(panier.getLignes().stream()
                    .map(this::toLigneDto)
                    .collect(Collectors.toList()));
        } else {
            dto.setLignes(new ArrayList<>());
        }

        return dto;
    }

    private LignePanierDto toLigneDto(LignePanier ligne) {
        LignePanierDto dto = new LignePanierDto();
        dto.setId(ligne.getId());
        dto.setQuantite(ligne.getQuantite());
        dto.setSousTotal(ligne.getSousTotal());

        Produit p = ligne.getProduit();
        if (p != null) {
            dto.setProduitId(p.getId());
            dto.setProduitNom(p.getTitreProduit());
            dto.setPrix(p.getPrix());
            dto.setPrixPromo(p.getPrixPromo());
            dto.setStockDisponible(p.getQuantiteStock());

            // Resolve primary image
            String imageUrl = resolvePrimaryImage(p);
            dto.setProduitImage(imageUrl);
        }

        return dto;
    }

    // ─── Helpers ──────────────────────────────────

    private double resolvePrix(Produit produit) {
        // Prefer prixPromo > prix > prixAfiche
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
        // Try ProductImage list first (marketplace products)
        if (produit.getImages() != null && !produit.getImages().isEmpty()) {
            return produit.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .findFirst()
                    .map(ProductImage::getUrl)
                    .orElse(produit.getImages().get(0).getUrl());
        }
        // Fallback to legacy imageUrl
        return produit.getImageUrl();
    }
}

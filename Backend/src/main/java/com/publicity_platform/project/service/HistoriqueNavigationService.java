package com.publicity_platform.project.service;

import com.publicity_platform.project.entity.Categorie;
import com.publicity_platform.project.entity.HistoriqueNavigation;
import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.repository.HistoriqueNavigationRepository;
import com.publicity_platform.project.repository.ProduitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HistoriqueNavigationService {

    private final HistoriqueNavigationRepository historiqueNavigationRepository;
    private final ProduitRepository produitRepository;

    public HistoriqueNavigationService(
            HistoriqueNavigationRepository historiqueNavigationRepository,
            ProduitRepository produitRepository) {
        this.historiqueNavigationRepository = historiqueNavigationRepository;
        this.produitRepository = produitRepository;
    }

    /**
     * Enregistre une consultation de produit avec la durée passée sur la page.
     * Appelé depuis le frontend au départ de la page produit (ngOnDestroy).
     *
     * @param produitId       ID du produit consulté
     * @param dureeSecondes   Durée de consultation (envoyée par le frontend)
     * @param utilisateur     Utilisateur connecté (peut être null si anonyme)
     * @param sourceRecherche Ex : "DIRECT", "RECHERCHE", "RECOMMANDATION"
     */
    @Transactional
    public void enregistrerConsultation(Long produitId, Integer dureeSecondes,
            Utilisateur utilisateur, String sourceRecherche) {
        Produit produit = produitRepository.findById(produitId).orElse(null);
        if (produit == null)
            return;

        // Incrémenter le compteur de vues du produit
        produit.incrementerVues();
        produitRepository.save(produit);

        // Récupérer la catégorie du produit
        Categorie categorie = produit.getCategorie();

        // Construire et sauvegarder l'historique
        @SuppressWarnings("null")
        HistoriqueNavigation historique = HistoriqueNavigation.builder()
                .produitConsulte(produit)
                .categorieVisitee(categorie)
                .utilisateur(utilisateur)
                .dureeConsultationSec(dureeSecondes != null ? dureeSecondes : 0)
                .sourceRecherche(sourceRecherche != null ? sourceRecherche : "DIRECT")
                .build();

        historiqueNavigationRepository.save(historique);
    }
}

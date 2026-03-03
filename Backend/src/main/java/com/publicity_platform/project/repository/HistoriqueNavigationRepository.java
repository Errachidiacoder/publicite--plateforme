package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.HistoriqueNavigation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoriqueNavigationRepository extends JpaRepository<HistoriqueNavigation, Long> {

    /**
     * Historique de navigation d'un utilisateur connecté, du plus récent au plus
     * ancien
     */
    List<HistoriqueNavigation> findByUtilisateurIdOrderByDateConsultationDesc(Long utilisateurId);

    /**
     * Top catégories visitées par un utilisateur (score = somme des durées de
     * consultation).
     * Retourne des Object[] { Categorie, Double score }
     */
    @Query("SELECT h.categorieVisitee, COALESCE(SUM(h.dureeConsultationSec), 0) as score " +
            "FROM HistoriqueNavigation h " +
            "WHERE h.utilisateur.id = :userId AND h.categorieVisitee IS NOT NULL " +
            "GROUP BY h.categorieVisitee " +
            "ORDER BY score DESC")
    List<Object[]> findTopCategoriesByUtilisateur(@Param("userId") Long userId);

    /**
     * IDs des produits déjà consultés par un utilisateur (pour les exclure des
     * recommandations).
     */
    @Query("SELECT DISTINCT h.produitConsulte.id FROM HistoriqueNavigation h " +
            "WHERE h.utilisateur.id = :userId AND h.produitConsulte IS NOT NULL")
    List<Long> findProduitIdsDejaConsultesByUtilisateur(@Param("userId") Long userId);

    /**
     * Tous les historiques liés à un produit donné (pour le Collaborative futur)
     */
    List<HistoriqueNavigation> findByProduitConsulteId(Long produitId);
}

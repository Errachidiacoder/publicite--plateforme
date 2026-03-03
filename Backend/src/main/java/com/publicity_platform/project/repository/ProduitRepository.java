package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.Categorie;
import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.enumm.StatutProduit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long>, JpaSpecificationExecutor<Produit> {

    // Existing methods (kept for backward compatibility)
    List<Produit> findByAnnonceurId(Long annonceurId);

    List<Produit> findByCategorieId(Long categorieId);

    long countByCategorie(Categorie categorie);

    List<Produit> findTop5ByOrderByCompteurVuesDesc();

    // New marketplace methods
    Page<Produit> findByBoutiqueId(Long boutiqueId, Pageable pageable);

    long countByBoutiqueId(Long boutiqueId);

    long countByBoutiqueIdAndStatutProduit(Long boutiqueId, StatutProduit statut);

    List<Produit> findByBoutiqueIdAndQuantiteStockLessThanEqual(Long boutiqueId, int threshold);

    @Modifying
    @Query("UPDATE Produit p SET p.compteurVues = p.compteurVues + 1 WHERE p.id = :id")
    void incrementCompteurVues(@Param("id") Long id);

    List<Produit> findTop8ByStatutProduitOrderByNombreVentesDesc(StatutProduit statut);

    Page<Produit> findByCategorieIdInAndStatutProduit(List<Long> categorieIds, StatutProduit statut, Pageable pageable);
}

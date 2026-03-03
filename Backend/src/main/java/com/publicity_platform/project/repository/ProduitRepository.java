package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.Categorie;
import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.enumm.StatutValidation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long> {
    List<Produit> findByStatutValidation(StatutValidation statut);

    long countByStatutValidation(StatutValidation statut);

    List<Produit> findByAnnonceurId(Long annonceurId);

    List<Produit> findByCategorieId(Long categorieId);

    List<Produit> findByAnnoncePremiumTrueAndStatutValidation(StatutValidation statut);

    long countByCategorie(Categorie categorie);

    List<Produit> findTop5ByOrderByCompteurVuesDesc();

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Produit p WHERE p.statutValidation = 'VALIDE' OR p.statutValidation = 'ACTIVEE' ORDER BY p.compteurVues DESC")
    List<Produit> findPopularValides(org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Produit p WHERE p.categorie.id = :catId AND p.id != :excludeId AND (p.statutValidation = 'VALIDE' OR p.statutValidation = 'ACTIVEE')")
    List<Produit> findByCategorieExcluding(@org.springframework.data.repository.query.Param("catId") Long catId,
            @org.springframework.data.repository.query.Param("excludeId") Long excludeId,
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Produit p WHERE p.statutValidation = 'VALIDE' OR p.statutValidation = 'ACTIVEE' ORDER BY p.datePublication DESC")
    List<Produit> findTopValidesForCandidats(org.springframework.data.domain.Pageable pageable);
}

package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.Categorie;
import com.publicity_platform.project.entity.Anonce;
import com.publicity_platform.project.enumm.StatutValidation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnonceRepository extends JpaRepository<Anonce, Long> {

    @EntityGraph(attributePaths = { "annonceur", "categorie", "produit" })
    List<Anonce> findAll();

    @EntityGraph(attributePaths = { "annonceur", "categorie", "produit" })
    List<Anonce> findByStatutValidation(StatutValidation statut);

    @EntityGraph(attributePaths = { "annonceur", "categorie", "produit" })
    List<Anonce> findByStatutValidationIn(List<StatutValidation> statuts);

    long countByStatutValidation(StatutValidation statut);

    @EntityGraph(attributePaths = { "annonceur", "categorie", "produit" })
    List<Anonce> findByAnnonceurId(Long annonceurId);

    @EntityGraph(attributePaths = { "annonceur", "categorie", "produit" })
    List<Anonce> findByCategorieId(Long categorieId);

    @EntityGraph(attributePaths = { "annonceur", "categorie", "produit" })
    List<Anonce> findByAnnoncePremiumTrueAndStatutValidation(StatutValidation statut);

    long countByCategorie(Categorie categorie);

    @EntityGraph(attributePaths = { "annonceur", "categorie", "produit" })
    List<Anonce> findTop5ByOrderByCompteurVuesDesc();
}
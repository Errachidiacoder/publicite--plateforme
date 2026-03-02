package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.Categorie;
import com.publicity_platform.project.entity.Anonce;
import com.publicity_platform.project.enumm.StatutValidation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnonceRepository extends JpaRepository<Anonce, Long> {
    List<Anonce> findByStatutValidation(StatutValidation statut);

    List<Anonce> findByStatutValidationIn(List<StatutValidation> statuts);

    long countByStatutValidation(StatutValidation statut);

    List<Anonce> findByAnnonceurId(Long annonceurId);

    List<Anonce> findByCategorieId(Long categorieId);

    List<Anonce> findByAnnoncePremiumTrueAndStatutValidation(StatutValidation statut);

    long countByCategorie(Categorie categorie);

    List<Anonce> findTop5ByOrderByCompteurVuesDesc();
}
package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.Categorie;
import com.publicity_platform.project.entity.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long> {

    List<Produit> findByAnnonceurId(Long annonceurId);

    List<Produit> findByCategorieId(Long categorieId);

    long countByCategorie(Categorie categorie);

    List<Produit> findTop5ByOrderByCompteurVuesDesc();

}

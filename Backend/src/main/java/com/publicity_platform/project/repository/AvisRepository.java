package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.Avis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvisRepository extends JpaRepository<Avis, Long> {

    List<Avis> findByProduitIdOrderByDateAvisDesc(Long produitId);

    List<Avis> findByUtilisateurId(Long utilisateurId);

    long countByProduitId(Long produitId);

    @Query("SELECT AVG(a.note) FROM Avis a WHERE a.produit.id = :produitId")
    Double findAverageNoteByProduitId(Long produitId);

    boolean existsByUtilisateurIdAndProduitIdAndCommandeId(Long utilisateurId, Long produitId, Long commandeId);

    boolean existsByUtilisateurIdAndProduitId(Long utilisateurId, Long produitId);
}

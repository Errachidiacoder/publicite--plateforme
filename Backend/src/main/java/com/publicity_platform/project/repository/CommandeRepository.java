package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.Commande;
import com.publicity_platform.project.enumm.StatutCommande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommandeRepository extends JpaRepository<Commande, Long> {

    List<Commande> findByAcheteurIdOrderByDatePassageCommandeDesc(Long acheteurId);

    List<Commande> findByStatutCommande(StatutCommande statut);

    List<Commande> findByLivreurId(Long livreurId);

    Optional<Commande> findByReferenceCommande(String reference);

    @Query("SELECT COUNT(c) FROM Commande c WHERE c.statutCommande = :statut")
    long countByStatut(StatutCommande statut);

    /** Commandes liées aux produits d'une boutique donnée */
    @Query("SELECT DISTINCT c FROM Commande c JOIN c.lignes l WHERE l.produitCommande.boutique.id = :boutiqueId ORDER BY c.datePassageCommande DESC")
    List<Commande> findByBoutiqueId(Long boutiqueId);
}

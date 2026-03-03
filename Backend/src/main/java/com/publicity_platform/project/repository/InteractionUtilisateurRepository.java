package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.InteractionUtilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InteractionUtilisateurRepository extends JpaRepository<InteractionUtilisateur, Long> {

    /**
     * Recommandations déjà calculées pour un utilisateur, triées par score
     * décroissant.
     * Utile pour afficher des recommandations pré-calculées (cache DB).
     */
    List<InteractionUtilisateur> findByUtilisateurCibleIdOrderByScoreAffiniteDesc(Long utilisateurId);

    /**
     * Recommandations par algorithme spécifique pour un utilisateur.
     */
    List<InteractionUtilisateur> findByUtilisateurCibleIdAndAlgorithmeUtilise(
            Long utilisateurId, String algorithme);
}

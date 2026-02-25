package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.Favoris;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FavorisRepository extends JpaRepository<Favoris, Long> {
    List<Favoris> findByUtilisateurId(Long utilisateurId);

    Optional<Favoris> findByUtilisateurIdAndProduitId(Long utilisateurId, Long produitId);

    void deleteByUtilisateurIdAndProduitId(Long utilisateurId, Long produitId);

    long countByUtilisateurId(Long utilisateurId);
}

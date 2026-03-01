package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.Panier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PanierRepository extends JpaRepository<Panier, Long> {

    Optional<Panier> findByUtilisateurId(Long utilisateurId);
}

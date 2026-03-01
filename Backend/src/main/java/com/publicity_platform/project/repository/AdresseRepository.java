package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.Adresse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdresseRepository extends JpaRepository<Adresse, Long> {

    List<Adresse> findByUtilisateurId(Long utilisateurId);

    Optional<Adresse> findByUtilisateurIdAndParDefautTrue(Long utilisateurId);
}

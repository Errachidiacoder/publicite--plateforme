package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.Boutique;
import com.publicity_platform.project.enumm.StatutBoutique;
import com.publicity_platform.project.enumm.TypeActivite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoutiqueRepository extends JpaRepository<Boutique, Long> {

    List<Boutique> findByStatutBoutique(StatutBoutique statut);

    List<Boutique> findByTypeActivite(TypeActivite type);

    Optional<Boutique> findByProprietaireId(Long proprietaireId);

    List<Boutique> findByVilleIgnoreCase(String ville);

    List<Boutique> findTop10ByStatutBoutiqueOrderByNoteMoyenneDesc(StatutBoutique statut);

    long countByStatutBoutique(StatutBoutique statut);
}

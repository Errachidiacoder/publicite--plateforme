package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.EtudeMarche;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EtudeRepository extends JpaRepository<EtudeMarche, Long> {

    List<EtudeMarche> findTop10ByOrderByScoreWinningDesc();

    List<EtudeMarche> findTop10ByOrderByVolumeRechercheDesc();

    List<EtudeMarche> findByCategorieCibleIgnoreCase(String categorie);
}

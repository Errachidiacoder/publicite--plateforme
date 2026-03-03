package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.ServiceOffre;
import com.publicity_platform.project.enumm.StatutService;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ServiceOffreRepository extends JpaRepository<ServiceOffre, Long> {

    @Override
    @EntityGraph(attributePaths = { "demandeur", "categorie" })
    List<ServiceOffre> findAll();

    @EntityGraph(attributePaths = { "demandeur", "categorie" })
    List<ServiceOffre> findByStatutService(StatutService statut);

    @EntityGraph(attributePaths = { "demandeur", "categorie" })
    List<ServiceOffre> findByDemandeurId(Long demandeurId);

    @EntityGraph(attributePaths = { "demandeur", "categorie" })
    java.util.Optional<ServiceOffre> findById(Long id);

    @EntityGraph(attributePaths = { "demandeur", "categorie" })
    List<ServiceOffre> findByVilleLocalisationContainingIgnoreCaseAndStatutServiceAndDatePublicationBetween(
            String ville, StatutService statut, LocalDateTime from, LocalDateTime to);

    @Query("select s from ServiceOffre s where s.statutService = :statut and " +
            "(coalesce(s.datePublication, s.dateSoumission) between :from and :to) and " +
            "lower(s.villeLocalisation) like lower(concat('%', :ville, '%')) " +
            "order by s.annoncePremium desc, coalesce(s.datePublication, s.dateSoumission) desc")
    @EntityGraph(attributePaths = { "demandeur", "categorie" })
    List<ServiceOffre> searchByVilleAndDate(String ville, StatutService statut, LocalDateTime from, LocalDateTime to);
}

package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.HistoriqueValidation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoriqueValidationRepository extends JpaRepository<HistoriqueValidation, Long> {
    List<HistoriqueValidation> findByProduitConcerneIdOrderByDateActionDesc(Long produitId);
}

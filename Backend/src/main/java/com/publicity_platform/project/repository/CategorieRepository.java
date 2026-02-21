package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategorieRepository extends JpaRepository<Categorie, Long> {
    List<Categorie> findByCategorieParenteIsNull(); // Root categories

    List<Categorie> findByCategorieActiveTrue();
}

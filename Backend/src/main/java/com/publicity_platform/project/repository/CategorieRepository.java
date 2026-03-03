package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategorieRepository extends JpaRepository<Categorie, Long> {

    Optional<Categorie> findBySlug(String slug);

    List<Categorie> findByCategorieParenteIsNull(); // Root categories

    List<Categorie> findByCategorieActiveTrue();

    List<Categorie> findByCategorieActiveTrueAndCategorieParenteIsNull();
}

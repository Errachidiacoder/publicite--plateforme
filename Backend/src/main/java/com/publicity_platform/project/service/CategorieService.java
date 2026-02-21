package com.publicity_platform.project.service;

import com.publicity_platform.project.entity.Categorie;
import com.publicity_platform.project.repository.CategorieRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategorieService {

    private final CategorieRepository repository;

    public CategorieService(CategorieRepository repository) {
        this.repository = repository;
    }

    public List<Categorie> getAllActiveCategories() {
        return repository.findByCategorieActiveTrue();
    }

    public List<Categorie> getAllCategories() {
        return repository.findAll();
    }

    public List<Categorie> getRootCategories() {
        return repository.findByCategorieParenteIsNull();
    }

    public Categorie saveCategorie(@NonNull Categorie categorie) {
        return repository.save(categorie);
    }

    public void deleteCategorie(@NonNull Long id) {
        repository.deleteById(id);
    }

    public Categorie getCategorieById(@NonNull Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
    }
}

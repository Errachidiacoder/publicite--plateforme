package com.publicity_platform.project.controller;

import com.publicity_platform.project.entity.Categorie;
import com.publicity_platform.project.service.CategorieService;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import java.util.Objects;

@RestController
@RequestMapping("/api/v1/categories")
public class CategorieController {

    private final CategorieService service;

    public CategorieController(CategorieService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Categorie>> getAllActive() {
        return ResponseEntity.ok(service.getAllActiveCategories());
    }

    @GetMapping("/roots")
    public ResponseEntity<List<Categorie>> getRootCategories() {
        return ResponseEntity.ok(service.getRootCategories());
    }

    @PostMapping
    public ResponseEntity<Categorie> create(@RequestBody @NonNull Categorie categorie) {
        return ResponseEntity.ok(service.saveCategorie(Objects.requireNonNull(categorie)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Categorie> getById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(service.getCategorieById(Objects.requireNonNull(id)));
    }
}

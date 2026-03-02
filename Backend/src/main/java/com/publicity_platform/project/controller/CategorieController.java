package com.publicity_platform.project.controller;

import com.publicity_platform.project.dto.CategorieDto;
import com.publicity_platform.project.entity.Categorie;
import com.publicity_platform.project.service.CategorieService;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/categories")
public class CategorieController {

    private final CategorieService service;

    public CategorieController(CategorieService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<CategorieDto>> getAllActive() {
        return ResponseEntity.ok(service.getAllActiveCategories().stream()
                .map(CategorieDto::fromEntity)
                .collect(Collectors.toList()));
    }

    @GetMapping("/roots")
    public ResponseEntity<List<CategorieDto>> getRootCategories() {
        return ResponseEntity.ok(service.getRootCategories().stream()
                .map(CategorieDto::fromEntity)
                .collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<CategorieDto> create(@RequestBody @NonNull Categorie categorie) {
        Categorie saved = service.saveCategorie(Objects.requireNonNull(categorie));
        return ResponseEntity.ok(CategorieDto.fromEntity(saved));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategorieDto> getById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(CategorieDto.fromEntity(service.getCategorieById(Objects.requireNonNull(id))));
    }
}

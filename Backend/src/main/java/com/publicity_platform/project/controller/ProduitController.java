package com.publicity_platform.project.controller;

import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.service.ProduitService;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/produits")
public class ProduitController {

    private final ProduitService service;

    public ProduitController(ProduitService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Produit>> getAllActive() {
        return ResponseEntity.ok(service.getAllActiveProducts());
    }

    @PostMapping("/submit")
    public ResponseEntity<Produit> submit(
            @RequestBody Produit produit,
            @AuthenticationPrincipal Utilisateur currentUser) {
        produit.setAnnonceur(currentUser);
        return ResponseEntity.ok(service.submitProduct(produit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produit> getById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(service.getProductById(id));
    }

    @PostMapping("/{id}/activate-mock")
    public ResponseEntity<Produit> activateProductMock(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(service.activateProduct(id));
    }

}

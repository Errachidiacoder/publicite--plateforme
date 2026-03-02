package com.publicity_platform.project.controller;

import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.dto.ProduitDto;
import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.service.ProduitService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.publicity_platform.project.service.AnonceService;

@RestController
@RequestMapping("/api/v1/produits")
public class ProduitController {

    private static final Logger log = LoggerFactory.getLogger(ProduitController.class);
    private final ProduitService service;
    private final AnonceService anonceService;

    public ProduitController(ProduitService service, AnonceService anonceService) {
        this.service = service;
        this.anonceService = anonceService;
    }

    @GetMapping
    public ResponseEntity<List<ProduitDto>> getAll() {
        return ResponseEntity.ok(service.getAllProducts());
    }

    @PostMapping("/submit")
    public ResponseEntity<ProduitDto> create(
            @RequestBody Produit produit,
            @AuthenticationPrincipal Utilisateur currentUser) {
        log.info("Receiving product creation request: {}", produit.getTitreProduit());
        if (currentUser != null) {
            log.info("Current user: {} (ID: {})", currentUser.getNomComplet(), currentUser.getId());
            produit.setAnnonceur(currentUser);
        }
        
        ProduitDto createdProduct = service.createProductDto(produit);
        anonceService.createAnonceFromProduct(service.getProductById(createdProduct.getId()));
        
        return ResponseEntity.ok(createdProduct);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProduitDto> getById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(service.getProductDtoById(id));
    }

    @GetMapping("/annonceur/{id}")
    public ResponseEntity<List<ProduitDto>> getByAnnonceur(
            @PathVariable @NonNull Long id) {
        return ResponseEntity.ok(service.getProductsByAnnonceur(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProduitDto> update(@PathVariable @NonNull Long id,
            @RequestBody Produit produit) {
        return ResponseEntity.ok(service.updateProduct(id, produit));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @NonNull Long id) {
        service.deleteProduct(id);
        return ResponseEntity.ok().build();
    }
}

package com.publicity_platform.project.controller;

import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.dto.ProduitDto;
import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.enumm.StatutValidation;
import com.publicity_platform.project.service.ProduitService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/produits")
public class ProduitController {

    private static final Logger log = LoggerFactory.getLogger(ProduitController.class);
    private final ProduitService service;

    public ProduitController(ProduitService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ProduitDto>> getAllActive() {
        return ResponseEntity.ok(service.getAllActiveProducts());
    }

    @PostMapping("/submit")
    public ResponseEntity<ProduitDto> submit(
            @RequestBody Produit produit,
            @AuthenticationPrincipal Utilisateur currentUser) {
        log.info("Receiving product submission request: {}", produit.getTitreProduit());
        if (currentUser != null) {
            log.info("Current user: {} (ID: {})", currentUser.getNomComplet(), currentUser.getId());
            produit.setAnnonceur(currentUser);
        }
        return ResponseEntity.ok(service.submitProductDto(produit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProduitDto> getById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(service.getProductDtoById(id));
    }

    @PostMapping("/{id}/activate-mock")
    public ResponseEntity<ProduitDto> activateProductMock(
            @PathVariable @NonNull Long id) {
        return ResponseEntity.ok(service.activateProductDto(id));
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

    @PostMapping("/{id}/archive-mock")
    public ResponseEntity<Void> archiveMock(@PathVariable @NonNull Long id) {
        // En prod on passerait l'admin actuel, ici on simule
        service.archiveProduct(id, null);
        return ResponseEntity.ok().build();
    }
}

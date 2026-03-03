package com.publicity_platform.project.controller;

import com.publicity_platform.project.dto.*;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.enumm.StatutProduit;
import com.publicity_platform.project.service.ProduitService;
import com.publicity_platform.project.service.ProductImageService;
import com.publicity_platform.project.service.AnonceService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class ProduitController {

    private static final Logger log = LoggerFactory.getLogger(ProduitController.class);
    private final ProduitService service;
    private final ProductImageService imageService;
    private final AnonceService anonceService;

    public ProduitController(ProduitService service,
            ProductImageService imageService,
            AnonceService anonceService) {
        this.service = service;
        this.imageService = imageService;
        this.anonceService = anonceService;
    }

    // ═══════════════════════════════════════════════════════
    // PUBLIC ENDPOINTS (no auth required)
    // ═══════════════════════════════════════════════════════

    @GetMapping("/produits")
    public ResponseEntity<Page<ProduitResponseDto>> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categorieId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String merchantType,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        ProductFilterRequest filter = new ProductFilterRequest();
        filter.setKeyword(keyword);
        filter.setCategorieId(categorieId);
        filter.setMinPrice(minPrice);
        filter.setMaxPrice(maxPrice);
        filter.setMerchantType(merchantType);
        filter.setSort(sort);
        filter.setPage(page);
        filter.setSize(size);

        return ResponseEntity.ok(service.searchProducts(filter));
    }

    @GetMapping("/produits/{id}")
    public ResponseEntity<ProduitResponseDto> getProductById(@PathVariable @NonNull Long id) {
        ProduitResponseDto dto = service.getMarketProductById(id);
        // Track view asynchronously
        try {
            service.trackView(id);
        } catch (Exception e) {
            log.warn("Erreur lors du suivi des vues pour le produit {}", id);
        }
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/produits/by-category/{slug}")
    public ResponseEntity<Page<ProduitResponseDto>> getByCategory(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(service.getProductsByCategory(slug, pageable));
    }

    @GetMapping("/produits/featured")
    public ResponseEntity<List<ProduitResponseDto>> getFeatured() {
        return ResponseEntity.ok(service.getFeaturedProducts());
    }

    // ─── Legacy endpoints (backward compatibility) ───

    @GetMapping("/produits/all")
    public ResponseEntity<List<ProduitDto>> getAll() {
        return ResponseEntity.ok(service.getAllProducts());
    }

    @PostMapping("/produits/submit")
    public ResponseEntity<ProduitDto> legacyCreate(
            @RequestBody com.publicity_platform.project.entity.Produit produit,
            @AuthenticationPrincipal Utilisateur currentUser) {
        log.info("Legacy product creation: {}", produit.getTitreProduit());
        if (currentUser != null) {
            produit.setAnnonceur(currentUser);
        }
        ProduitDto createdProduct = service.createProductDto(produit);
        anonceService.createAnonceFromProduct(service.getProductById(createdProduct.getId()));
        return ResponseEntity.ok(createdProduct);
    }

    @GetMapping("/produits/annonceur/{id}")
    public ResponseEntity<List<ProduitDto>> getByAnnonceur(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(service.getProductsByAnnonceur(id));
    }

    // ═══════════════════════════════════════════════════════
    // MERCHANT ENDPOINTS (requires authentication)
    // ═══════════════════════════════════════════════════════

    @GetMapping("/merchant/produits")
    public ResponseEntity<Page<ProduitMerchantDto>> getMerchantProducts(
            @AuthenticationPrincipal Utilisateur currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(service.getMerchantProducts(currentUser.getId(), pageable));
    }

    @PostMapping("/merchant/produits")
    public ResponseEntity<ProduitResponseDto> createProduct(
            @Valid @RequestBody ProduitRequestDto dto,
            @AuthenticationPrincipal Utilisateur currentUser) {
        log.info("Création produit marketplace par l'utilisateur {}", currentUser.getId());
        return ResponseEntity.ok(service.createMarketProduct(dto, currentUser.getId()));
    }

    @PutMapping("/merchant/produits/{id}")
    public ResponseEntity<ProduitResponseDto> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProduitRequestDto dto,
            @AuthenticationPrincipal Utilisateur currentUser) {
        return ResponseEntity.ok(service.updateMarketProduct(id, dto, currentUser.getId()));
    }

    @DeleteMapping("/merchant/produits/{id}")
    public ResponseEntity<Void> archiveProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal Utilisateur currentUser) {
        service.updateStatut(id, StatutProduit.ARCHIVED, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/merchant/produits/{id}/statut")
    public ResponseEntity<Void> changeStatut(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Utilisateur currentUser) {
        String statutStr = body.get("statut");
        if (statutStr == null || statutStr.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        StatutProduit newStatut = StatutProduit.valueOf(statutStr);
        service.updateStatut(id, newStatut, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    // ═══════════════════════════════════════════════════════
    // IMAGE ENDPOINTS (merchant only)
    // ═══════════════════════════════════════════════════════

    @PostMapping("/merchant/produits/{id}/images")
    public ResponseEntity<List<ProductImageDto>> uploadImages(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal Utilisateur currentUser) {
        return ResponseEntity.ok(imageService.uploadImages(id, files, currentUser.getId()));
    }

    @DeleteMapping("/merchant/produits/{produitId}/images/{imageId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long produitId,
            @PathVariable Long imageId,
            @AuthenticationPrincipal Utilisateur currentUser) {
        imageService.deleteImage(produitId, imageId, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/merchant/produits/{produitId}/images/{imageId}/primary")
    public ResponseEntity<Void> setPrimaryImage(
            @PathVariable Long produitId,
            @PathVariable Long imageId,
            @AuthenticationPrincipal Utilisateur currentUser) {
        imageService.setPrimary(produitId, imageId, currentUser.getId());
        return ResponseEntity.ok().build();
    }
}

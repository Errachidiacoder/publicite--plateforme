package com.publicity_platform.project.controller;

import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.repository.UtilisateurRepository;
import com.publicity_platform.project.service.ProduitService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/produits")
public class ProduitController {

    private static final Logger log = LoggerFactory.getLogger(ProduitController.class);

    private final ProduitService service;
    private final UtilisateurRepository utilisateurRepository;

    public ProduitController(ProduitService service, UtilisateurRepository utilisateurRepository) {
        this.service = service;
        this.utilisateurRepository = utilisateurRepository;
    }

    @GetMapping
    public ResponseEntity<List<Produit>> getAllActive() {
        return ResponseEntity.ok(service.getAllActiveProducts());
    }

    /**
     * Returns the authenticated user's own products.
     * Reads from SecurityContextHolder — populated by JwtAuthenticationFilter
     * even on permitAll() routes when a valid Bearer token is present.
     */
    @GetMapping("/active")
    public ResponseEntity<List<Produit>> getMyProducts() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            log.warn("GET /active: no authenticated user in SecurityContext");
            return ResponseEntity.status(401).build();
        }
        String email = auth.getName();
        Utilisateur user = utilisateurRepository.findByAdresseEmail(email).orElse(null);
        if (user == null || user.getId() == null) {
            log.warn("GET /active: user not found for email={}", email);
            return ResponseEntity.status(401).build();
        }
        log.info("GET /active: loading products for user={}", email);
        return ResponseEntity.ok(service.getProductsByAnnonceur(user.getId()));
    }

    @GetMapping("/auth-test")
    public ResponseEntity<Map<String, Object>> authTest(@AuthenticationPrincipal Utilisateur currentUser) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("Auth test: authentication={}, user={}", auth, currentUser);
        return ResponseEntity.ok(Map.of(
                "authenticated", auth != null && auth.isAuthenticated(),
                "principal", auth != null ? auth.getName() : "none",
                "authorities", auth != null ? auth.getAuthorities().toString() : "none",
                "userPresent", currentUser != null));
    }

    @PostMapping("/submit")
    public ResponseEntity<Produit> submit(
            @RequestBody Produit produit,
            @AuthenticationPrincipal Utilisateur currentUser) {
        log.info("Submit product: user={}, produit.titre={}", currentUser, produit.getTitreProduit());
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

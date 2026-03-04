package com.publicity_platform.project.controller;

import com.publicity_platform.project.dto.PanierDto;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.service.PanierService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/panier")
public class PanierController {

    private final PanierService service;

    public PanierController(PanierService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<PanierDto> getMonPanier(@AuthenticationPrincipal Utilisateur user) {
        return ResponseEntity.ok(service.getPanierDto(user));
    }

    @PostMapping("/ajouter")
    public ResponseEntity<PanierDto> ajouterAuPanier(
            @AuthenticationPrincipal Utilisateur user,
            @RequestBody Map<String, Object> body) {
        Long produitId = Long.valueOf(body.get("produitId").toString());
        int quantite = body.containsKey("quantite") ? Integer.parseInt(body.get("quantite").toString()) : 1;
        return ResponseEntity.ok(service.ajouterAuPanier(user, produitId, quantite));
    }

    @PutMapping("/modifier")
    public ResponseEntity<PanierDto> modifierQuantite(
            @AuthenticationPrincipal Utilisateur user,
            @RequestBody Map<String, Object> body) {
        Long produitId = Long.valueOf(body.get("produitId").toString());
        int quantite = Integer.parseInt(body.get("quantite").toString());
        return ResponseEntity.ok(service.modifierQuantite(user, produitId, quantite));
    }

    @DeleteMapping("/supprimer/{produitId}")
    public ResponseEntity<PanierDto> supprimerDuPanier(
            @AuthenticationPrincipal Utilisateur user,
            @PathVariable Long produitId) {
        return ResponseEntity.ok(service.supprimerDuPanier(user, produitId));
    }

    @DeleteMapping("/vider")
    public ResponseEntity<PanierDto> viderPanier(@AuthenticationPrincipal Utilisateur user) {
        return ResponseEntity.ok(service.viderPanier(user));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Integer>> getCartCount(@AuthenticationPrincipal Utilisateur user) {
        int count = service.getCartCount(user);
        return ResponseEntity.ok(Map.of("count", count));
    }
}

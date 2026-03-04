package com.publicity_platform.project.controller;

import com.publicity_platform.project.dto.AvisResponseDto;
import com.publicity_platform.project.entity.Avis;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.service.AvisService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/avis")
public class AvisController {

    private final AvisService service;

    public AvisController(AvisService service) {
        this.service = service;
    }

    /** Lister les avis d'un produit (public, returns DTOs with user names) */
    @GetMapping("/produit/{produitId}")
    public ResponseEntity<List<AvisResponseDto>> getAvisProduit(@PathVariable Long produitId) {
        return ResponseEntity.ok(service.getAvisProduitDto(produitId));
    }

    /** Check if current user can review a product */
    @GetMapping("/can-review/{produitId}")
    public ResponseEntity<Map<String, Object>> canReview(
            @AuthenticationPrincipal Utilisateur user,
            @PathVariable Long produitId) {
        Long commandeId = service.canClientReview(user.getId(), produitId);
        if (commandeId != null) {
            return ResponseEntity.ok(Map.of("canReview", true, "commandeId", commandeId));
        } else {
            return ResponseEntity.ok(Map.of("canReview", false));
        }
    }

    /** Laisser un avis sur un produit (with eligibility check) */
    @PostMapping
    public ResponseEntity<Avis> creerAvis(
            @AuthenticationPrincipal Utilisateur user,
            @RequestBody Map<String, Object> body) {
        Long produitId = Long.valueOf(body.get("produitId").toString());
        int note = Integer.parseInt(body.get("note").toString());
        String commentaire = body.containsKey("commentaire") ? body.get("commentaire").toString() : "";
        Long commandeId = body.containsKey("commandeId") ? Long.valueOf(body.get("commandeId").toString()) : null;

        Avis avis;
        if (commandeId != null) {
            avis = service.creerAvis(produitId, user, note, commentaire, commandeId);
        } else {
            avis = service.creerAvis(produitId, user, note, commentaire);
        }
        return ResponseEntity.ok(avis);
    }

    /** Mes avis */
    @GetMapping("/mes-avis")
    public ResponseEntity<List<Avis>> mesAvis(@AuthenticationPrincipal Utilisateur user) {
        return ResponseEntity.ok(service.getAvisUtilisateur(user.getId()));
    }
}

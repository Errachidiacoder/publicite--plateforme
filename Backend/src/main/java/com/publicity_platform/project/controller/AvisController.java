package com.publicity_platform.project.controller;

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

    /** Lister les avis d'un produit (public) */
    @GetMapping("/produit/{produitId}")
    public ResponseEntity<List<Avis>> getAvisProduit(@PathVariable Long produitId) {
        return ResponseEntity.ok(service.getAvisProduit(produitId));
    }

    /** Laisser un avis sur un produit */
    @PostMapping
    public ResponseEntity<Avis> creerAvis(
            @AuthenticationPrincipal Utilisateur user,
            @RequestBody Map<String, Object> body) {
        Long produitId = Long.valueOf(body.get("produitId").toString());
        int note = Integer.parseInt(body.get("note").toString());
        String commentaire = body.containsKey("commentaire") ? body.get("commentaire").toString() : "";
        return ResponseEntity.ok(service.creerAvis(produitId, user, note, commentaire));
    }

    /** Mes avis */
    @GetMapping("/mes-avis")
    public ResponseEntity<List<Avis>> mesAvis(@AuthenticationPrincipal Utilisateur user) {
        return ResponseEntity.ok(service.getAvisUtilisateur(user.getId()));
    }
}

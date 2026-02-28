package com.publicity_platform.project.controller;

import com.publicity_platform.project.entity.Panier;
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
    public ResponseEntity<Panier> getMonPanier(@AuthenticationPrincipal Utilisateur user) {
        return ResponseEntity.ok(service.getPanierUtilisateur(user));
    }

    @PostMapping("/ajouter")
    public ResponseEntity<Panier> ajouterAuPanier(
            @AuthenticationPrincipal Utilisateur user,
            @RequestBody Map<String, Object> body) {
        Long produitId = Long.valueOf(body.get("produitId").toString());
        int quantite = body.containsKey("quantite") ? Integer.parseInt(body.get("quantite").toString()) : 1;
        return ResponseEntity.ok(service.ajouterAuPanier(user, produitId, quantite));
    }

    @PutMapping("/modifier")
    public ResponseEntity<Panier> modifierQuantite(
            @AuthenticationPrincipal Utilisateur user,
            @RequestBody Map<String, Object> body) {
        Long produitId = Long.valueOf(body.get("produitId").toString());
        int quantite = Integer.parseInt(body.get("quantite").toString());
        return ResponseEntity.ok(service.modifierQuantite(user, produitId, quantite));
    }

    @DeleteMapping("/supprimer/{produitId}")
    public ResponseEntity<Panier> supprimerDuPanier(
            @AuthenticationPrincipal Utilisateur user,
            @PathVariable Long produitId) {
        return ResponseEntity.ok(service.supprimerDuPanier(user, produitId));
    }

    @DeleteMapping("/vider")
    public ResponseEntity<Panier> viderPanier(@AuthenticationPrincipal Utilisateur user) {
        return ResponseEntity.ok(service.viderPanier(user));
    }
}

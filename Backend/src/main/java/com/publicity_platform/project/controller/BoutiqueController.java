package com.publicity_platform.project.controller;

import com.publicity_platform.project.entity.Boutique;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.service.BoutiqueService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/boutiques")
public class BoutiqueController {

    private final BoutiqueService service;

    public BoutiqueController(BoutiqueService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Boutique>> getBoutiquesActives() {
        return ResponseEntity.ok(service.getBoutiquesActives());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Boutique> getBoutiqueById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getBoutiqueById(id));
    }

    @GetMapping("/ma-boutique")
    public ResponseEntity<Boutique> getMaBoutique(@AuthenticationPrincipal Utilisateur user) {
        Boutique boutique = service.getBoutiqueByProprietaire(user.getId());
        if (boutique == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(boutique);
    }

    @PostMapping
    public ResponseEntity<Boutique> creerBoutique(
            @RequestBody Boutique boutique,
            @AuthenticationPrincipal Utilisateur user) {
        return ResponseEntity.ok(service.creerBoutique(boutique, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Boutique> modifierBoutique(
            @PathVariable Long id,
            @RequestBody Boutique boutique,
            @AuthenticationPrincipal Utilisateur user) {
        return ResponseEntity.ok(service.modifierBoutique(id, boutique, user));
    }

    @GetMapping("/top")
    public ResponseEntity<List<Boutique>> getTopBoutiques() {
        return ResponseEntity.ok(service.getTopBoutiques());
    }

    /** Routes admin : activer ou suspendre une boutique */
    @PutMapping("/{id}/activer")
    public ResponseEntity<Boutique> activerBoutique(@PathVariable Long id) {
        return ResponseEntity.ok(service.activerBoutique(id));
    }

    @PutMapping("/{id}/suspendre")
    public ResponseEntity<Boutique> suspendreBoutique(@PathVariable Long id) {
        return ResponseEntity.ok(service.suspendreBoutique(id));
    }
}

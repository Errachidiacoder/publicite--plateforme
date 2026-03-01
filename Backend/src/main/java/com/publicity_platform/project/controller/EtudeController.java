package com.publicity_platform.project.controller;

import com.publicity_platform.project.service.EtudeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/etude")
public class EtudeController {

    private final EtudeService service;

    public EtudeController(EtudeService service) {
        this.service = service;
    }

    /** Produits les plus vendus avec score "winning" */
    @GetMapping("/winning-products")
    public ResponseEntity<List<Map<String, Object>>> getWinningProducts() {
        return ResponseEntity.ok(service.getWinningProducts());
    }

    /** Tendances par catégorie */
    @GetMapping("/tendances")
    public ResponseEntity<List<Map<String, Object>>> getTendances() {
        return ResponseEntity.ok(service.getTendancesCategories());
    }

    /** Analyse des besoins clients (villes, produits recherchés) */
    @GetMapping("/besoins-clients")
    public ResponseEntity<Map<String, Object>> getBesoinsClients() {
        return ResponseEntity.ok(service.getBesoinsClients());
    }
}

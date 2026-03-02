package com.publicity_platform.project.controller;

import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.dto.AnonceDto;
import com.publicity_platform.project.entity.Anonce;
import com.publicity_platform.project.enumm.StatutValidation;
import com.publicity_platform.project.service.AnonceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/anonces")
public class AnonceController {

    private static final Logger log = LoggerFactory.getLogger(AnonceController.class);
    private final AnonceService service;

    public AnonceController(AnonceService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<AnonceDto>> getAllActive() {
        return ResponseEntity.ok(service.getAllActiveAnonces());
    }

    @PostMapping("/submit")
    public ResponseEntity<AnonceDto> submit(
            @RequestBody Anonce anonce,
            @AuthenticationPrincipal Utilisateur currentUser) {
        log.info("Receiving anonce submission request: {}", anonce.getTitreAnonce());
        if (currentUser != null) {
            log.info("Current user: {} (ID: {})", currentUser.getNomComplet(), currentUser.getId());
            anonce.setAnnonceur(currentUser);
        }
        return ResponseEntity.ok(service.submitAnonceDto(anonce));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnonceDto> getById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(service.getAnonceDtoById(id));
    }

    @PostMapping("/{id}/activate-mock")
    public ResponseEntity<AnonceDto> activateAnonceMock(
            @PathVariable @NonNull Long id) {
        return ResponseEntity.ok(service.activateAnonceDto(id));
    }

    @GetMapping("/annonceur/{id}")
    public ResponseEntity<List<AnonceDto>> getByAnnonceur(
            @PathVariable @NonNull Long id) {
        return ResponseEntity.ok(service.getAnoncesByAnnonceur(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnonceDto> update(@PathVariable @NonNull Long id,
            @RequestBody Anonce anonce) {
        return ResponseEntity.ok(service.updateAnonce(id, anonce));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @NonNull Long id) {
        service.deleteAnonce(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/archive-mock")
    public ResponseEntity<Void> archiveMock(@PathVariable @NonNull Long id) {
        // En prod on passerait l'admin actuel, ici on simule
        service.archiveAnonce(id, null);
        return ResponseEntity.ok().build();
    }
}

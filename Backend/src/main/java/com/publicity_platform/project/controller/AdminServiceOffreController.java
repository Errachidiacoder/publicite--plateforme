package com.publicity_platform.project.controller;

import com.publicity_platform.project.entity.ServiceOffre;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.enumm.StatutService;
import com.publicity_platform.project.service.ServiceOffreService;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/services")
public class AdminServiceOffreController {

    private final ServiceOffreService service;

    public AdminServiceOffreController(ServiceOffreService service) {
        this.service = service;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ServiceOffre>> getPending() {
        return ResponseEntity.ok(service.getPending());
    }

    @GetMapping
    public ResponseEntity<List<ServiceOffre>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<ServiceOffre> validate(@PathVariable @NonNull Long id,
                                                 @RequestParam(defaultValue = "1") int durationMonths,
                                                 @AuthenticationPrincipal Utilisateur admin) {
        return ResponseEntity.ok(service.validateService(id, durationMonths, admin));
    }

    @PostMapping("/{id}/payment/proceed")
    public ResponseEntity<ServiceOffre> proceedPayment(@PathVariable @NonNull Long id,
                                                       @AuthenticationPrincipal Utilisateur admin) {
        return ResponseEntity.ok(service.proceedToPayment(id, admin));
    }

    @PostMapping("/{id}/payment/validate")
    public ResponseEntity<ServiceOffre> validatePayment(@PathVariable @NonNull Long id,
                                                        @AuthenticationPrincipal Utilisateur admin) {
        return ResponseEntity.ok(service.validatePayment(id, admin));
    }
    
    @PostMapping("/{id}/payment/skip")
    public ResponseEntity<ServiceOffre> activateWithoutPayment(@PathVariable @NonNull Long id,
                                                               @AuthenticationPrincipal Utilisateur admin) {
        return ResponseEntity.ok(service.activateWithoutPayment(id, admin));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ServiceOffre> reject(@PathVariable @NonNull Long id,
                                               @RequestBody Map<String, String> payload,
                                               @AuthenticationPrincipal Utilisateur admin) {
        String reason = payload.getOrDefault("reason", "Motif non précisé");
        return ResponseEntity.ok(service.rejectService(id, reason, admin));
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<ServiceOffre> archive(@PathVariable @NonNull Long id,
                                                @AuthenticationPrincipal Utilisateur admin) {
        return ResponseEntity.ok(service.archiveService(id, admin));
    }

    @PostMapping("/{id}/feature")
    public ResponseEntity<ServiceOffre> feature(@PathVariable @NonNull Long id,
                                                @RequestParam(defaultValue = "true") boolean premium,
                                                @AuthenticationPrincipal Utilisateur admin) {
        return ResponseEntity.ok(service.featureService(id, premium, admin));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceOffre> update(@PathVariable @NonNull Long id,
                                               @RequestBody ServiceOffre payload,
                                               @AuthenticationPrincipal Utilisateur admin) {
        return ResponseEntity.ok(service.updateService(id, payload, admin));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @NonNull Long id,
                                       @AuthenticationPrincipal Utilisateur admin) {
        service.deleteService(id, admin);
        return ResponseEntity.ok().build();
    }
}

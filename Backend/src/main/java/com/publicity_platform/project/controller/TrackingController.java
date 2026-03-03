package com.publicity_platform.project.controller;

import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.service.HistoriqueNavigationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/navigation")
@CrossOrigin(origins = "*")
public class TrackingController {

    private final HistoriqueNavigationService historiqueNavigationService;

    public TrackingController(HistoriqueNavigationService historiqueNavigationService) {
        this.historiqueNavigationService = historiqueNavigationService;
    }

    /**
     * Endpoint de tracking appelé par le frontend (ngOnDestroy du composant
     * produit).
     * Enregistre la consultation et la durée passée sur la page.
     *
     * Body attendu :
     * {
     * "produitId": 42,
     * "dureeSecondes": 35,
     * "source": "DIRECT" (optionnel, défaut: "DIRECT")
     * }
     *
     * POST /api/v1/navigation/track
     */
    @PostMapping("/track")
    public ResponseEntity<Void> track(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Utilisateur utilisateur) {

        Long produitId = body.get("produitId") != null
                ? Long.valueOf(body.get("produitId").toString())
                : null;

        Integer dureeSecondes = body.get("dureeSecondes") != null
                ? Integer.valueOf(body.get("dureeSecondes").toString())
                : 0;

        String source = body.get("source") != null
                ? body.get("source").toString()
                : "DIRECT";

        if (produitId == null) {
            return ResponseEntity.badRequest().build();
        }

        historiqueNavigationService.enregistrerConsultation(produitId, dureeSecondes, utilisateur, source);
        return ResponseEntity.ok().build();
    }
}

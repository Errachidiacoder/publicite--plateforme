package com.publicity_platform.project.controller;

import com.publicity_platform.project.dto.ProduitResponseDto;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.enumm.EventType;
import com.publicity_platform.project.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    /**
     * GET /api/v1/recommendations/for-me?limit=8
     * Returns personalized recommendations for the authenticated user.
     */
    @GetMapping("/for-me")
    public ResponseEntity<List<ProduitResponseDto>> getForMe(
            @AuthenticationPrincipal Utilisateur currentUser,
            @RequestParam(defaultValue = "8") int limit) {
        List<ProduitResponseDto> recs = recommendationService.getPersonalized(currentUser.getId(), limit);
        return ResponseEntity.ok(recs);
    }

    /**
     * GET /api/v1/recommendations/popular?limit=8
     * Public endpoint — returns top products by sales & views.
     */
    @GetMapping("/popular")
    public ResponseEntity<List<ProduitResponseDto>> getPopular(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(recommendationService.getPopular(limit));
    }

    /**
     * POST /api/v1/recommendations/track
     * Body: { produitId, eventType, durationSec }
     * Tracks a user interaction for future recommendations.
     */
    @PostMapping("/track")
    public ResponseEntity<Void> track(
            @AuthenticationPrincipal Utilisateur currentUser,
            @RequestBody Map<String, Object> body) {
        Long produitId = Long.valueOf(body.get("produitId").toString());
        EventType type = EventType.valueOf(body.getOrDefault("eventType", "VIEW").toString());
        Integer duration = body.containsKey("durationSec")
                ? Integer.valueOf(body.get("durationSec").toString())
                : null;
        recommendationService.trackEvent(currentUser.getId(), produitId, type, duration);
        return ResponseEntity.ok().build();
    }
}

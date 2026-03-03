package com.publicity_platform.project.controller;

import com.publicity_platform.project.dto.ProduitRecommandationDTO;
import com.publicity_platform.project.service.RecommandationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommandationController {

    private final RecommandationService recommandationService;

    public RecommandationController(RecommandationService recommandationService) {
        this.recommandationService = recommandationService;
    }

    @PostMapping("/track/{productId}")
    public ResponseEntity<Void> trackView(@PathVariable Long productId) {
        recommandationService.trackView(productId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/similar/{productId}")
    public ResponseEntity<List<ProduitRecommandationDTO>> getSimilar(@PathVariable Long productId) {
        return ResponseEntity.ok(recommandationService.getSimilarProducts(productId));
    }

    @GetMapping("/popular")
    public ResponseEntity<List<ProduitRecommandationDTO>> getPopular(@RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(recommandationService.getPopularProducts(limit));
    }

    @PostMapping("/personalized")
    public ResponseEntity<List<ProduitRecommandationDTO>> getPersonalized(@RequestBody List<Long> viewedIds) {
        return ResponseEntity.ok(recommandationService.getPersonalized(viewedIds));
    }
}

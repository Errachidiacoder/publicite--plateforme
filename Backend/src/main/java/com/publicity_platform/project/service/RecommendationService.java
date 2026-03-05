package com.publicity_platform.project.service;

import com.publicity_platform.project.dto.ProduitResponseDto;
import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.entity.UserProductEvent;
import com.publicity_platform.project.enumm.EventType;
import com.publicity_platform.project.enumm.StatutProduit;
import com.publicity_platform.project.repository.ProduitRepository;
import com.publicity_platform.project.repository.UserProductEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private static final Logger log = LoggerFactory.getLogger(RecommendationService.class);

    private final RecommendationEngine engine;
    private final ProduitRepository produitRepository;
    private final UserProductEventRepository eventRepository;
    private final ProduitService produitService;

    public RecommendationService(RecommendationEngine engine,
            ProduitRepository produitRepository,
            UserProductEventRepository eventRepository,
            ProduitService produitService) {
        this.engine = engine;
        this.produitRepository = produitRepository;
        this.eventRepository = eventRepository;
        this.produitService = produitService;
    }

    // ── Personalized recommendations ─────────────────────────────

    /**
     * Returns personalized recommendations for a logged-in user.
     * Falls back to popular products if the user has no history or the
     * ML model is not ready.
     */
    public List<ProduitResponseDto> getPersonalized(Long userId, int limit) {
        List<Long> ids = engine.getRecommendations(userId, limit);
        if (ids.isEmpty()) {
            log.debug("No ML recommendations for user {} — falling back to popular", userId);
            return getPopular(limit);
        }
        List<Produit> products = produitRepository.findAllById(ids);
        return products.stream()
                .map(p -> produitService.toResponseDto(p))
                .collect(Collectors.toList());
    }

    // ── Popular fallback ──────────────────────────────────────────

    /**
     * Top products by sales + views — used for anonymous users or as fallback.
     */
    public List<ProduitResponseDto> getPopular(int limit) {
        return produitRepository
                .findTop8ByStatutProduitOrderByNombreVentesDesc(StatutProduit.ACTIVE)
                .stream()
                .limit(limit)
                .map(p -> produitService.toResponseDto(p))
                .collect(Collectors.toList());
    }

    // ── Event tracking ────────────────────────────────────────────

    @Transactional
    public void trackEvent(Long userId, Long produitId, EventType eventType, Integer durationSec) {
        UserProductEvent event = new UserProductEvent();
        event.setUserId(userId);
        event.setProduitId(produitId);
        event.setEventType(eventType);
        event.setDurationSec(durationSec);
        eventRepository.save(event);
        log.debug("Tracked {} event: user={} produit={} duration={}s",
                eventType, userId, produitId, durationSec);
    }
}

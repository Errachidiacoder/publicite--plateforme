package com.publicity_platform.project.service;

import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.enumm.StatutProduit;
import com.publicity_platform.project.repository.ProduitRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Core recommendation service for Produit entities.
 *
 * Two modes:
 * 1. HuggingFace embeddings (when hf token is set) — semantic similarity
 * 2. Local scoring engine (default) — keyword + category + location +
 * popularity
 */
@Service
public class ProductRecommendationService {

    private final ProduitRepository produitRepository;
    private final LocalScoringEngine scoringEngine;
    private final HuggingFaceService hfService;

    // Simple in-memory cache (key → list of product IDs)
    private final Map<String, List<Long>> cache = new ConcurrentHashMap<>();

    public ProductRecommendationService(ProduitRepository produitRepository,
            LocalScoringEngine scoringEngine,
            HuggingFaceService hfService) {
        this.produitRepository = produitRepository;
        this.scoringEngine = scoringEngine;
        this.hfService = hfService;
    }

    // ─── Public API ──────────────────────────────────────────────────────────

    /**
     * Returns products similar to the one currently viewed.
     * Signals used: category, keywords, location, rating, popularity.
     */
    public List<RecommendationResult> getSimilarProducts(Long produitId, int limit) {
        String cacheKey = "similar_" + produitId + "_" + limit;
        Optional<List<RecommendationResult>> cached = fromCache(cacheKey, limit);
        if (cached.isPresent())
            return cached.get();

        Produit base = produitRepository.findById(produitId).orElse(null);
        if (base == null)
            return getPopularProducts(limit);

        // Candidates: ACTIVE products, excluding the current one
        List<Produit> candidates = produitRepository
                .findTop8ByStatutProduitOrderByNombreVentesDesc(StatutProduit.ACTIVE)
                .stream()
                .filter(p -> !p.getId().equals(produitId))
                .collect(Collectors.toList());

        // Add more candidates from same category if needed
        if (base.getCategorie() != null && base.getCategorie().getId() != null) {
            Long catId = base.getCategorie().getId();
            produitRepository.findByCategorieId(catId)
                    .stream()
                    .filter(p -> !p.getId().equals(produitId)
                            && p.getStatutProduit() == StatutProduit.ACTIVE
                            && candidates.stream().noneMatch(c -> c.getId().equals(p.getId())))
                    .limit(20)
                    .forEach(candidates::add);
        }

        if (candidates.isEmpty())
            return getPopularProducts(limit);

        List<RecommendationResult> results = score(candidates, List.of(base), null, null, limit);
        putCache(cacheKey, results);
        return results;
    }

    /**
     * Returns personalized recommendations based on the user's browsing context.
     * 
     * @param viewedIds    IDs of products the user has viewed (from sessionStorage)
     * @param userLocation City name from user profile or GPS
     * @param searchQuery  Last search term the user typed
     * @param limit        Number of results to return
     */
    public List<RecommendationResult> getPersonalizedRecommendations(
            List<Long> viewedIds,
            String userLocation,
            String searchQuery,
            int limit) {

        if (viewedIds == null || viewedIds.isEmpty()) {
            return getPopularProducts(limit);
        }

        String cacheKey = "pers_" + viewedIds.hashCode() + "_"
                + (userLocation != null ? userLocation : "") + "_"
                + (searchQuery != null ? searchQuery : "");
        Optional<List<RecommendationResult>> cached = fromCache(cacheKey, limit);
        if (cached.isPresent())
            return cached.get();

        List<Produit> viewed = produitRepository.findAllById(viewedIds);
        if (viewed.isEmpty())
            return getPopularProducts(limit);

        // All active products not yet viewed
        List<Produit> candidates = produitRepository
                .findAll()
                .stream()
                .filter(p -> p.getStatutProduit() == StatutProduit.ACTIVE
                        && !viewedIds.contains(p.getId()))
                .collect(Collectors.toList());

        if (candidates.isEmpty())
            return getPopularProducts(limit);

        List<RecommendationResult> results = score(candidates, viewed, userLocation, searchQuery, limit);
        putCache(cacheKey, results);
        return results;
    }

    /**
     * Fallback: returns the most popular (top-selling + high-rated) active
     * products.
     */
    public List<RecommendationResult> getPopularProducts(int limit) {
        return produitRepository
                .findTop8ByStatutProduitOrderByNombreVentesDesc(StatutProduit.ACTIVE)
                .stream()
                .limit(limit)
                .map(p -> new RecommendationResult(p, 0, "Produit populaire"))
                .collect(Collectors.toList());
    }

    /** Diagnostic — used by the /test-ai endpoint */
    public Map<String, Object> getStatus() {
        Map<String, Object> status = new LinkedHashMap<>(hfService.getStatus());
        long totalProducts = produitRepository.count();
        long activeProducts = produitRepository.findTop8ByStatutProduitOrderByNombreVentesDesc(StatutProduit.ACTIVE)
                .size();

        status.put("totalProducts", totalProducts);
        status.put("activeProducts", activeProducts);
        status.put("cacheSize", cache.size());
        return status;
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private List<RecommendationResult> score(
            List<Produit> candidates,
            List<Produit> viewed,
            String location,
            String query,
            int limit) {

        // Try HuggingFace embeddings if available
        if (hfService.isAvailable() && !viewed.isEmpty()) {
            List<RecommendationResult> hfResults = tryHuggingFace(candidates, viewed, limit);
            if (hfResults != null && !hfResults.isEmpty())
                return hfResults;
        }

        // Local scoring fallback
        return scoringEngine.score(candidates, viewed, location, query, limit)
                .stream()
                .map(sp -> new RecommendationResult(sp.getProduit(), sp.getScore(), sp.getReason()))
                .collect(Collectors.toList());
    }

    private List<RecommendationResult> tryHuggingFace(
            List<Produit> candidates,
            List<Produit> viewed,
            int limit) {
        try {
            // Build a combined "user interest" text from viewed products
            String interestText = viewed.stream()
                    .map(p -> p.getTitreProduit() + " "
                            + (p.getDescriptionCourte() != null ? p.getDescriptionCourte() : ""))
                    .collect(Collectors.joining(". "));

            double[] userVec = hfService.getEmbedding(interestText);
            if (userVec == null)
                return null;

            List<ScoredHF> hfScored = new ArrayList<>();
            for (Produit c : candidates) {
                String text = c.getTitreProduit() + " "
                        + (c.getDescriptionCourte() != null ? c.getDescriptionCourte() : "");
                double[] cVec = hfService.getEmbedding(text);
                if (cVec != null) {
                    double sim = hfService.cosineSimilarity(userVec, cVec);
                    hfScored.add(new ScoredHF(c, sim));
                }
            }

            if (hfScored.isEmpty())
                return null;

            hfScored.sort(Comparator.comparingDouble(ScoredHF::score).reversed());
            return hfScored.stream()
                    .limit(limit)
                    .map(sh -> new RecommendationResult(sh.produit(), sh.score() * 100, "Recommandé par IA sémantique"))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("[ProductRecommendation] HuggingFace error: " + e.getMessage());
            return null;
        }
    }

    private Optional<List<RecommendationResult>> fromCache(String key, int limit) {
        List<Long> ids = cache.get(key);
        if (ids == null)
            return Optional.empty();
        List<Produit> products = produitRepository.findAllById(ids);
        if (products.isEmpty()) {
            cache.remove(key);
            return Optional.empty();
        }
        List<RecommendationResult> results = products.stream()
                .limit(limit)
                .map(p -> new RecommendationResult(p, 0, "Recommandé pour vous"))
                .collect(Collectors.toList());
        return Optional.of(results);
    }

    private void putCache(String key, List<RecommendationResult> results) {
        cache.put(key, results.stream().map(r -> r.produit().getId()).collect(Collectors.toList()));
    }

    // ─── Value objects ────────────────────────────────────────────────────────

    public record RecommendationResult(Produit produit, double score, String reason) {
    }

    private record ScoredHF(Produit produit, double score) {
    }
}

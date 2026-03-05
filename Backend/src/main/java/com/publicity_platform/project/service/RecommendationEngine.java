package com.publicity_platform.project.service;

import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.enumm.StatutProduit;
import com.publicity_platform.project.repository.FavorisRepository;
import com.publicity_platform.project.repository.ProduitRepository;
import com.publicity_platform.project.repository.UserProductEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Hybrid recommendation engine:
 * 1. Content-Based — cosine similarity between MiniLM embeddings
 * 2. Behavior-Based — category affinity, favorites, cart boost
 */
@Service
public class RecommendationEngine {

    private static final Logger log = LoggerFactory.getLogger(RecommendationEngine.class);

    private final EmbeddingService embeddingService;
    private final ProduitRepository produitRepository;
    private final UserProductEventRepository eventRepository;
    private final FavorisRepository favorisRepository;

    public RecommendationEngine(EmbeddingService embeddingService,
            ProduitRepository produitRepository,
            UserProductEventRepository eventRepository,
            FavorisRepository favorisRepository) {
        this.embeddingService = embeddingService;
        this.produitRepository = produitRepository;
        this.eventRepository = eventRepository;
        this.favorisRepository = favorisRepository;
    }

    // ── Public entry point ────────────────────────────────────────

    /**
     * Returns up to {@code limit} recommended product IDs for a given user,
     * ranked by the hybrid score (content + behavior).
     */
    public List<Long> getRecommendations(Long userId, int limit) {
        if (!embeddingService.isReady()) {
            log.warn("Embedding model not ready — skipping ML recommendations");
            return Collections.emptyList();
        }

        // 1. Get the user's recently viewed product IDs (up to 10)
        List<Long> viewedIds = eventRepository.findRecentlyViewedProduitIds(
                userId, PageRequest.of(0, 10));

        if (viewedIds.isEmpty()) {
            return Collections.emptyList(); // No history yet → caller falls back to popular
        }

        // 2. Fetch viewed products and compute their aggregate embedding
        List<Produit> viewedProducts = produitRepository.findAllById(viewedIds);
        float[] userProfile = buildUserProfileEmbedding(viewedProducts);
        if (userProfile == null)
            return Collections.emptyList();

        // 3. Get preferred category IDs for behavior boost
        List<Long> preferredCategoryIds = eventRepository
                .findPreferredCategoryIds(userId, PageRequest.of(0, 5))
                .stream()
                .map(row -> (Long) row[0])
                .toList();

        // 4. Get all ACTIVE products excluding already viewed
        Set<Long> exclude = new HashSet<>(viewedIds);
        List<Produit> candidates = produitRepository.findAll().stream()
                .filter(p -> p.getStatutProduit() == StatutProduit.ACTIVE)
                .filter(p -> !exclude.contains(p.getId()))
                .toList();

        // 5. Score every candidate
        List<ScoredProduct> scored = new ArrayList<>();
        for (Produit candidate : candidates) {
            float[] candidateEmb = embeddingService.getProductEmbedding(candidate);
            if (candidateEmb == null)
                continue;

            double contentScore = cosineSimilarity(userProfile, candidateEmb);
            double behaviorBoost = computeBehaviorBoost(candidate, preferredCategoryIds);
            double finalScore = contentScore + behaviorBoost;

            scored.add(new ScoredProduct(candidate.getId(), finalScore));
        }

        // 6. Sort descending, return top N IDs
        return scored.stream()
                .sorted(Comparator.comparingDouble(ScoredProduct::score).reversed())
                .limit(limit)
                .map(ScoredProduct::produitId)
                .collect(Collectors.toList());
    }

    // ── Private helpers ───────────────────────────────────────────

    /**
     * Builds a user-profile embedding by averaging the embeddings of recently
     * viewed products (mean pooling + L2 normalization).
     */
    private float[] buildUserProfileEmbedding(List<Produit> viewedProducts) {
        List<float[]> embeddings = new ArrayList<>();
        for (Produit p : viewedProducts) {
            float[] emb = embeddingService.getProductEmbedding(p);
            if (emb != null)
                embeddings.add(emb);
        }
        if (embeddings.isEmpty())
            return null;

        int dim = embeddings.get(0).length;
        float[] mean = new float[dim];
        for (float[] e : embeddings) {
            for (int i = 0; i < dim; i++)
                mean[i] += e[i];
        }
        for (int i = 0; i < dim; i++)
            mean[i] /= embeddings.size();
        return EmbeddingService.l2Normalize(mean);
    }

    /**
     * Cosine similarity between two L2-normalised vectors (= dot product).
     */
    static double cosineSimilarity(float[] a, float[] b) {
        if (a.length != b.length)
            return 0.0;
        double dot = 0.0;
        for (int i = 0; i < a.length; i++)
            dot += a[i] * b[i];
        return dot; // already normalised → value in [-1, 1]
    }

    /**
     * Behavior-based additive boost:
     * +0.15 if product is in a preferred category
     * +0.05 per 1000 sales (capped at 0.10)
     */
    private double computeBehaviorBoost(Produit p, List<Long> preferredCategoryIds) {
        double boost = 0.0;
        if (p.getCategorie() != null && preferredCategoryIds.contains(p.getCategorie().getId())) {
            boost += 0.15;
        }
        if (p.getNombreVentes() != null && p.getNombreVentes() > 0) {
            boost += Math.min(0.10, p.getNombreVentes() / 10000.0);
        }
        return boost;
    }

    // ── Inner record ──────────────────────────────────────────────

    record ScoredProduct(Long produitId, double score) {
    }
}

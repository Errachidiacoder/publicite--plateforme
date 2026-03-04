package com.publicity_platform.project.service;

import com.publicity_platform.project.entity.Produit;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Pure-Java scoring engine for product recommendations.
 * No external API required — works fully offline.
 *
 * Score breakdown per candidate product:
 * +40 same category as any viewed product
 * +25 most-visited category by user
 * +20 keyword match (per keyword in title/description/tags)
 * +15 same city as user context
 * +15 high rating (>= 4.0)
 * +10 premium signal (nombreVentes >= 50)
 * +0-10 popularity (compteurVues, normalized)
 * +5 search-query match
 */
@Component
public class LocalScoringEngine {

    /** Compute recommendation scores and return the top-N products. */
    public List<ScoredProduct> score(
            List<Produit> candidates,
            List<Produit> viewed,
            String userLocation,
            String searchQuery,
            int topN) {

        if (candidates == null || candidates.isEmpty()) {
            return Collections.emptyList();
        }

        // Pre-compute signals from viewed products
        Set<Long> viewedCategoryIds = extractCategoryIds(viewed);
        Long topCategoryId = topCategory(viewed);
        Set<String> viewedKeywords = extractKeywords(viewed);
        long maxVues = candidates.stream()
                .mapToLong(p -> p.getCompteurVues() != null ? p.getCompteurVues() : 0)
                .max().orElse(1);
        Set<String> queryTokens = tokenize(searchQuery);

        List<ScoredProduct> scored = new ArrayList<>();

        for (Produit candidate : candidates) {
            double score = 0;

            // 1. Category match
            Long catId = candidate.getCategorie() != null ? candidate.getCategorie().getId() : null;
            if (catId != null && viewedCategoryIds.contains(catId)) {
                score += 40;
            }

            // 2. Top category of user
            if (catId != null && catId.equals(topCategoryId)) {
                score += 25;
            }

            // 3. Keyword match (title + description + tags)
            String candidateText = buildText(candidate).toLowerCase(Locale.ROOT);
            for (String kw : viewedKeywords) {
                if (candidateText.contains(kw)) {
                    score += 20;
                }
            }

            // 4. Location match
            if (userLocation != null && !userLocation.isBlank()
                    && candidate.getVilleLocalisation() != null
                    && candidate.getVilleLocalisation().toLowerCase(Locale.ROOT)
                            .contains(userLocation.toLowerCase(Locale.ROOT))) {
                score += 15;
            }

            // 5. Rating boost
            if (candidate.getNoteMoyenne() != null && candidate.getNoteMoyenne() >= 4.0) {
                score += 15;
            }

            // 6. Popularity (ventes)
            if (candidate.getNombreVentes() != null && candidate.getNombreVentes() >= 50) {
                score += 10;
            }

            // 7. Normalized view count (0–10 pts)
            long vues = candidate.getCompteurVues() != null ? candidate.getCompteurVues() : 0;
            score += (maxVues > 0) ? (10.0 * vues / maxVues) : 0;

            // 8. Search query match
            for (String token : queryTokens) {
                if (candidateText.contains(token)) {
                    score += 5;
                    break; // one hit is enough
                }
            }

            scored.add(new ScoredProduct(candidate, score,
                    buildReason(candidate, viewedCategoryIds, topCategoryId, userLocation, viewedKeywords)));
        }

        // Sort descending, take topN
        scored.sort(Comparator.comparingDouble(ScoredProduct::getScore).reversed());
        return scored.stream().limit(topN).collect(Collectors.toList());
    }

    // ─── Private helpers ───────────────────────────────────────────────────

    private Set<Long> extractCategoryIds(List<Produit> products) {
        if (products == null)
            return Collections.emptySet();
        Set<Long> ids = new HashSet<>();
        for (Produit p : products) {
            if (p.getCategorie() != null)
                ids.add(p.getCategorie().getId());
        }
        return ids;
    }

    /** Returns the category ID that appears the most in the viewed list. */
    private Long topCategory(List<Produit> products) {
        if (products == null || products.isEmpty())
            return null;
        Map<Long, Long> freq = new HashMap<>();
        for (Produit p : products) {
            if (p.getCategorie() != null) {
                freq.compute(p.getCategorie().getId(), (k, v) -> v == null ? 1L : v + 1L);
            }
        }
        return freq.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
    }

    /** Extract meaningful keywords from all viewed product texts. */
    private Set<String> extractKeywords(List<Produit> products) {
        Set<String> keywords = new HashSet<>();
        if (products == null)
            return keywords;
        Set<String> stopWords = Set.of(
                "le", "la", "les", "de", "du", "des", "un", "une", "et", "en",
                "pour", "avec", "sur", "par", "dans", "au", "aux", "ce", "se",
                "est", "ou", "qui", "que", "plus", "très");
        for (Produit p : products) {
            tokenize(buildText(p)).stream()
                    .filter(t -> t.length() > 3 && !stopWords.contains(t))
                    .forEach(keywords::add);
        }
        return keywords;
    }

    private String buildText(Produit p) {
        StringBuilder sb = new StringBuilder();
        if (p.getTitreProduit() != null)
            sb.append(p.getTitreProduit()).append(" ");
        if (p.getDescriptionDetaillee() != null)
            sb.append(p.getDescriptionDetaillee()).append(" ");
        if (p.getDescriptionCourte() != null)
            sb.append(p.getDescriptionCourte()).append(" ");
        if (p.getTags() != null)
            sb.append(p.getTags()).append(" ");
        if (p.getCategorie() != null)
            sb.append(p.getCategorie().getNomCategorie()).append(" ");
        return sb.toString().toLowerCase(Locale.ROOT);
    }

    private Set<String> tokenize(String text) {
        if (text == null || text.isBlank())
            return Collections.emptySet();
        return Arrays.stream(text.toLowerCase(Locale.ROOT).split("[\\s,;|/+\\-]+"))
                .filter(t -> t.length() > 2)
                .collect(Collectors.toSet());
    }

    private String buildReason(Produit c, Set<Long> viewedCats, Long topCat, String location, Set<String> keywords) {
        Long catId = c.getCategorie() != null ? c.getCategorie().getId() : null;
        if (catId != null && catId.equals(topCat)) {
            return "Catégorie préférée : " + c.getCategorie().getNomCategorie();
        }
        if (catId != null && viewedCats.contains(catId)) {
            return "Similaire aux produits consultés";
        }
        if (location != null && !location.isBlank()
                && c.getVilleLocalisation() != null
                && c.getVilleLocalisation().toLowerCase().contains(location.toLowerCase())) {
            return "Disponible à " + c.getVilleLocalisation();
        }
        if (c.getNombreVentes() != null && c.getNombreVentes() >= 50) {
            return "Produit populaire";
        }
        return "Recommandé pour vous";
    }

    // ─── Value object ───────────────────────────────────────────────────────

    public static class ScoredProduct {
        private final Produit produit;
        private final double score;
        private final String reason;

        public ScoredProduct(Produit produit, double score, String reason) {
            this.produit = produit;
            this.score = score;
            this.reason = reason;
        }

        public Produit getProduit() {
            return produit;
        }

        public double getScore() {
            return score;
        }

        public String getReason() {
            return reason;
        }
    }
}

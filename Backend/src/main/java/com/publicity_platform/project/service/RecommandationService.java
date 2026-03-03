package com.publicity_platform.project.service;

import com.publicity_platform.project.dto.ProduitRecommandationDTO;
import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.repository.ProduitRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class RecommandationService {

    private final ProduitRepository produitRepository;
    private final ClaudeAIService claudeAIService;
    private final Map<String, List<ProduitRecommandationDTO>> cache = new ConcurrentHashMap<>();

    public RecommandationService(ProduitRepository produitRepository, ClaudeAIService claudeAIService) {
        this.produitRepository = produitRepository;
        this.claudeAIService = claudeAIService;
    }

    @Transactional
    public void trackView(Long productId) {
        produitRepository.findById(productId).ifPresent(p -> {
            p.incrementerVues();
            produitRepository.save(p);
        });
    }

    public List<ProduitRecommandationDTO> getPopularProducts(int limit) {
        return produitRepository.findPopularValides(PageRequest.of(0, limit))
                .stream()
                .map(ProduitRecommandationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ProduitRecommandationDTO> getSimilarProducts(Long productId) {
        String cacheKey = "similar_" + productId;
        if (cache.containsKey(cacheKey))
            return cache.get(cacheKey);

        Optional<Produit> optProduct = produitRepository.findById(productId);
        if (optProduct.isEmpty())
            return Collections.emptyList();

        Produit current = optProduct.get();
        if (current.getCategorie() == null)
            return getPopularProducts(4);

        // Récupérer les candidats (20 produits de la même catégorie)
        List<Produit> candidates = produitRepository.findByCategorieExcluding(
                current.getCategorie().getId(), productId, PageRequest.of(0, 20));

        List<Long> recommendedIds = claudeAIService.getSimilarProductIds(current, candidates);

        List<ProduitRecommandationDTO> results;
        if (recommendedIds.isEmpty()) {
            // Fallback : populaires de la même catégorie ou globaux
            results = candidates.stream()
                    .limit(4)
                    .map(ProduitRecommandationDTO::fromEntity)
                    .collect(Collectors.toList());
        } else {
            results = produitRepository.findAllById(recommendedIds).stream()
                    .map(ProduitRecommandationDTO::fromEntity)
                    .collect(Collectors.toList());
        }

        if (!results.isEmpty())
            cache.put(cacheKey, results);
        return results;
    }

    public List<ProduitRecommandationDTO> getPersonalized(List<Long> viewedIds) {
        if (viewedIds == null || viewedIds.isEmpty())
            return getPopularProducts(6);

        String cacheKey = "personalized_" + viewedIds.hashCode();
        if (cache.containsKey(cacheKey))
            return cache.get(cacheKey);

        List<Produit> viewedProducts = produitRepository.findAllById(viewedIds);
        List<String> viewedNames = viewedProducts.stream()
                .map(Produit::getTitreProduit)
                .collect(Collectors.toList());

        // Candidats : les 20 produits validés les plus récents
        List<Produit> candidates = produitRepository.findTopValidesForCandidats(PageRequest.of(0, 20));

        // Exclure les déjà vus des candidats
        Set<Long> viewedSet = new HashSet<>(viewedIds);
        List<Produit> filteredCandidates = candidates.stream()
                .filter(p -> !viewedSet.contains(p.getId()))
                .collect(Collectors.toList());

        List<Long> recommendedIds = claudeAIService.getPersonalizedProductIds(viewedNames, filteredCandidates);

        List<ProduitRecommandationDTO> results;
        if (recommendedIds.isEmpty()) {
            results = getPopularProducts(6).stream()
                    .filter(dto -> !viewedSet.contains(dto.getId()))
                    .limit(6)
                    .collect(Collectors.toList());
        } else {
            results = produitRepository.findAllById(recommendedIds).stream()
                    .map(ProduitRecommandationDTO::fromEntity)
                    .collect(Collectors.toList());
        }

        if (!results.isEmpty())
            cache.put(cacheKey, results);
        return results;
    }

    @Scheduled(fixedRate = 3600000) // 1 heure
    public void clearCache() {
        cache.clear();
    }
}

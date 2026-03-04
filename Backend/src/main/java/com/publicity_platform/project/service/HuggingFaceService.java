package com.publicity_platform.project.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Optional AI booster using HuggingFace free Inference API.
 * Model: sentence-transformers/all-MiniLM-L6-v2
 *
 * Uses RestTemplate (spring-boot-starter-web) — no extra dependency needed.
 * Returns null on any error → callers fall back to LocalScoringEngine.
 */
@Service
public class HuggingFaceService {

    @Value("${huggingface.api.key:hf_dummy}")
    private String hfToken;

    @Value("${huggingface.api.url:https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2}")
    private String hfUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /** True if a real token is configured (not the placeholder). */
    public boolean isAvailable() {
        return hfToken != null && !hfToken.isBlank() && !hfToken.startsWith("hf_dummy");
    }

    /**
     * Returns an embedding vector for the given text, or null on failure.
     */
    public double[] getEmbedding(String text) {
        if (!isAvailable())
            return null;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + hfToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            String body = "{\"inputs\":\"" + text.replace("\"", "'") + "\"}";
            HttpEntity<String> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Object> response = restTemplate.postForEntity(hfUrl, entity, Object.class);
            return parseEmbedding(response.getBody());
        } catch (Exception e) {
            System.err.println("[HuggingFace] Embedding error: " + e.getMessage());
            return null;
        }
    }

    /** Cosine similarity. Range: -1 to 1 (1 = identical). */
    public double cosineSimilarity(double[] a, double[] b) {
        if (a == null || b == null || a.length != b.length)
            return 0;
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        double denom = Math.sqrt(normA) * Math.sqrt(normB);
        return denom == 0 ? 0 : dot / denom;
    }

    private double[] parseEmbedding(Object raw) {
        if (raw instanceof List<?> list) {
            if (!list.isEmpty() && list.get(0) instanceof Number) {
                double[] v = new double[list.size()];
                for (int i = 0; i < list.size(); i++)
                    v[i] = ((Number) list.get(i)).doubleValue();
                return v;
            }
            if (!list.isEmpty() && list.get(0) instanceof List<?> inner) {
                double[] v = new double[inner.size()];
                for (int i = 0; i < inner.size(); i++)
                    v[i] = ((Number) inner.get(i)).doubleValue();
                return v;
            }
        }
        return null;
    }

    /** Diagnostic info for the /test-ai endpoint. */
    public Map<String, Object> getStatus() {
        if (!isAvailable()) {
            return Map.of(
                    "mode", "local-scoring",
                    "aiAvailable", false,
                    "message", "Aucun token HuggingFace — mode scoring local actif");
        }
        double[] test = getEmbedding("test de connectivité");
        boolean ok = (test != null && test.length > 0);
        return Map.of(
                "mode", ok ? "huggingface-embeddings" : "local-scoring-fallback",
                "aiAvailable", ok,
                "model", "sentence-transformers/all-MiniLM-L6-v2",
                "message", ok ? "HuggingFace connecté ✓" : "HuggingFace inaccessible — fallback local activé");
    }
}

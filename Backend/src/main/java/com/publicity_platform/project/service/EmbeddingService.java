package com.publicity_platform.project.service;

import ai.djl.Application;
import ai.djl.huggingface.translator.TextEmbeddingTranslatorFactory;
import ai.djl.inference.Predictor;
import ai.djl.repository.zoo.Criteria;
import ai.djl.repository.zoo.ZooModel;
import ai.djl.translate.TranslateException;
import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.enumm.StatutProduit;
import com.publicity_platform.project.repository.ProduitRepository;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Loads all-MiniLM-L6-v2 via DJL + ONNX locally (no API key, no rate limit).
 * Generates 384-dim sentence embeddings for product content.
 * Caches embeddings per produit ID in memory.
 */
@Service
public class EmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingService.class);
    private static final String HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2";

    private final ProduitRepository produitRepository;

    // Thread-safe embedding cache: produitId → float[384]
    private final Map<Long, float[]> cache = new ConcurrentHashMap<>();

    private ZooModel<String, float[]> model;

    public EmbeddingService(ProduitRepository produitRepository) {
        this.produitRepository = produitRepository;
    }

    @PostConstruct
    public void init() {
        log.info("Loading all-MiniLM-L6-v2 via DJL ONNX (first run downloads ~80MB)…");
        try {
            Criteria<String, float[]> criteria = Criteria.builder()
                    .setTypes(String.class, float[].class)
                    .optApplication(Application.NLP.TEXT_EMBEDDING)
                    .optModelUrls("djl://ai.djl.huggingface.onnxruntime/" + HF_MODEL)
                    .optTranslatorFactory(new TextEmbeddingTranslatorFactory())
                    .optEngine("OnnxRuntime")
                    .build();
            model = criteria.loadModel();
            log.info("all-MiniLM-L6-v2 loaded successfully.");
            warmUpCache();
        } catch (Exception e) {
            log.error("Failed to initialize EmbeddingService properly: {}. Recommendations will use fallback logic.",
                    e.getMessage());
            e.printStackTrace();
        }
    }

    @PreDestroy
    public void destroy() {
        if (model != null) {
            model.close();
        }
    }

    // ── Public API ────────────────────────────────────────────────

    /**
     * Returns a 384-dim L2-normalised embedding for arbitrary text.
     * Returns null if the model failed to load.
     */
    public float[] embed(String text) {
        if (model == null || text == null || text.isBlank())
            return null;
        try (Predictor<String, float[]> predictor = model.newPredictor()) {
            float[] raw = predictor.predict(text.trim());
            return l2Normalize(raw);
        } catch (TranslateException e) {
            log.warn("embed() failed: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Returns a cached embedding for a produit, computing it on miss.
     */
    public float[] getProductEmbedding(Produit p) {
        return cache.computeIfAbsent(p.getId(), id -> embed(buildText(p)));
    }

    /**
     * Invalidate a product's cached embedding (call after product update).
     */
    public void invalidate(Long produitId) {
        cache.remove(produitId);
    }

    /** True if the model is loaded and usable. */
    public boolean isReady() {
        return model != null;
    }

    // ── Private helpers ───────────────────────────────────────────

    private void warmUpCache() {
        List<Produit> active = produitRepository.findAll().stream()
                .filter(p -> p.getStatutProduit() == StatutProduit.ACTIVE)
                .toList();
        log.info("Pre-computing embeddings for {} active products…", active.size());
        for (Produit p : active) {
            try {
                cache.put(p.getId(), embed(buildText(p)));
            } catch (Exception e) {
                log.warn("Skip embedding for produit {}: {}", p.getId(), e.getMessage());
            }
        }
        log.info("Embedding cache ready ({} entries).", cache.size());
    }

    static String buildText(Produit p) {
        StringBuilder sb = new StringBuilder();
        if (p.getTitreProduit() != null)
            sb.append(p.getTitreProduit()).append(". ");
        if (p.getDescriptionCourte() != null)
            sb.append(p.getDescriptionCourte()).append(". ");
        if (p.getTags() != null)
            sb.append(p.getTags()).append(" ");
        if (p.getCategorie() != null)
            sb.append(p.getCategorie().getNomCategorie());
        return sb.toString().trim();
    }

    static float[] l2Normalize(float[] v) {
        double norm = 0.0;
        for (float x : v)
            norm += (double) x * x;
        norm = Math.sqrt(norm);
        if (norm == 0.0)
            return v;
        float[] out = new float[v.length];
        for (int i = 0; i < v.length; i++)
            out[i] = (float) (v[i] / norm);
        return out;
    }
}

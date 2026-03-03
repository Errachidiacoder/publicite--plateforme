package com.publicity_platform.project.service;

import com.publicity_platform.project.entity.Produit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ClaudeAIService {

    @Value("${anthropic.api.key}")
    private String apiKey;

    @Value("${anthropic.api.url}")
    private String apiUrl;

    @Value("${anthropic.api.model}")
    private String model;

    private final WebClient webClient;

    public ClaudeAIService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String callClaude(String prompt) {
        if ("REPLACE_ME".equals(apiKey) || apiKey == null || apiKey.isEmpty()) {
            System.err.println("Claude API key not configured.");
            return "";
        }

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("max_tokens", 100);

        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);
        messages.add(userMessage);
        body.put("messages", messages);

        try {
            Map<String, Object> response = webClient.post()
                    .uri(apiUrl)
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("content")) {
                List<Map<String, Object>> contentList = (List<Map<String, Object>>) response.get("content");
                if (!contentList.isEmpty()) {
                    return (String) contentList.get(0).get("text");
                }
            }
        } catch (Exception e) {
            System.err.println("Error calling Claude API: " + e.getMessage());
        }
        return "";
    }

    public List<Long> getSimilarProductIds(Produit current, List<Produit> candidates) {
        if (candidates.isEmpty())
            return Collections.emptyList();

        StringBuilder prompt = new StringBuilder();
        prompt.append("Tu es un expert en recommandation. Voici un produit :\n");
        prompt.append(String.format("- Nom: %s\n- Description: %s\n- Catégorie: %s\n\n",
                current.getTitreProduit(), current.getDescriptionDetaillee(),
                current.getCategorie() != null ? current.getCategorie().getNomCategorie() : "Inconnu"));

        prompt.append("Voici une liste de produits candidats :\n");
        for (Produit p : candidates) {
            prompt.append(String.format("- ID %d: %s (%s, %s)\n",
                    p.getId(), p.getTitreProduit(),
                    p.getCategorie() != null ? p.getCategorie().getNomCategorie() : "Inconnu",
                    p.getDescriptionDetaillee()));
        }

        prompt.append("\nIdentifie les 4 produits les plus similaires en contenu. ");
        prompt.append(
                "Réponds uniquement par les IDs séparés par des virgules (ex: 1,45,7,23), sans texte, sans explication.");

        String response = callClaude(prompt.toString());
        return parseIds(response);
    }

    public List<Long> getPersonalizedProductIds(List<String> viewedNames, List<Produit> candidates) {
        if (viewedNames.isEmpty() || candidates.isEmpty())
            return Collections.emptyList();

        StringBuilder prompt = new StringBuilder();
        prompt.append("L'utilisateur a consulté ces produits par le passé :\n");
        prompt.append(String.join(", ", viewedNames)).append("\n\n");

        prompt.append("Voici une liste de produits disponibles :\n");
        for (Produit p : candidates) {
            prompt.append(String.format("- ID %d: %s (%s)\n",
                    p.getId(), p.getTitreProduit(),
                    p.getCategorie() != null ? p.getCategorie().getNomCategorie() : "Inconnu"));
        }

        prompt.append("\nIdentifie les 6 produits qui correspondent le mieux aux centres d'intérêt déduits. ");
        prompt.append("Réponds uniquement par les IDs séparés par des virgules, sans texte, sans explication.");

        String response = callClaude(prompt.toString());
        return parseIds(response);
    }

    private List<Long> parseIds(String response) {
        if (response == null || response.trim().isEmpty())
            return Collections.emptyList();

        try {
            // Nettoyage de la réponse au cas où Claude ajouterait du texte
            String cleaner = response.replaceAll("[^0-9,]", "").trim();
            if (cleaner.isEmpty())
                return Collections.emptyList();

            return Arrays.stream(cleaner.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Long::parseLong)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error parsing IDs from Claude response: " + response);
            return Collections.emptyList();
        }
    }
}

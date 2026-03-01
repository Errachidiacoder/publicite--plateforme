package com.publicity_platform.project.service;

import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.repository.EtudeRepository;
import com.publicity_platform.project.repository.ProduitRepository;
import com.publicity_platform.project.repository.CategorieRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EtudeService {

    private final EtudeRepository etudeRepository;
    private final ProduitRepository produitRepository;
    private final CategorieRepository categorieRepository;

    public EtudeService(EtudeRepository etudeRepository,
            ProduitRepository produitRepository,
            CategorieRepository categorieRepository) {
        this.etudeRepository = etudeRepository;
        this.produitRepository = produitRepository;
        this.categorieRepository = categorieRepository;
    }

    /**
     * Récupère les winning products : produits avec le plus de ventes et de vues.
     */
    public List<Map<String, Object>> getWinningProducts() {
        List<Produit> topVentes = produitRepository.findAll().stream()
                .filter(p -> p.getNombreVentes() != null && p.getNombreVentes() > 0)
                .sorted(Comparator.comparingLong(Produit::getNombreVentes).reversed())
                .limit(10)
                .toList();

        List<Map<String, Object>> resultats = new ArrayList<>();
        for (Produit p : topVentes) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", p.getId());
            item.put("titre", p.getTitreProduit());
            item.put("categorie", p.getCategorie() != null ? p.getCategorie().getNomCategorie() : "Non classé");
            item.put("prix", p.getPrixAfiche());
            item.put("nombreVentes", p.getNombreVentes());
            item.put("vues", p.getCompteurVues());
            item.put("noteMoyenne", p.getNoteMoyenne());
            item.put("scoreWinning", calculerScoreWinning(p));
            resultats.add(item);
        }
        return resultats;
    }

    /**
     * Analyse les tendances par catégorie (volume de produits, nombre de ventes).
     */
    public List<Map<String, Object>> getTendancesCategories() {
        List<Map<String, Object>> tendances = new ArrayList<>();

        categorieRepository.findAll().forEach(cat -> {
            List<Produit> produits = produitRepository.findByCategorieId(cat.getId());
            long totalVentes = produits.stream()
                    .mapToLong(p -> p.getNombreVentes() != null ? p.getNombreVentes() : 0)
                    .sum();
            long totalVues = produits.stream()
                    .mapToLong(p -> p.getCompteurVues() != null ? p.getCompteurVues() : 0)
                    .sum();

            Map<String, Object> tendance = new LinkedHashMap<>();
            tendance.put("categorie", cat.getNomCategorie());
            tendance.put("nombreProduits", produits.size());
            tendance.put("totalVentes", totalVentes);
            tendance.put("totalVues", totalVues);
            tendance.put("panierMoyen", produits.stream()
                    .mapToDouble(p -> p.getPrixAfiche() != null ? p.getPrixAfiche() : 0)
                    .average()
                    .orElse(0));
            tendances.add(tendance);
        });

        // Trier par nombre de ventes décroissant
        tendances.sort((a, b) -> Long.compare(
                (Long) b.get("totalVentes"),
                (Long) a.get("totalVentes")));

        return tendances;
    }

    /**
     * Simule les besoins des clients en se basant sur les villes les plus actives
     * et les catégories les plus recherchées.
     */
    public Map<String, Object> getBesoinsClients() {
        Map<String, Object> besoins = new LinkedHashMap<>();

        // Top villes par activité
        Map<String, Long> villesActivite = produitRepository.findAll().stream()
                .filter(p -> p.getVilleLocalisation() != null && !p.getVilleLocalisation().isBlank())
                .collect(Collectors.groupingBy(
                        Produit::getVilleLocalisation,
                        Collectors.counting()));

        List<Map.Entry<String, Long>> topVilles = villesActivite.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .toList();

        besoins.put("topVilles", topVilles.stream().map(e -> {
            Map<String, Object> v = new LinkedHashMap<>();
            v.put("ville", e.getKey());
            v.put("nombreProduits", e.getValue());
            return v;
        }).toList());

        // Top produits consultés (les plus vus mais pas forcément achetés → demande
        // potentielle)
        List<Produit> produitsTresVus = produitRepository.findTop5ByOrderByCompteurVuesDesc();
        besoins.put("produitsLesPlusRecherches", produitsTresVus.stream().map(p -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("titre", p.getTitreProduit());
            item.put("vues", p.getCompteurVues());
            item.put("ventes", p.getNombreVentes());
            return item;
        }).toList());

        besoins.put("dateAnalyse", LocalDateTime.now().toString());

        return besoins;
    }

    /**
     * Calcule un score "winning" (0-100) basé sur les ventes, vues et notes.
     */
    private double calculerScoreWinning(Produit produit) {
        double scoreVentes = Math.min(produit.getNombreVentes() != null ? produit.getNombreVentes() : 0, 100);
        double scoreVues = Math.min(
                (produit.getCompteurVues() != null ? produit.getCompteurVues() : 0) / 10.0, 30);
        double scoreNote = (produit.getNoteMoyenne() != null ? produit.getNoteMoyenne() : 0) * 6;

        return Math.min(scoreVentes + scoreVues + scoreNote, 100.0);
    }
}

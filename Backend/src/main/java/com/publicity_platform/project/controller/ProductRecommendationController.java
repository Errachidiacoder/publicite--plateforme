package com.publicity_platform.project.controller;

import com.publicity_platform.project.entity.*;
import com.publicity_platform.project.enumm.*;
import com.publicity_platform.project.repository.*;
import com.publicity_platform.project.service.ProductRecommendationService;
import com.publicity_platform.project.service.ProductRecommendationService.RecommendationResult;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * REST controller for product-based recommendations.
 *
 * Endpoints:
 * GET /api/v1/product-recommendations/similar/{id}
 * POST /api/v1/product-recommendations/personalized
 * GET /api/v1/product-recommendations/popular
 * GET /api/v1/product-recommendations/test-ai
 * POST /api/v1/product-recommendations/reset-mock-data
 */
@RestController
@RequestMapping("/api/v1/product-recommendations")
@CrossOrigin(origins = "*")
public class ProductRecommendationController {

        private final ProductRecommendationService service;
        private final ProduitRepository produitRepository;
        private final UtilisateurRepository utilisateurRepository;
        private final CategorieRepository categorieRepository;

        public ProductRecommendationController(
                        ProductRecommendationService service,
                        ProduitRepository produitRepository,
                        UtilisateurRepository utilisateurRepository,
                        CategorieRepository categorieRepository) {
                this.service = service;
                this.produitRepository = produitRepository;
                this.utilisateurRepository = utilisateurRepository;
                this.categorieRepository = categorieRepository;
        }

        @GetMapping("/similar/{id}")
        public List<Map<String, Object>> getSimilar(
                        @PathVariable Long id,
                        @RequestParam(defaultValue = "6") int limit) {
                return service.getSimilarProducts(id, limit).stream()
                                .map(this::toMap).collect(Collectors.toList());
        }

        @PostMapping("/personalized")
        public List<Map<String, Object>> getPersonalized(
                        @RequestBody PersonalizedRequest body,
                        @RequestParam(defaultValue = "6") int limit) {
                return service.getPersonalizedRecommendations(
                                body.viewedIds(), body.location(), body.searchQuery(), limit)
                                .stream().map(this::toMap).collect(Collectors.toList());
        }

        @GetMapping("/popular")
        public List<Map<String, Object>> getPopular(
                        @RequestParam(defaultValue = "6") int limit) {
                return service.getPopularProducts(limit).stream()
                                .map(this::toMap).collect(Collectors.toList());
        }

        @GetMapping("/test-ai")
        public Map<String, Object> testAI() {
                return service.getStatus();
        }

        /**
         * Force-inject 30 mock products (deletes existing ones first).
         * POST http://localhost:8081/api/v1/product-recommendations/reset-mock-data
         */
        @PostMapping("/reset-mock-data")
        @Transactional
        public Map<String, Object> resetMockData() {
                long deletedCount = produitRepository.count();
                produitRepository.deleteAll();

                Utilisateur admin = utilisateurRepository.findByAdresseEmail("admin@souqbladi.ma").orElse(null);
                if (admin == null) {
                        return Map.of("status", "ERROR", "message", "Admin admin@souqbladi.ma introuvable");
                }

                int created = 0;
                for (String[] row : buildMockData()) {
                        // row: [titre, desc, tags, catName, prix, ville, imageUrl, vues, ventes, note,
                        // premium]
                        Categorie cat = categorieRepository.findAll().stream()
                                        .filter(c -> c.getNomCategorie().equals(row[3]))
                                        .findFirst().orElse(null);
                        if (cat == null)
                                continue;

                        Produit p = new Produit();
                        p.setTitreProduit(row[0]);
                        p.setDescriptionDetaillee(row[1]);
                        p.setDescriptionCourte(row[1].length() > 120 ? row[1].substring(0, 117) + "..." : row[1]);
                        p.setTags(row[2]);
                        p.setCategorie(cat);
                        p.setPrixAfiche(Double.parseDouble(row[4]));
                        p.setVilleLocalisation(row[5]);
                        p.setImageUrl(row[6]);
                        p.setCompteurVues(Long.parseLong(row[7]));
                        long ventes = Long.parseLong(row[8]);
                        p.setNombreVentes("true".equals(row[10]) ? Math.max(ventes, 55L) : ventes);
                        p.setNoteMoyenne(Double.parseDouble(row[9]));
                        p.setNombreAvis((int) (ventes / 2));
                        p.setStatutProduit(StatutProduit.ACTIVE);
                        p.setTypeAnnonce(TypeAnnonce.PRODUIT_PHYSIQUE);
                        p.setTypePrix(TypePrix.PRIX_FIXE);
                        p.setAnnonceur(admin);
                        produitRepository.save(p);
                        created++;
                }

                return Map.of(
                                "status", "SUCCESS",
                                "deleted", deletedCount,
                                "created", created,
                                "message", created + " produits de test injectés. Prêt à tester les recommandations !");
        }

        // ─── Helper: toMap ────────────────────────────────────────────────────────

        private Map<String, Object> toMap(RecommendationResult r) {
                var p = r.produit();
                return Map.of(
                                "id", p.getId(),
                                "titre", p.getTitreProduit() != null ? p.getTitreProduit() : "",
                                "description", p.getDescriptionCourte() != null ? p.getDescriptionCourte()
                                                : (p.getDescriptionDetaillee() != null
                                                                ? p.getDescriptionDetaillee().substring(0,
                                                                                Math.min(120, p.getDescriptionDetaillee()
                                                                                                .length()))
                                                                : ""),
                                "prix", p.getPrixAfiche() != null ? p.getPrixAfiche() : 0,
                                "imageUrl", p.getImageUrl() != null ? p.getImageUrl() : "",
                                "ville", p.getVilleLocalisation() != null ? p.getVilleLocalisation() : "",
                                "categorie", p.getCategorie() != null ? p.getCategorie().getNomCategorie() : "",
                                "noteMoyenne", p.getNoteMoyenne() != null ? p.getNoteMoyenne() : 0,
                                "nombreVentes", p.getNombreVentes() != null ? p.getNombreVentes() : 0,
                                "reason", r.reason());
        }

        // ─── Mock Data ────────────────────────────────────────────────────────────

        /**
         * 30 rows: [titre, desc, tags, catName, prix, ville, imageUrl, vues, ventes,
         * note, premium]
         */
        private List<String[]> buildMockData() {
                return List.of(
                                // ── Santé (5) ──────────────────────────────────────────────────
                                new String[] { "Complément Oméga-3 Premium",
                                                "Huile de poisson 1000mg. Santé cardiovasculaire et bien-être. Naturel sans additifs.",
                                                "santé complément naturel oméga bio capsule bien-être", "Santé", "189",
                                                "Casablanca",
                                                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500",
                                                "450", "95", "4.7", "false" },
                                new String[] { "Multivitamines Bio 60 gélules",
                                                "20 vitamines minéraux naturels. Défenses immunitaires. Certifié bio sans gluten.",
                                                "vitamines minéraux bio naturel santé immunité complément", "Santé",
                                                "149", "Rabat",
                                                "https://images.unsplash.com/photo-1550572017-edd951b55104?w=500",
                                                "320", "62", "4.5", "false" },
                                new String[] { "Huile de nigelle Habba Sawda 250ml",
                                                "100% naturelle pressée à froid. Anti-inflammatoire immunostimulant. Santé naturel.",
                                                "nigelle naturel bio santé anti-inflammatoire huile bien-être", "Santé",
                                                "99", "Marrakech",
                                                "https://images.unsplash.com/photo-1616405745745-f3f0d5c80ae8?w=500",
                                                "580", "180", "4.9", "true" },
                                new String[] { "Spiruline bio poudre 200g",
                                                "Cultivée au Maroc protéines fer vitamines B. Complément naturel sportif végétarien.",
                                                "spiruline bio protéine fer vitamine superfood santé naturel", "Santé",
                                                "129", "Agadir",
                                                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
                                                "210", "44", "4.6", "false" },
                                new String[] { "Tisane bien-être 12 plantes",
                                                "Infusion relaxante plantes médicinales marocaines. Menthe anis thym. Naturel santé.",
                                                "tisane plantes naturel bien-être santé menthe relaxant bio", "Santé",
                                                "59", "Fès",
                                                "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500",
                                                "160", "38", "4.4", "false" },

                                // ── Technologie (5) ────────────────────────────────────────────
                                new String[] { "iPhone 15 Pro Max 256Go neuf",
                                                "Apple iPhone 15 Pro Max Noir Titanium. 3 mois garantie constructeur. Original.",
                                                "iphone apple smartphone premium tech électronique mobile",
                                                "Technologie", "12500", "Casablanca",
                                                "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
                                                "780", "18", "4.8", "true" },
                                new String[] { "Samsung Galaxy S24 Ultra",
                                                "Flagship Android S-Pen caméra 200MP AMOLED 6.8 reconditionné grade A.",
                                                "samsung galaxy smartphone android tech premium électronique",
                                                "Technologie", "9800", "Rabat",
                                                "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500",
                                                "510", "12", "4.6", "false" },
                                new String[] { "Laptop Gaming ASUS ROG RTX 3070",
                                                "Ryzen 9 RTX 3070 16Go 512Go SSD. Écran 165Hz gaming design.",
                                                "laptop gaming asus informatique RTX tech PC portable", "Technologie",
                                                "17800", "Casablanca",
                                                "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500",
                                                "390", "7", "4.7", "true" },
                                new String[] { "Écouteurs Sony WH-1000XM5",
                                                "Réduction bruit active 30h bluetooth multipoint. Audio premium télétravail.",
                                                "sony écouteurs audio bluetooth tech premium sans-fil", "Technologie",
                                                "2800", "Fès",
                                                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
                                                "290", "35", "4.7", "false" },
                                new String[] { "Tablette iPad Air 5 M1 256Go",
                                                "Apple iPad Air puce M1 Liquid Retina 10.9 créatifs étudiants.",
                                                "ipad apple tablette tech électronique créatif étudiant", "Technologie",
                                                "6500", "Marrakech",
                                                "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500",
                                                "310", "22", "4.5", "false" },

                                // ── Alimentation (5) ───────────────────────────────────────────
                                new String[] { "Huile d'argan bio 500ml",
                                                "Coopérative femmes Essaouira. Label bio européen. Cuisine marocaine naturelle.",
                                                "argan bio naturel marocain terroir huile alimentaire", "Alimentation",
                                                "320", "Essaouira",
                                                "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500",
                                                "550", "210", "4.9", "true" },
                                new String[] { "Couscous artisanal Haouz 2kg",
                                                "Séchage naturel sans additifs. Conditionnement familial. Terroir marocain.",
                                                "couscous bio artisanal marocain naturel terroir alimentaire",
                                                "Alimentation", "85", "Marrakech",
                                                "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500",
                                                "690", "315", "4.6", "false" },
                                new String[] { "Miel de thym Atlas 500g",
                                                "Ruchers Moyen Atlas 100% naturel brut. Antioxydants antibactérien.",
                                                "miel naturel bio marocain terroir Atlas santé alimentaire",
                                                "Alimentation", "180", "Ifrane",
                                                "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=500",
                                                "430", "140", "4.8", "false" },
                                new String[] { "Ras El Hanout Premium 250g",
                                                "30 épices marocaines artisanales. Tajine couscous. Conditionnement hermétique.",
                                                "épices marocain artisanal tajine couscous naturel terroir",
                                                "Alimentation", "55", "Fès",
                                                "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500",
                                                "820", "410", "4.7", "false" },
                                new String[] { "Huile d'olive AOP Meknès 1L",
                                                "Olives Picholine première pression à froid. Acidité 0.3%. AOP certifiée.",
                                                "huile olive naturel bio marocain terroir alimentaire AOP",
                                                "Alimentation", "145", "Casablanca",
                                                "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500",
                                                "370", "155", "4.8", "true" },

                                // ── Mode & Textile (5) ─────────────────────────────────────────
                                new String[] { "Djellaba homme laine fine artisanale",
                                                "Laine merinos broderies fines faites main. S M L XL. Mode marocaine authentique.",
                                                "djellaba mode artisanal marocain vêtement laine homme",
                                                "Mode & Textile", "850", "Fès",
                                                "https://images.unsplash.com/photo-1716338855822-7bfb06b0ab72?w=500",
                                                "200", "68", "4.8", "false" },
                                new String[] { "Caftan mariage soie brodé",
                                                "Soie naturelle broderies dorées main. Modèle unique. Mode festive marocaine.",
                                                "caftan mode marocain vêtement soie mariage brodé femme",
                                                "Mode & Textile", "3500", "Casablanca",
                                                "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500",
                                                "95", "12", "5.0", "true" },
                                new String[] { "Nike Air Max 270 Blanc Noir",
                                                "Pointure 42 mode streetwear. Authenticité garantie avec boîte originale.",
                                                "nike sneakers chaussures mode sport streetwear vêtements",
                                                "Mode & Textile", "1200", "Casablanca",
                                                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
                                                "240", "30", "4.4", "false" },
                                new String[] { "Jellaba femme motifs géométriques",
                                                "Jersey polyester légère élégante. Mode marocaine tendance femme contemporaine.",
                                                "jellaba mode marocain vêtement femme contemporain moderne",
                                                "Mode & Textile", "450", "Rabat",
                                                "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500",
                                                "170", "45", "4.3", "false" },
                                new String[] { "Burnous berbère laine vierge",
                                                "Tissé artisanes Haut Atlas. Laine vierge non traitée. Mode traditionnelle pièce unique.",
                                                "burnous mode artisanal marocain berbère vêtement laine",
                                                "Mode & Textile", "1800", "Marrakech",
                                                "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500",
                                                "130", "20", "4.9", "true" },

                                // ── Immobilier (5) ─────────────────────────────────────────────
                                new String[] { "Appartement 2P Maarif Casablanca",
                                                "65m² rénové 2 chambres cuisine équipée balcon parking sécurisé. Disponible.",
                                                "appartement immobilier location Casablanca logement résidentiel",
                                                "Immobilier", "6500", "Casablanca",
                                                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500",
                                                "410", "0", "4.2", "false" },
                                new String[] { "Villa piscine Palmeraie Marrakech",
                                                "4 chambres 300m² jardin piscine 12m vue Atlas. Immobilier luxe.",
                                                "villa immobilier luxe piscine Marrakech propriété résidentiel",
                                                "Immobilier", "45000", "Marrakech",
                                                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500",
                                                "280", "0", "4.9", "true" },
                                new String[] { "Studio meublé Agdal Rabat",
                                                "35m² meublé WiFi résidence sécurisée. Étudiant jeune professionnel.",
                                                "studio appartement immobilier location Rabat meublé étudiant",
                                                "Immobilier", "3200", "Rabat",
                                                "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500",
                                                "360", "0", "4.0", "false" },
                                new String[] { "Riad Médina Fès à vendre",
                                                "6 chambres patio fontaine. Potentiel touristique. Immobilier patrimonial.",
                                                "riad immobilier traditionnel médina Fès propriété", "Immobilier",
                                                "1200000", "Fès",
                                                "https://images.unsplash.com/photo-1519176336535-4e7a5f2e8f12?w=500",
                                                "190", "0", "4.6", "false" },
                                new String[] { "Bureau Quartier Affaires Casablanca",
                                                "120m² 8 postes salle réunion kitchenette. Immeuble classe A.",
                                                "bureau immobilier professionnel Casablanca commercial entreprise",
                                                "Immobilier", "25000", "Casablanca",
                                                "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500",
                                                "230", "0", "4.4", "true" },

                                // ── Sport & Loisirs (5) ────────────────────────────────────────
                                new String[] { "Vélo VTT Decathlon ROCKRider",
                                                "27 vitesses fourche suspendue freins hydrauliques. Randonnée sport.",
                                                "vélo VTT sport montagne fitness loisirs randonnée équipement",
                                                "Sport & Loisirs", "2200", "Casablanca",
                                                "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=500",
                                                "270", "15", "4.5", "false" },
                                new String[] { "Tapis yoga TPE premium 6mm",
                                                "183x61cm antidérapant. Méditation pilates sport maison.",
                                                "yoga sport fitness méditation loisirs tapis pilates",
                                                "Sport & Loisirs", "349", "Rabat",
                                                "https://images.unsplash.com/photo-1593810450967-f9c42742e326?w=500",
                                                "420", "88", "4.6", "false" },
                                new String[] { "Haltères réglables 20kg Home Gym",
                                                "5 à 20kg acier chromé. Fitness musculation maison.",
                                                "haltères fitness sport musculation home-gym entraînement",
                                                "Sport & Loisirs", "1100", "Casablanca",
                                                "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500",
                                                "340", "62", "4.7", "false" },
                                new String[] { "Raquette tennis Wilson Pro Staff",
                                                "Cordage Head Hawk inclus. Tennis haut de gamme compétition.",
                                                "tennis raquette Wilson sport loisirs équipement pro",
                                                "Sport & Loisirs", "1800", "Marrakech",
                                                "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=500",
                                                "155", "20", "4.8", "true" },
                                new String[] { "Kayak gonflable 2 places",
                                                "Intex Explorer K2 rames aluminium. Sport nautique mer lac.",
                                                "kayak sport nautique loisirs rivière mer équipement",
                                                "Sport & Loisirs", "1500", "Agadir",
                                                "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500",
                                                "180", "25", "4.4", "false" });
        }

        // ─── DTOs ─────────────────────────────────────────────────────────────────

        public record PersonalizedRequest(
                        List<Long> viewedIds,
                        String location,
                        String searchQuery) {
        }
}

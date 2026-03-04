package com.publicity_platform.project.config;

import com.publicity_platform.project.entity.*;
import com.publicity_platform.project.enumm.StatutProduit;
import com.publicity_platform.project.enumm.TypeAnnonce;
import com.publicity_platform.project.enumm.TypePrix;
import com.publicity_platform.project.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Objects;
import java.util.Set;

@Configuration
public class DataInitializer {

        private final RoleRepository roleRepository;
        private final CategorieRepository categorieRepository;
        private final UtilisateurRepository utilisateurRepository;
        private final PasswordEncoder passwordEncoder;
        private final ProduitRepository produitRepository;

        public DataInitializer(RoleRepository roleRepository,
                        CategorieRepository categorieRepository,
                        UtilisateurRepository utilisateurRepository,
                        PasswordEncoder passwordEncoder,
                        ProduitRepository produitRepository) {
                this.roleRepository = roleRepository;
                this.categorieRepository = categorieRepository;
                this.utilisateurRepository = utilisateurRepository;
                this.passwordEncoder = passwordEncoder;
                this.produitRepository = produitRepository;
        }

        @Bean
        public CommandLineRunner initData() {
                return args -> {
                        // ── Rôles de base ─────────────────────────────────────────────────
                        createRoleIfNotFound("SUPERADMIN");
                        createRoleIfNotFound("ADJOINTADMIN");
                        createRoleIfNotFound("ANNONCEUR");
                        createRoleIfNotFound("CLIENT");
                        createRoleIfNotFound("VISITEUR");

                        createRoleIfNotFound("SARL", "Société à Responsabilité Limitée");
                        createRoleIfNotFound("AUTO_ENTREPRENEUR", "Auto-entrepreneur");
                        createRoleIfNotFound("COOPERATIVE", "Coopérative");
                        createRoleIfNotFound("SOCIETE_LIVRAISON", "Société de livraison/stockage");
                        createRoleIfNotFound("MAGASIN", "Magasin physique");
                        createRoleIfNotFound("LIVREUR", "Service de livraison");
                        createRoleIfNotFound("STOCKEUR", "Service de stockage");

                        // ── Catégories ────────────────────────────────────────────────────
                        createCategoryIfNotFound("Santé", "Produits et services de santé", "🏥");
                        createCategoryIfNotFound("Technologie", "Électronique et gadgets", "💻");
                        createCategoryIfNotFound("Immobilier", "Vente et location de biens", "🏠");
                        createCategoryIfNotFound("Automobile", "Voitures, motos et accessoires", "🚗");
                        createCategoryIfNotFound("Mode & Textile", "Vêtements et accessoires", "👗");
                        createCategoryIfNotFound("Services", "Services professionnels", "🔧");
                        createCategoryIfNotFound("Alimentation", "Produits alimentaires et terroir marocain", "🍕");
                        createCategoryIfNotFound("Maison & Jardin", "Meubles et décoration", "🛋️");
                        createCategoryIfNotFound("Cosmétique & Beauté", "Soins et produits de beauté", "💄");
                        createCategoryIfNotFound("Artisanat", "Produits artisanaux marocains", "🏺");
                        createCategoryIfNotFound("Sport & Loisirs", "Équipements sportifs et loisirs", "⚽");
                        createCategoryIfNotFound("Bébé & Enfant", "Jouets, vêtements et puériculture", "🧸");

                        // ── Admin ─────────────────────────────────────────────────────────
                        createSuperAdminIfNotFound();
                        promoteZinebIfFound();

                        // ── Mock Products for Recommendation System ────────────────────
                        injectMockProductsIfNeeded();
                };
        }

        // ─── MOCK PRODUCTS ────────────────────────────────────────────────────────
        /**
         * Injects 30 carefully crafted products across 6 categories.
         * Each category has 5 products with overlapping keywords so the scoring
         * engine produces clear, testable recommendation clusters.
         *
         * Test scenarios covered:
         * 1. Category cluster — 5 Santé products → recommend the other 4
         * 2. Keyword cluster — "bio", "argan", "naturel" appear across Santé+Alim
         * 3. Location signal — Casablanca vs Marrakech filtering
         * 4. Popularity signal — high compteurVues + nombreVentes boost
         * 5. Rating signal — noteMoyenne >= 4.0 gets +15pts
         * 6. premium signal — premium products bubble up
         */
        private void injectMockProductsIfNeeded() {
                if (produitRepository.count() > 0) {
                        System.out.println("[MockData] Produits déjà présents — injection ignorée.");
                        return;
                }

                Utilisateur admin = utilisateurRepository.findByAdresseEmail("admin@souqbladi.ma").orElse(null);
                if (admin == null) {
                        System.err.println("[MockData] Admin introuvable — injection annulée.");
                        return;
                }

                System.out.println("[MockData] Injection de 30 produits de test...");

                // ─────────────────────────────────────────────────────────────────────
                // CATÉGORIE : SANTÉ (5 produits — cluster santé)
                // Keywords communs : santé, complément, naturel, bio, vitamines, bien-être
                // ─────────────────────────────────────────────────────────────────────
                Categorie sante = getCat("Santé");

                createProduct(
                                "Complément alimentaire Oméga-3 Premium",
                                "Huile de poisson pure certifiée, 1000mg par capsule. Idéal pour la santé cardiovasculaire et le bien-être articulaire. Naturel et sans additifs.",
                                "santé complément naturel oméga bio capsule bien-être",
                                sante, 189.0, "Casablanca",
                                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500",
                                450L, 95L, 4.7, false, admin);

                createProduct(
                                "Multivitamines Bio SouqSanté — 60 gélules",
                                "Complexe de 20 vitamines et minéraux 100% naturels. Renforcez vos défenses immunitaires. Certifié bio, sans gluten, sans OGM.",
                                "vitamines minéraux bio naturel santé immunité complément",
                                sante, 149.0, "Rabat",
                                "https://images.unsplash.com/photo-1550572017-edd951b55104?w=500",
                                320L, 62L, 4.5, false, admin);

                createProduct(
                                "Huile de nigelle Habba Sawda pure 250ml",
                                "100% naturelle et non raffinée, pressée à froid. Reconnue pour ses propriétés anti-inflammatoires et immunostimulantes. Santé au naturel.",
                                "nigelle naturel bio santé anti-inflammatoire huile bien-être",
                                sante, 99.0, "Marrakech",
                                "https://images.unsplash.com/photo-1616405745745-f3f0d5c80ae8?w=500",
                                580L, 180L, 4.9, true, admin);

                createProduct(
                                "Spiruline bio poudre 200g — Superfood marocain",
                                "Spiruline cultivée au Maroc, riche en protéines, fer et vitamines B. Idéal pour sportifs et végétariens. Complément alimentaire naturel.",
                                "spiruline bio protéine fer vitamine superfood santé complément naturel",
                                sante, 129.0, "Agadir",
                                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
                                210L, 44L, 4.6, false, admin);

                createProduct(
                                "Tisane bien-être Souq — Mélange 12 plantes",
                                "Infusion relaxante aux plantes médicinales marocaines : menthe, anis, thym, lavande. Naturel, sans conservateurs. Santé et détente.",
                                "tisane plantes naturel bien-être santé menthe relaxant bio marocain",
                                sante, 59.0, "Fès",
                                "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500",
                                160L, 38L, 4.4, false, admin);

                // ─────────────────────────────────────────────────────────────────────
                // CATÉGORIE : TECHNOLOGIE (5 produits — cluster tech)
                // Keywords communs : smartphone, laptop, électronique, gaming, tech
                // ─────────────────────────────────────────────────────────────────────
                Categorie tech = getCat("Technologie");

                createProduct(
                                "iPhone 15 Pro Max 256Go — État neuf",
                                "Apple iPhone 15 Pro Max Noir Titanium. Utilisé 3 mois. Garantie constructeur restante. Chargeur et boîte originaux. Smartphone premium.",
                                "iphone apple smartphone premium tech électronique mobile",
                                tech, 12500.0, "Casablanca",
                                "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
                                780L, 18L, 4.8, true, admin);

                createProduct(
                                "Samsung Galaxy S24 Ultra 12Go RAM",
                                "Le flagship Android de Samsung, stylet S-Pen inclus. Caméra 200MP. Écran AMOLED 6.8'. Reconditionnné grade A. Smartphone tech haut de gamme.",
                                "samsung galaxy smartphone android tech premium électronique mobile",
                                tech, 9800.0, "Rabat",
                                "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500",
                                510L, 12L, 4.6, false, admin);

                createProduct(
                                "Laptop Gaming ASUS ROG Strix G15 — RTX 3070",
                                "Processeur Ryzen 9 5900HX, RTX 3070 8Go, 16Go RAM DDR4, 512Go NVMe SSD. Écran 165Hz. Idéal gaming et design. Laptop informatique puissant.",
                                "laptop gaming asus informatique RTX techni électronique PC portable",
                                tech, 17800.0, "Casablanca",
                                "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500",
                                390L, 7L, 4.7, true, admin);

                createProduct(
                                "Écouteurs Sony WH-1000XM5 sans fil",
                                "Réduction de bruit active leader du marché. Autonomie 30h. Bluetooth multipoint. Son Hi-Res. Tech audio premium. Recommandé pour télétravail.",
                                "sony écouteurs audio bluetooth tech premium sans-fil bruit",
                                tech, 2800.0, "Fès",
                                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
                                290L, 35L, 4.7, false, admin);

                createProduct(
                                "Tablette iPad Air 5 — M1 256Go WiFi",
                                "Apple iPad Air 5ème génération, puce M1, écran Liquid Retina 10.9'. Parfait pour créatifs et étudiants. Tech ultraportable. Clavier vendu séparément.",
                                "ipad apple tablette tech électronique créatif étudiant",
                                tech, 6500.0, "Marrakech",
                                "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500",
                                310L, 22L, 4.5, false, admin);

                // ─────────────────────────────────────────────────────────────────────
                // CATÉGORIE : ALIMENTATION (5 produits — cluster alimentaire)
                // Keywords communs : bio, naturel, marocain, terroir, argan
                // ─────────────────────────────────────────────────────────────────────
                Categorie alim = getCat("Alimentation");

                createProduct(
                                "Huile d'argan alimentaire bio — 500ml",
                                "Extraite artisanalement par coopérative de femmes à Essaouira. Label bio européen. Idéale en cuisine marocaine. Naturelle et pure.",
                                "argan bio naturel marocain terroir huile alimentaire coopérative",
                                alim, 320.0, "Essaouira",
                                "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500",
                                550L, 210L, 4.9, true, admin);

                createProduct(
                                "Couscous bio de blé dur artisanal — 2kg",
                                "Produit dans les plaines du Haouz. Séchage naturel au soleil, sans additifs. Conditionnement familial. Terroir marocain authentique.",
                                "couscous bio artisanal marocain naturel terroir blé alimentaire",
                                alim, 85.0, "Marrakech",
                                "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500",
                                690L, 315L, 4.6, false, admin);

                createProduct(
                                "Miel de thym sauvage du Moyen Atlas — 500g",
                                "Récolté dans les ruchers du Moyen Atlas, 100% naturel et brut. Riche en antioxydants et en propriétés antibactériennes. Alimentaire & santé.",
                                "miel naturel bio marocain terroir Atlas santé alimentaire rucher",
                                alim, 180.0, "Ifrane",
                                "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=500",
                                430L, 140L, 4.8, false, admin);

                createProduct(
                                "Épices Ras El Hanout Premium — 250g",
                                "Mélange artisanal de 30 épices marocaines. Cultivées en agriculture raisonnée. Idéal tajine et couscous. Conditionnement hermétique.",
                                "épices marocain artisanal tajine couscous naturel terroir alimentaire",
                                alim, 55.0, "Fès",
                                "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500",
                                820L, 410L, 4.7, false, admin);

                createProduct(
                                "Huile d'olive extra vierge Prestige — 1L",
                                "Olives Picholine marocaines, première pression à froid. Acidité < 0.3%. Certifiée AOP Meknès. Alimentaire haut de gamme, livraison Casablanca.",
                                "huile olive naturel bio marocain terroir alimentaire AOP Meknès",
                                alim, 145.0, "Casablanca",
                                "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500",
                                370L, 155L, 4.8, true, admin);

                // ─────────────────────────────────────────────────────────────────────
                // CATÉGORIE : MODE & TEXTILE (5 produits — cluster mode)
                // Keywords communs : vêtement, mode, artisanal, djellaba, caftan
                // ─────────────────────────────────────────────────────────────────────
                Categorie mode = getCat("Mode & Textile");

                createProduct(
                                "Djellaba homme broderie artisanale — Laine fine",
                                "Djellaba en laine merinos Ifrane avec broderies fines faites main. Disponible en S, M, L, XL. Mode vestimentaire marocaine authentique.",
                                "djellaba mode artisanal marocain vêtement laine homme traditionnel",
                                mode, 850.0, "Fès",
                                "https://images.unsplash.com/photo-1716338855822-7bfb06b0ab72?w=500",
                                200L, 68L, 4.8, false, admin);

                createProduct(
                                "Caftan de mariage brodé — Soie naturelle",
                                "Caftan nuptial en soie naturelle, broderies dorées à la main. Modèle unique, taille 38-40. Mode festive marocaine haut de gamme.",
                                "caftan mode marocain vêtement soie mariage brodé artisanal femme",
                                mode, 3500.0, "Casablanca",
                                "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500",
                                95L, 12L, 5.0, true, admin);

                createProduct(
                                "Sneakers Nike Air Max 270 React — Blanc/Noir",
                                "Chaussures de sport originales Nike, pointure 42. Semelle Air Max 270. Mode streetwear contemporain. Authenticité garantie avec boîte.",
                                "nike sneakers chaussures mode sport streetwear vêtements",
                                mode, 1200.0, "Casablanca",
                                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
                                240L, 30L, 4.4, false, admin);

                createProduct(
                                "Jellaba femme moderne — Motifs géométriques",
                                "Jellaba contemporaine en jersey polyester, motifs géométriques imprimés. Légère et élégante. Mode marocaine tendance pour femme.",
                                "jellaba mode marocain vêtement femme contemporain moderne tendance",
                                mode, 450.0, "Rabat",
                                "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500",
                                170L, 45L, 4.3, false, admin);

                createProduct(
                                "Burnous berbère fait main — Laine vierge",
                                "Burnous authentique tissé par des artisanes berbères du Haut Atlas. Laine vierge non traitée. Pièce unique de mode traditionnelle marocaine.",
                                "burnous mode artisanal marocain berbère vêtement laine traditionnel",
                                mode, 1800.0, "Marrakech",
                                "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500",
                                130L, 20L, 4.9, true, admin);

                // ─────────────────────────────────────────────────────────────────────
                // CATÉGORIE : IMMOBILIER (5 produits — cluster immo)
                // Keywords communs : appartement, villa, location, Casablanca, Marrakech
                // ─────────────────────────────────────────────────────────────────────
                Categorie immo = getCat("Immobilier");

                createProduct(
                                "Appartement 2 pièces Maarif — Casablanca",
                                "Appartement rénové, 65m², 2 chambres, cuisine équipée, balcon, parking sécurisé. Immeuble récent. Disponible immédiatement. Casablanca centre.",
                                "appartement immobilier location Casablanca logement résidentiel",
                                immo, 6500.0, "Casablanca",
                                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500",
                                410L, 0L, 4.2, false, admin);

                createProduct(
                                "Villa avec piscine privée — Palmeraie Marrakech",
                                "Villa contemporaine 4 chambres, 300m², jardin paysagé, piscine privée 12m. Vue sur l'Atlas. Immobilier luxe à Marrakech.",
                                "villa immobilier luxe piscine Marrakech propriété résidentiel",
                                immo, 45000.0, "Marrakech",
                                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500",
                                280L, 0L, 4.9, true, admin);

                createProduct(
                                "Studio meublé — Agdal Rabat",
                                "Studio lumineux 35m², entièrement meublé, WiFi inclus, résidence sécurisée. Idéal étudiant ou jeune professionnel. Rabat Agdal.",
                                "studio appartement immobilier location Rabat meublé étudiant logement",
                                immo, 3200.0, "Rabat",
                                "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500",
                                360L, 0L, 4.0, false, admin);

                createProduct(
                                "Riad traditionnel à vendre — Médina Fès",
                                "Riad authentique 6 chambres, patio central fontaine. À rénover. Fort potentiel touristique. Immobilier patrimonial médina de Fès.",
                                "riad immobilier traditionnel médina Fès vendure propriété",
                                immo, 1200000.0, "Fès",
                                "https://images.unsplash.com/photo-1519176336535-4e7a5f2e8f12?w=500",
                                190L, 0L, 4.6, false, admin);

                createProduct(
                                "Bureau professionnel — Quartier des Affaires Casa",
                                "Espace bureau 120m² open-space, 8 postes, salle de réunion, kitchenette. Immeuble classe A. Immobilier professionnel Casablanca.",
                                "bureau immobilier professionnel Casablanca commercial espace entreprise",
                                immo, 25000.0, "Casablanca",
                                "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500",
                                230L, 0L, 4.4, true, admin);

                // ─────────────────────────────────────────────────────────────────────
                // CATÉGORIE : SPORT & LOISIRS (5 produits — cluster sport)
                // Keywords communs : sport, fitness, entraînement, équipement
                // ─────────────────────────────────────────────────────────────────────
                Categorie sport = getCat("Sport & Loisirs");

                createProduct(
                                "Vélo VTT tout-terrain Decathlon ROCKRIDER",
                                "VTT 27 vitesses, fourche suspendue, freins hydrauliques. Idéal randonnée et sport en montagne. Bon état, peu utilisé.",
                                "vélo VTT sport montagne fitness loisirs randonnée équipement",
                                sport, 2200.0, "Casablanca",
                                "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=500",
                                270L, 15L, 4.5, false, admin);

                createProduct(
                                "Tapis de yoga premium antidérapant — 6mm",
                                "Tapis de yoga en TPE naturel, 183x61cm, 6mm épaisseur. Idéal méditation, pilates et sport maison. Livraison partout au Maroc.",
                                "yoga sport fitness méditation loisirs tapis pilates entraînement",
                                sport, 349.0, "Rabat",
                                "https://images.unsplash.com/photo-1593810450967-f9c42742e326?w=500",
                                420L, 88L, 4.6, false, admin);

                createProduct(
                                "Haltères réglables 20kg — Home Gym",
                                "Paire d'haltères réglables de 5 à 20kg. Acier chromé, antidérapant. Parfait pour fitness maison. Sport sans salle de gym.",
                                "haltères fitness sport musculation home-gym entraînement équipement",
                                sport, 1100.0, "Casablanca",
                                "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500",
                                340L, 62L, 4.7, false, admin);

                createProduct(
                                "Raquette de tennis Wilson Pro Staff",
                                "Wilson Pro Staff RF 97, cordage Head Hawk inclus. Sport de raquette haut de gamme. Similaire à celle de Roger Federer.",
                                "tennis raquette Wilson sport loisirs équipement pro",
                                sport, 1800.0, "Marrakech",
                                "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=500",
                                155L, 20L, 4.8, true, admin);

                createProduct(
                                "Kayak gonflable 2 places — Rivière & Mer",
                                "Kayak Intex Explorer K2, charge max 180kg, rames aluminium incluses. Idéal sport nautique et loisirs en mer ou lac.",
                                "kayak sport nautique loisirs rivière mer équipement gonflable",
                                sport, 1500.0, "Agadir",
                                "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500",
                                180L, 25L, 4.4, false, admin);

                System.out.println("[MockData] ✅ 30 produits de test injectés avec succès !");
                System.out.println("[MockData] Clusters de test disponibles :");
                System.out.println("[MockData]  - Santé (5 produits) : Casablanca, Rabat, Marrakech, Agadir, Fès");
                System.out.println("[MockData]  - Technologie (5 produits) : Casablanca x2, Rabat, Fès, Marrakech");
                System.out.println("[MockData]  - Alimentation (5 produits) : Essaouira, Marrakech, Ifrane, Fès, Casa");
                System.out.println("[MockData]  - Mode & Textile (5 produits) : Fès, Casablanca x2, Rabat, Marrakech");
                System.out.println("[MockData]  - Immobilier (5 produits) : Casa x2, Rabat, Fès, Marrakech");
                System.out.println("[MockData]  - Sport & Loisirs (5 produits) : Casa x2, Rabat, Marrakech, Agadir");
        }

        private void createProduct(String titre, String desc, String tags, Categorie cat,
                        double prix, String ville, String imageUrl,
                        long vues, long ventes, double note,
                        boolean premium, Utilisateur admin) {
                Produit p = new Produit();
                p.setTitreProduit(titre);
                p.setDescriptionDetaillee(desc);
                p.setDescriptionCourte(desc.length() > 120 ? desc.substring(0, 117) + "..." : desc);
                p.setTags(tags);
                p.setCategorie(cat);
                p.setPrixAfiche(prix);
                p.setVilleLocalisation(ville);
                p.setImageUrl(imageUrl);
                p.setCompteurVues(vues);
                p.setNombreVentes(ventes);
                p.setNoteMoyenne(note);
                p.setNombreAvis((int) (ventes > 5 ? ventes / 2 : ventes));
                p.setStatutProduit(StatutProduit.ACTIVE);
                p.setTypeAnnonce(TypeAnnonce.PRODUIT_PHYSIQUE);
                p.setTypePrix(TypePrix.PRIX_FIXE);
                p.setAnnonceur(admin);
                // premium signal via nombreVentes boost (>= 50 triggers premium score)
                if (premium)
                        p.setNombreVentes(Math.max(ventes, 55L));
                produitRepository.save(p);
        }

        private Categorie getCat(String name) {
                return categorieRepository.findAll().stream()
                                .filter(c -> c.getNomCategorie().equals(name))
                                .findFirst().orElse(null);
        }

        // ─── Role & Category helpers ──────────────────────────────────────────────

        private void createSuperAdminIfNotFound() {
                String adminEmail = "admin@souqbladi.ma";
                if (utilisateurRepository.findByAdresseEmail(adminEmail).isEmpty()) {
                        Role superAdminRole = roleRepository.findByName("SUPERADMIN")
                                        .orElseGet(() -> roleRepository.save(new Role("SUPERADMIN")));
                        Role adjointRole = roleRepository.findByName("ADJOINTADMIN")
                                        .orElseGet(() -> roleRepository.save(new Role("ADJOINTADMIN")));

                        Utilisateur admin = Utilisateur.builder()
                                        .nomComplet("Super Administrateur SouqBladi")
                                        .adresseEmail(adminEmail)
                                        .motDePasseHache(passwordEncoder.encode("Admin1234!"))
                                        .numeroDeTelephone("+212600000000")
                                        .roles(Set.of(superAdminRole, adjointRole))
                                        .compteActif(true)
                                        .emailVerifie(true)
                                        .build();
                        utilisateurRepository.save(Objects.requireNonNull(admin));
                        System.out.println("=== ADMIN SOUQBLADI CRÉÉ: admin@souqbladi.ma / Admin1234! ===");
                }
        }

        private void createCategoryIfNotFound(String name, String desc, String icon) {
                if (categorieRepository.findAll().stream().noneMatch(c -> c.getNomCategorie().equals(name))) {
                        Categorie cat = Categorie.builder()
                                        .nomCategorie(name)
                                        .descriptionCategorie(desc)
                                        .iconeCategorie(icon)
                                        .categorieActive(true)
                                        .build();
                        categorieRepository.save(Objects.requireNonNull(cat));
                }
        }

        private void createRoleIfNotFound(@NonNull String name) {
                if (roleRepository.findByName(name).isEmpty()) {
                        roleRepository.save(new Role(name));
                }
        }

        private void createRoleIfNotFound(@NonNull String name, String description) {
                if (roleRepository.findByName(name).isEmpty()) {
                        roleRepository.save(new Role(name, description));
                }
        }

        private void promoteZinebIfFound() {
                utilisateurRepository.findAll().stream()
                                .filter(u -> u.getNomComplet().toLowerCase().contains("zineb") ||
                                                u.getAdresseEmail().toLowerCase().contains("zineb"))
                                .forEach(u -> {
                                        Role superAdminRole = roleRepository.findByName("SUPERADMIN").orElse(null);
                                        if (superAdminRole != null && !u.getRoles().contains(superAdminRole)) {
                                                u.getRoles().add(superAdminRole);
                                                utilisateurRepository.save(u);
                                                System.out.println("DEBUG: Promoted '" + u.getNomComplet()
                                                                + "' to SUPERADMIN.");
                                        }
                                });
        }
}

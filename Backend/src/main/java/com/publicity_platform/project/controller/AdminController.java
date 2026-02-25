package com.publicity_platform.project.controller;

import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.dto.ProduitDto;
import com.publicity_platform.project.dto.UtilisateurDto;

import com.publicity_platform.project.entity.Role;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.enumm.StatutValidation;
import com.publicity_platform.project.repository.CategorieRepository;
import com.publicity_platform.project.repository.ProduitRepository;
import com.publicity_platform.project.repository.RoleRepository;
import com.publicity_platform.project.repository.UtilisateurRepository;
import com.publicity_platform.project.entity.HistoriqueValidation;
import com.publicity_platform.project.repository.HistoriqueValidationRepository;
import com.publicity_platform.project.service.ProduitService;
import com.publicity_platform.project.entity.Categorie;
import com.publicity_platform.project.service.CategorieService;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasAnyRole('ADJOINTADMIN', 'SUPERADMIN')")
public class AdminController {

    private final ProduitService produitService;
    private final ProduitRepository produitRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final CategorieRepository categorieRepository;
    private final HistoriqueValidationRepository historiqueValidationRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategorieService categorieService;

    public AdminController(ProduitService produitService,
            ProduitRepository produitRepository,
            UtilisateurRepository utilisateurRepository,
            RoleRepository roleRepository,
            CategorieRepository categorieRepository,
            HistoriqueValidationRepository historiqueValidationRepository,
            PasswordEncoder passwordEncoder,
            CategorieService categorieService) {
        this.produitService = produitService;
        this.produitRepository = produitRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.roleRepository = roleRepository;
        this.categorieRepository = categorieRepository;
        this.historiqueValidationRepository = historiqueValidationRepository;
        this.passwordEncoder = passwordEncoder;
        this.categorieService = categorieService;
    }

    // ============================
    // DASHBOARD STATS
    // ============================

    @GetMapping("/dashboard/stats")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        System.out.println("DEBUG: Calculating Dashboard Stats...");
        Map<String, Object> stats = new HashMap<>();

        long total = produitRepository.count();
        long pending = produitRepository.countByStatutValidation(StatutValidation.EN_ATTENTE);
        long validated = produitRepository.countByStatutValidation(StatutValidation.VALIDE);
        long active = produitRepository.countByStatutValidation(StatutValidation.ACTIVEE);
        long refused = produitRepository.countByStatutValidation(StatutValidation.REFUSE);

        List<Produit> allProducts = produitRepository.findAll();
        long totalVues = allProducts.stream()
                .mapToLong(p -> p.getCompteurVues() != null ? p.getCompteurVues() : 0L)
                .sum();

        List<Utilisateur> allUsers = utilisateurRepository.findAll();
        long usersCount = allUsers.size();

        long advertisersCount = allUsers.stream()
                .filter(u -> u.getRoles().stream()
                        .anyMatch(r -> r.getName().equals("ANNONCEUR") || r.getName().equals("ROLE_ANNONCEUR")))
                .count();

        long adminsCount = allUsers.stream()
                .filter(u -> u.getRoles().stream()
                        .anyMatch(r -> r.getName().equals("SUPERADMIN") || r.getName().equals("ROLE_SUPERADMIN") ||
                                r.getName().equals("ADJOINTADMIN") || r.getName().equals("ROLE_ADJOINTADMIN")))
                .count();

        System.out.println("DEBUG: Stats calculated - Total Products: " + total + ", Users: " + usersCount);

        stats.put("produitsTotal", total);
        stats.put("totalProduits", total); // Redondance pour compatibilité
        stats.put("produitsEnAttente", pending);
        stats.put("totalEnAttente", pending);
        stats.put("produitsValides", validated);
        stats.put("produitsActifs", active);
        stats.put("produitsRefuses", refused);
        stats.put("totalVues", totalVues);

        stats.put("utilisateursTotal", usersCount);
        stats.put("totalUtilisateurs", usersCount); // Redondance
        stats.put("utilisateursAnnonceurs", advertisersCount);
        stats.put("utilisateursAdmins", adminsCount);

        List<Categorie> allCats = categorieRepository.findAll();
        stats.put("categoriesCount", (long) allCats.size());
        stats.put("totalLogs", historiqueValidationRepository.count());

        stats.put("debug_info", "Backend v2.1 - " + LocalDateTime.now());
        stats.put("db_empty", (total == 0 && usersCount <= 1));

        // Répartition par catégorie + Recherche de la catégorie "Hot"
        List<Map<String, Object>> categoryDistribution = new ArrayList<>();
        String hotCatName = "Aucune";
        long maxCatVues = -1;

        for (Categorie cat : allCats) {
            List<Produit> catProds = allProducts.stream()
                    .filter(p -> p.getCategorie() != null && p.getCategorie().getId().equals(cat.getId()))
                    .toList();
            long count = catProds.size();
            long catVues = catProds.stream().mapToLong(p -> p.getCompteurVues() != null ? p.getCompteurVues() : 0L)
                    .sum();

            if (catVues > maxCatVues && count > 0) {
                maxCatVues = catVues;
                hotCatName = cat.getNomCategorie();
            }

            if (count > 0) {
                Map<String, Object> item = new HashMap<>();
                item.put("nom", cat.getNomCategorie());
                item.put("count", count);
                categoryDistribution.add(item);
            }
        }
        stats.put("repartitionCategories", categoryDistribution);
        stats.put("hotCategory", hotCatName);

        // Top 5 produits (Utilisation de DTO pour éviter les cycles de sérialisation)
        List<ProduitDto> topProducts = produitRepository.findTop5ByOrderByCompteurVuesDesc().stream()
                .map(ProduitDto::fromEntity)
                .toList();
        stats.put("topProducts", topProducts);

        // Top 5 annonceurs
        List<Map<String, Object>> advertisersSummary = allUsers.stream()
                .filter(u -> u.getProduits() != null && !u.getProduits().isEmpty())
                .sorted((u1, u2) -> Integer.compare(u2.getProduits().size(), u1.getProduits().size()))
                .limit(5)
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("nomComplet", u.getNomComplet());
                    map.put("annonceCount", u.getProduits().size());
                    return map;
                }).toList();
        stats.put("topAdvertisers", advertisersSummary);

        return ResponseEntity.ok(stats);
    }

    // ============================
    // PRODUCT MANAGEMENT
    // ============================

    @GetMapping("/products")
    public ResponseEntity<List<ProduitDto>> getAllProducts(
            @RequestParam(required = false) String statut) {
        if (statut != null) {
            try {
                StatutValidation sv = StatutValidation.valueOf(statut.toUpperCase());
                return ResponseEntity.ok(produitService.getProductsByStatus(sv));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }
        return ResponseEntity.ok(produitService.getAllProducts());
    }

    @GetMapping("/pending-products")
    public ResponseEntity<List<ProduitDto>> getPendingProducts() {
        return ResponseEntity.ok(produitService.getPendingProducts());
    }

    @PostMapping("/products/{id}/validate")
    public ResponseEntity<ProduitDto> validate(@PathVariable @NonNull Long id,
            @RequestBody Map<String, Integer> body,
            @AuthenticationPrincipal Utilisateur admin) {
        int duration = body.getOrDefault("durationMonths", 12);
        return ResponseEntity.ok(produitService.validateProductDto(id, duration, admin));
    }

    @PostMapping("/products/{id}/reject")
    public ResponseEntity<ProduitDto> reject(@PathVariable @NonNull Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Utilisateur admin) {
        String reason = body.getOrDefault("reason", "Non conforme aux conditions");
        return ResponseEntity.ok(produitService.rejectProductDto(id, reason, admin));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable @NonNull Long id) {
        produitService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/products/{id}/archive")
    public ResponseEntity<Void> archiveProduct(@PathVariable @NonNull Long id,
            @AuthenticationPrincipal Utilisateur admin) {
        produitService.archiveProduct(id, admin);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProduitDto> updateProduct(@PathVariable @NonNull Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Utilisateur admin) {
        Produit p = produitService.getProductById(id);
        if (body.containsKey("titreProduit"))
            p.setTitreProduit((String) body.get("titreProduit"));
        if (body.containsKey("descriptionDetaillee"))
            p.setDescriptionDetaillee((String) body.get("descriptionDetaillee"));

        Produit saved = produitService.saveProduct(p);

        // Log modification
        historiqueValidationRepository.save(HistoriqueValidation.builder()
                .actionEffectuee("MODIFICATION")
                .adminResponsable(admin)
                .produitConcerne(saved)
                .ancienStatut(saved.getStatutValidation())
                .nouveauStatut(saved.getStatutValidation())
                .commentaireAdmin("Modification des informations de l'annonce")
                .build());

        return ResponseEntity.ok(ProduitDto.fromEntity(saved));
    }

    // ============================
    // USER MANAGEMENT
    // ============================

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = new ArrayList<>();
        utilisateurRepository.findAll().forEach(u -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", u.getId());
            dto.put("nomComplet", u.getNomComplet());
            dto.put("email", u.getAdresseEmail());
            dto.put("telephone", u.getNumeroDeTelephone());
            dto.put("compteActif", u.getCompteActif());
            dto.put("emailVerifie", u.getEmailVerifie());
            dto.put("dateInscription", u.getDateInscription());
            dto.put("roles", u.getRoles().stream().map(Role::getName).toList());
            users.add(dto);
        });
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users")
    @SuppressWarnings("null")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody Map<String, Object> body) {

        String email = (String) body.get("email");
        if (utilisateurRepository.findByAdresseEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email déjà utilisé"));
        }

        String roleName = (String) body.getOrDefault("role", "VISITEUR");
        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(roleName)));

        Utilisateur user = Utilisateur.builder()
                .nomComplet((String) body.get("nomComplet"))
                .adresseEmail(email)
                .motDePasseHache(passwordEncoder.encode((String) body.get("password")))
                .numeroDeTelephone((String) body.getOrDefault("telephone", ""))
                .roles(Set.of(role))
                .compteActif((Boolean) body.getOrDefault("compteActif", true))
                .emailVerifie((Boolean) body.getOrDefault("emailVerifie", false))
                .build();

        Utilisateur saved = java.util.Objects.requireNonNull(utilisateurRepository.save(user));
        Map<String, Object> resp = new HashMap<>();
        resp.put("id", saved.getId());
        resp.put("email", saved.getAdresseEmail());
        resp.put("nomComplet", saved.getNomComplet());
        resp.put("role", roleName);
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/users/{id}/toggle-active")
    public ResponseEntity<Map<String, Object>> toggleUserActive(@PathVariable @NonNull Long id) {

        Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        user.setCompteActif(!user.getCompteActif());
        utilisateurRepository.save(user);
        return ResponseEntity.ok(Map.of("compteActif", (Object) user.getCompteActif()));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<Map<String, Object>> updateUserRole(@PathVariable @NonNull Long id,

            @RequestBody Map<String, String> body) {
        Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        String roleName = body.get("role");
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé: " + roleName));

        Set<Role> roles = new HashSet<>(user.getRoles());
        roles.add(role);
        user.setRoles(roles);
        utilisateurRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Rôle ajouté avec succès"));
    }

    @PutMapping("/users/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<Utilisateur> updateUser(@PathVariable @NonNull Long id,
            @RequestBody Map<String, Object> body) {
        Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (body.containsKey("nomComplet"))
            user.setNomComplet((String) body.get("nomComplet"));
        if (body.containsKey("email"))
            user.setAdresseEmail((String) body.get("email"));
        if (body.containsKey("telephone"))
            user.setNumeroDeTelephone((String) body.get("telephone"));
        if (body.containsKey("compteActif"))
            user.setCompteActif((Boolean) body.get("compteActif"));
        if (body.containsKey("emailVerifie"))
            user.setEmailVerifie((Boolean) body.get("emailVerifie"));

        if (body.containsKey("roles")) {
            List<String> roleNames = (List<String>) body.get("roles");
            Set<Role> roles = new HashSet<>(roleRepository.findAllByNameIn(roleNames));
            user.setRoles(roles);
        }

        return ResponseEntity.ok(java.util.Objects.requireNonNull(utilisateurRepository.save(user)));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable @NonNull Long id) {

        utilisateurRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/{id}/products")
    public ResponseEntity<List<ProduitDto>> getUserProducts(
            @PathVariable @NonNull Long id) {
        return ResponseEntity.ok(produitService.getProductsByAnnonceur(id));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<HistoriqueValidation>> getLogs() {
        List<HistoriqueValidation> logs = historiqueValidationRepository.findAll();
        logs.sort((l1, l2) -> l2.getDateAction().compareTo(l1.getDateAction()));
        return ResponseEntity.ok(logs);
    }

    // ============================
    // ROLE MANAGEMENT
    // ============================

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(roleRepository.findAll());
    }

    @PostMapping("/roles")
    @SuppressWarnings("null")
    public ResponseEntity<Object> createRole(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String description = body.get("description");

        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Le nom du rôle est obligatoire"));
        }

        if (roleRepository.findByName(name).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Ce rôle technique existe déjà"));
        }
        return ResponseEntity.ok(java.util.Objects.requireNonNull(roleRepository.save(new Role(name, description))));
    }

    @PutMapping("/roles/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<Role> updateRole(@PathVariable @NonNull Long id, @RequestBody Map<String, String> body) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé"));
        if (body.containsKey("name"))
            role.setName(body.get("name"));
        if (body.containsKey("description"))
            role.setDescription(body.get("description"));
        return ResponseEntity.ok(java.util.Objects.requireNonNull(roleRepository.save(role)));
    }

    @DeleteMapping("/roles/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable @NonNull Long id) {
        roleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ============================
    // CATEGORY MANAGEMENT
    // ============================

    @GetMapping("/categories")
    public ResponseEntity<List<Categorie>> getAdminCategories() {
        return ResponseEntity.ok(categorieService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<Object> createAdminCategorie(@RequestBody Map<String, Object> body) {
        if (body.containsKey("seed") && (Boolean) body.get("seed")) {
            seedDefaultCategories();
            return ResponseEntity.ok(Map.of("message", "Données initialisées"));
        }
        Categorie cat = Categorie.builder()
                .nomCategorie((String) body.get("nomCategorie"))
                .descriptionCategorie((String) body.get("descriptionCategorie"))
                .iconeCategorie((String) body.get("iconeCategorie"))
                .categorieActive((Boolean) body.getOrDefault("categorieActive", true))
                .build();
        return ResponseEntity.ok(categorieService.saveCategorie(cat));
    }

    private void seedDefaultCategories() {
        String[][] defaults = {
                { "Santé", "🏥", "Produits et services de santé" },
                { "Technologie", "💻", "Électronique et gadgets" },
                { "Immobilier", "🏠", "Vente et location de biens" },
                { "Automobile", "🚗", "Voitures, motos et accessoires" },
                { "Mode & Textile", "👗", "Vêtements et accessoires" },
                { "Services", "🔧", "Services professionnels" },
                { "Alimentation", "🍕", "Produits alimentaires" },
                { "Maison & Jardin", "🛋️", "Meubles et décoration" }
        };
        for (String[] d : defaults) {
            if (categorieRepository.findAll().stream().noneMatch(c -> c.getNomCategorie().equals(d[0]))) {
                categorieRepository.save(Categorie.builder()
                        .nomCategorie(d[0])
                        .iconeCategorie(d[1])
                        .descriptionCategorie(d[2])
                        .categorieActive(true)
                        .build());
            }
        }
    }

    @PutMapping("/categories/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<Categorie> updateAdminCategorie(@PathVariable @NonNull Long id,
            @RequestBody Map<String, Object> body) {
        Categorie cat = categorieService.getCategorieById(id);
        if (body.containsKey("nomCategorie"))
            cat.setNomCategorie((String) body.get("nomCategorie"));
        if (body.containsKey("descriptionCategorie"))
            cat.setDescriptionCategorie((String) body.get("descriptionCategorie"));
        if (body.containsKey("iconeCategorie"))
            cat.setIconeCategorie((String) body.get("iconeCategorie"));
        if (body.containsKey("categorieActive"))
            cat.setCategorieActive((Boolean) body.get("categorieActive"));

        return ResponseEntity.ok(java.util.Objects.requireNonNull(categorieService.saveCategorie(cat)));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteAdminCategorie(@PathVariable @NonNull Long id) {
        categorieService.deleteCategorie(id);
        return ResponseEntity.noContent().build();
    }
}

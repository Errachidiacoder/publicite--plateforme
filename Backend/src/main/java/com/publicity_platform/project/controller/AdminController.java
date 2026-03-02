package com.publicity_platform.project.controller;

import com.publicity_platform.project.entity.Anonce;
import com.publicity_platform.project.dto.AnonceDto;
import com.publicity_platform.project.dto.ProduitDto;
import com.publicity_platform.project.dto.UtilisateurDto;

import com.publicity_platform.project.entity.Role;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.enumm.StatutValidation;
import com.publicity_platform.project.repository.CategorieRepository;
import com.publicity_platform.project.repository.AnonceRepository;
import com.publicity_platform.project.repository.RoleRepository;
import com.publicity_platform.project.repository.UtilisateurRepository;
import com.publicity_platform.project.entity.HistoriqueValidation;
import com.publicity_platform.project.repository.HistoriqueValidationRepository;
import com.publicity_platform.project.service.AnonceService;
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

    private final AnonceService anonceService;
    private final AnonceRepository anonceRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final CategorieRepository categorieRepository;
    private final HistoriqueValidationRepository historiqueValidationRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategorieService categorieService;
    private final com.publicity_platform.project.service.ProduitService produitService;

    public AdminController(AnonceService anonceService,
            AnonceRepository anonceRepository,
            UtilisateurRepository utilisateurRepository,
            RoleRepository roleRepository,
            CategorieRepository categorieRepository,
            HistoriqueValidationRepository historiqueValidationRepository,
            PasswordEncoder passwordEncoder,
            CategorieService categorieService,
            com.publicity_platform.project.service.ProduitService produitService) {
        this.anonceService = anonceService;
        this.anonceRepository = anonceRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.roleRepository = roleRepository;
        this.categorieRepository = categorieRepository;
        this.historiqueValidationRepository = historiqueValidationRepository;
        this.passwordEncoder = passwordEncoder;
        this.categorieService = categorieService;
        this.produitService = produitService;
    }

    // ============================
    // DASHBOARD STATS
    // ============================

    @GetMapping("/dashboard/stats")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        System.out.println("DEBUG: Calculating Dashboard Stats...");
        Map<String, Object> stats = new HashMap<>();

        long total = anonceRepository.count();
        long pending = anonceRepository.countByStatutValidation(StatutValidation.EN_ATTENTE);
        long validated = anonceRepository.countByStatutValidation(StatutValidation.VALIDE);
        long active = anonceRepository.countByStatutValidation(StatutValidation.ACTIVEE);
        long refused = anonceRepository.countByStatutValidation(StatutValidation.REFUSE);

        List<Anonce> allAnonces = anonceRepository.findAll();
        long totalVues = allAnonces.stream()
                .mapToLong(a -> a.getCompteurVues() != null ? a.getCompteurVues() : 0L)
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

        stats.put("anoncesTotal", total);
        stats.put("totalAnonces", total); // Redondance pour compatibilité
        stats.put("anoncesEnAttente", pending);
        stats.put("totalEnAttente", pending);
        stats.put("anoncesValides", validated);
        stats.put("anoncesActifs", active);
        stats.put("anoncesRefuses", refused);
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
            List<Anonce> catAnonces = allAnonces.stream()
                    .filter(a -> a.getCategorie() != null && a.getCategorie().getId().equals(cat.getId()))
                    .toList();
            long count = catAnonces.size();
            long catVues = catAnonces.stream().mapToLong(a -> a.getCompteurVues() != null ? a.getCompteurVues() : 0L)
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

        // Top 5 anonces (Utilisation de DTO pour éviter les cycles de sérialisation)
        List<AnonceDto> topAnonces = anonceRepository.findTop5ByOrderByCompteurVuesDesc().stream()
                .map(AnonceDto::fromEntity)
                .toList();
        stats.put("topAnonces", topAnonces);

        // Top 5 annonceurs
        List<Map<String, Object>> advertisersSummary = allUsers.stream()
                .filter(u -> u.getAnonces() != null && !u.getAnonces().isEmpty())
                .sorted((u1, u2) -> Integer.compare(u2.getAnonces().size(), u1.getAnonces().size()))
                .limit(5)
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("nomComplet", u.getNomComplet());
                    map.put("annonceCount", u.getAnonces().size());
                    return map;
                }).toList();
        stats.put("topAdvertisers", advertisersSummary);

        return ResponseEntity.ok(stats);
    }

    // ============================
    // ANONCE MANAGEMENT
    // ============================

    @GetMapping("/anonces")
    public ResponseEntity<List<AnonceDto>> getAllAnonces(
            @RequestParam(required = false) String statut) {
        if (statut != null) {
            try {
                StatutValidation sv = StatutValidation.valueOf(statut.toUpperCase());
                return ResponseEntity.ok(anonceService.getAnoncesByStatus(sv));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }
        return ResponseEntity.ok(anonceService.getAllAnonces());
    }

    @GetMapping("/pending-anonces")
    public ResponseEntity<List<AnonceDto>> getPendingAnonces() {
        return ResponseEntity.ok(anonceService.getPendingAnonces());
    }

    @PostMapping("/anonces/{id}/validate")
    public ResponseEntity<AnonceDto> validate(@PathVariable @NonNull Long id,
            @RequestBody Map<String, Integer> body,
            @AuthenticationPrincipal Utilisateur admin) {
        int duration = body.getOrDefault("durationMonths", 12);
        return ResponseEntity.ok(anonceService.validateAnonceDto(id, duration, admin));
    }

    @PostMapping("/anonces/{id}/reject")
    public ResponseEntity<AnonceDto> reject(@PathVariable @NonNull Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Utilisateur admin) {
        String reason = body.getOrDefault("reason", "Non conforme aux conditions");
        return ResponseEntity.ok(anonceService.rejectAnonceDto(id, reason, admin));
    }

    @DeleteMapping("/anonces/{id}")
    public ResponseEntity<Void> deleteAnonce(@PathVariable @NonNull Long id) {
        anonceService.deleteAnonce(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/anonces/{id}/archive")
    public ResponseEntity<Void> archiveAnonce(@PathVariable @NonNull Long id,
            @AuthenticationPrincipal Utilisateur admin) {
        anonceService.archiveAnonce(id, admin);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/anonces/{id}")
    public ResponseEntity<AnonceDto> updateAnonce(@PathVariable @NonNull Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal Utilisateur admin) {
        Anonce a = anonceService.getAnonceById(id);
        if (body.containsKey("titreAnonce"))
            a.setTitreAnonce((String) body.get("titreAnonce"));
        if (body.containsKey("descriptionDetaillee"))
            a.setDescriptionDetaillee((String) body.get("descriptionDetaillee"));

        Anonce saved = anonceService.saveAnonce(a);

        // Log modification
        historiqueValidationRepository.save(HistoriqueValidation.builder()
                .actionEffectuee("MODIFICATION")
                .adminResponsable(admin)
                .anonceConcerne(saved)
                .ancienStatut(saved.getStatutValidation())
                .nouveauStatut(saved.getStatutValidation())
                .commentaireAdmin("Modification des informations de l'annonce")
                .build());

        return ResponseEntity.ok(AnonceDto.fromEntity(saved));
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

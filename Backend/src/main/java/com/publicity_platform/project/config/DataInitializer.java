package com.publicity_platform.project.config;

import com.publicity_platform.project.entity.Categorie;
import com.publicity_platform.project.entity.Role;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.repository.CategorieRepository;
import com.publicity_platform.project.repository.RoleRepository;
import com.publicity_platform.project.repository.UtilisateurRepository;
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

    public DataInitializer(RoleRepository roleRepository,
            CategorieRepository categorieRepository,
            UtilisateurRepository utilisateurRepository,
            PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.categorieRepository = categorieRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // Rôles de base
            createRoleIfNotFound("SUPERADMIN");
            createRoleIfNotFound("ADJOINTADMIN");
            createRoleIfNotFound("ANNONCEUR");
            createRoleIfNotFound("CLIENT");
            createRoleIfNotFound("VISITEUR");

            // Rôles SouqBladi
            createRoleIfNotFound("AUTO_ENTREPRENEUR");
            createRoleIfNotFound("MAGASIN");
            createRoleIfNotFound("COOPERATIVE");
            createRoleIfNotFound("SARL");
            createRoleIfNotFound("LIVREUR");
            createRoleIfNotFound("STOCKEUR");

            // Catégories SouqBladi
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

            // Créer le compte admin par défaut
            createSuperAdminIfNotFound();

            // Proactively promote 'Zineb' to admin for testing
            promoteZinebIfFound();
        };
    }

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
            utilisateurRepository.save(java.util.Objects.requireNonNull(admin));
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

    private void promoteZinebIfFound() {
        utilisateurRepository.findAll().stream()
                .filter(u -> u.getNomComplet().toLowerCase().contains("zineb") ||
                        u.getAdresseEmail().toLowerCase().contains("zineb"))
                .forEach(u -> {
                    Role superAdminRole = roleRepository.findByName("SUPERADMIN").orElse(null);
                    if (superAdminRole != null && !u.getRoles().contains(superAdminRole)) {
                        u.getRoles().add(superAdminRole);
                        utilisateurRepository.save(u);
                        System.out.println(
                                "DEBUG: Proactively promoted '" + u.getNomComplet() + "' to SUPERADMIN for testing.");
                    }
                });
    }
}

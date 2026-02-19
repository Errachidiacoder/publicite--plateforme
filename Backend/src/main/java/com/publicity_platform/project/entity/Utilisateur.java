package com.publicity_platform.project.entity;


import com.publicity_platform.project.enumm.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "utilisateurs",
        uniqueConstraints = @UniqueConstraint(columnNames = "adresse_email"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Utilisateur implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "nom_complet", nullable = false)
    private String nomComplet;

    @Email
    @NotBlank
    @Column(name = "adresse_email", nullable = false, unique = true)
    private String adresseEmail;

    @NotBlank
    @Column(name = "mot_de_passe_hache", nullable = false)
    private String motDePasseHache;

    @Column(name = "numero_de_telephone")
    private String numeroDeTelephone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "compte_actif", nullable = false)
    @Builder.Default
    private Boolean compteActif = true;

    @Column(name = "email_verifie", nullable = false)
    @Builder.Default
    private Boolean emailVerifie = false;

    @Column(name = "date_inscription", nullable = false, updatable = false)
    private LocalDateTime dateInscription;

    // ─────────────────────────────────────────────
    // Relations  1 → 0..*
    // ─────────────────────────────────────────────

    /** 1 Utilisateur publie 0..* Produits */
    @OneToMany(mappedBy = "annonceur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Produit> produits;

    /** 1 Utilisateur reçoit 0..* Notifications */
    @OneToMany(mappedBy = "destinataire", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Notification> notifications;

    /** 1 Utilisateur génère 0..* TokenReinitialisation (composition) */
    @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.ALL,
            orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TokenReinitialisation> tokens;

    /** 1 Utilisateur passe 0..* Commandes */
    @OneToMany(mappedBy = "acheteur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Commande> commandes;

    /** 1 Utilisateur (admin) effectue 0..* HistoriqueValidation */
    @OneToMany(mappedBy = "adminResponsable", fetch = FetchType.LAZY)
    private List<HistoriqueValidation> historiquesEffectues;

    /** 1 Utilisateur génère 0..* HistoriqueNavigation (module IA) */
    @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HistoriqueNavigation> historiquesNavigation;

    // ─────────────────────────────────────────────
    // Lifecycle
    // ─────────────────────────────────────────────

    @PrePersist
    protected void onCreate() {
        this.dateInscription = LocalDateTime.now();
    }

    // ─────────────────────────────────────────────
    // UserDetails (Spring Security)
    // ─────────────────────────────────────────────

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override public String getPassword()                  { return motDePasseHache; }
    @Override public String getUsername()                  { return adresseEmail;    }
    @Override public boolean isAccountNonExpired()         { return true;            }
    @Override public boolean isAccountNonLocked()          { return compteActif;     }
    @Override public boolean isCredentialsNonExpired()     { return true;            }
    @Override public boolean isEnabled()                   { return compteActif;     }
}


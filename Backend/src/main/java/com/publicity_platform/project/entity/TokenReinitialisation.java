package com.publicity_platform.project.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tokens_reinitialisation")
public class TokenReinitialisation {

    public TokenReinitialisation() {
    }

    public TokenReinitialisation(Long id, String valeurToken, LocalDateTime dateExpiration, Boolean dejaUtilise,
            Utilisateur utilisateur) {
        this.id = id;
        this.valeurToken = valeurToken;
        this.dateExpiration = dateExpiration;
        this.dejaUtilise = dejaUtilise;
        this.utilisateur = utilisateur;
    }

    public static TokenReinitialisationBuilder builder() {
        return new TokenReinitialisationBuilder();
    }

    public static class TokenReinitialisationBuilder {
        private Long id;
        private String valeurToken;
        private LocalDateTime dateExpiration;
        private Boolean dejaUtilise = false;
        private Utilisateur utilisateur;

        public TokenReinitialisationBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public TokenReinitialisationBuilder valeurToken(String valeurToken) {
            this.valeurToken = valeurToken;
            return this;
        }

        public TokenReinitialisationBuilder dateExpiration(LocalDateTime dateExpiration) {
            this.dateExpiration = dateExpiration;
            return this;
        }

        public TokenReinitialisationBuilder dejaUtilise(Boolean dejaUtilise) {
            this.dejaUtilise = dejaUtilise;
            return this;
        }

        public TokenReinitialisationBuilder utilisateur(Utilisateur utilisateur) {
            this.utilisateur = utilisateur;
            return this;
        }

        public TokenReinitialisation build() {
            return new TokenReinitialisation(id, valeurToken, dateExpiration, dejaUtilise, utilisateur);
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** UUID unique envoyé par email */
    @Column(name = "valeur_token", nullable = false, unique = true)
    private String valeurToken;

    /** Expiration : 1 heure après création */
    @Column(name = "date_expiration", nullable = false)
    private LocalDateTime dateExpiration;

    @Column(name = "deja_utilise", nullable = false)
    private Boolean dejaUtilise = false;

    // ─────────────────────────────────────────────
    // Relation 0..* TokenReinitialisation → 1 Utilisateur
    // ─────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    // ─────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────

    // Explicit Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getValeurToken() {
        return valeurToken;
    }

    public void setValeurToken(String valeurToken) {
        this.valeurToken = valeurToken;
    }

    public LocalDateTime getDateExpiration() {
        return dateExpiration;
    }

    public void setDateExpiration(LocalDateTime dateExpiration) {
        this.dateExpiration = dateExpiration;
    }

    public Boolean getDejaUtilise() {
        return dejaUtilise;
    }

    public void setDejaUtilise(Boolean dejaUtilise) {
        this.dejaUtilise = dejaUtilise;
    }

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    public boolean isExpire() {
        return LocalDateTime.now().isAfter(this.dateExpiration);
    }
}

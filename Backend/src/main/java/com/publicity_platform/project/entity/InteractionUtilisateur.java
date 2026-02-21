package com.publicity_platform.project.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interactions_utilisateurs")
public class InteractionUtilisateur {

    public InteractionUtilisateur() {
    }

    public InteractionUtilisateur(Long id, Double scoreAffinite, String algorithmeUtilise,
            Boolean recommandationAffichee, LocalDateTime dateGeneration, Produit produitRecommande,
            Utilisateur utilisateurCible) {
        this.id = id;
        this.scoreAffinite = scoreAffinite;
        this.algorithmeUtilise = algorithmeUtilise;
        this.recommandationAffichee = recommandationAffichee;
        this.dateGeneration = dateGeneration;
        this.produitRecommande = produitRecommande;
        this.utilisateurCible = utilisateurCible;
    }

    public static InteractionUtilisateurBuilder builder() {
        return new InteractionUtilisateurBuilder();
    }

    public static class InteractionUtilisateurBuilder {
        private Long id;
        private Double scoreAffinite;
        private String algorithmeUtilise;
        private Boolean recommandationAffichee = false;
        private LocalDateTime dateGeneration;
        private Produit produitRecommande;
        private Utilisateur utilisateurCible;

        public InteractionUtilisateurBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public InteractionUtilisateurBuilder scoreAffinite(Double scoreAffinite) {
            this.scoreAffinite = scoreAffinite;
            return this;
        }

        public InteractionUtilisateurBuilder algorithmeUtilise(String algorithmeUtilise) {
            this.algorithmeUtilise = algorithmeUtilise;
            return this;
        }

        public InteractionUtilisateurBuilder recommandationAffichee(Boolean recommandationAffichee) {
            this.recommandationAffichee = recommandationAffichee;
            return this;
        }

        public InteractionUtilisateurBuilder dateGeneration(LocalDateTime dateGeneration) {
            this.dateGeneration = dateGeneration;
            return this;
        }

        public InteractionUtilisateurBuilder produitRecommande(Produit produitRecommande) {
            this.produitRecommande = produitRecommande;
            return this;
        }

        public InteractionUtilisateurBuilder utilisateurCible(Utilisateur utilisateurCible) {
            this.utilisateurCible = utilisateurCible;
            return this;
        }

        public InteractionUtilisateur build() {
            return new InteractionUtilisateur(id, scoreAffinite, algorithmeUtilise, recommandationAffichee,
                    dateGeneration, produitRecommande, utilisateurCible);
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Score calculé par l'algorithme (entre 0 et 1) */
    @Column(name = "score_affinite")
    private Double scoreAffinite;

    /** CONTENT_BASED | BEHAVIOR_BASED | COLLABORATIVE */
    @Column(name = "algorithme_utilise")
    private String algorithmeUtilise;

    /** true si la recommandation a été affichée à l'utilisateur */
    @Column(name = "recommandation_affichee", nullable = false)
    private Boolean recommandationAffichee = false;

    @Column(name = "date_generation")
    private LocalDateTime dateGeneration;

    // ─────────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────────

    /** 0..* InteractionUtilisateur → 1 Produit recommandé */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_recommande_id", nullable = false)
    private Produit produitRecommande;

    /** 0..* InteractionUtilisateur → 1 Utilisateur ciblé */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_cible_id", nullable = false)
    private Utilisateur utilisateurCible;

    // Explicit Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getScoreAffinite() {
        return scoreAffinite;
    }

    public void setScoreAffinite(Double scoreAffinite) {
        this.scoreAffinite = scoreAffinite;
    }

    public String getAlgorithmeUtilise() {
        return algorithmeUtilise;
    }

    public void setAlgorithmeUtilise(String algorithmeUtilise) {
        this.algorithmeUtilise = algorithmeUtilise;
    }

    public Boolean getRecommandationAffichee() {
        return recommandationAffichee;
    }

    public void setRecommandationAffichee(Boolean recommandationAffichee) {
        this.recommandationAffichee = recommandationAffichee;
    }

    public LocalDateTime getDateGeneration() {
        return dateGeneration;
    }

    public void setDateGeneration(LocalDateTime dateGeneration) {
        this.dateGeneration = dateGeneration;
    }

    public Produit getProduitRecommande() {
        return produitRecommande;
    }

    public void setProduitRecommande(Produit produitRecommande) {
        this.produitRecommande = produitRecommande;
    }

    public Utilisateur getUtilisateurCible() {
        return utilisateurCible;
    }

    public void setUtilisateurCible(Utilisateur utilisateurCible) {
        this.utilisateurCible = utilisateurCible;
    }

    @PrePersist
    protected void onCreate() {
        this.dateGeneration = LocalDateTime.now();
    }
}

package com.publicity_platform.project.entity;

import com.publicity_platform.project.enumm.StatutValidation;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "historique_validations")
public class HistoriqueValidation {

    public HistoriqueValidation() {
    }

    public HistoriqueValidation(Long id, String actionEffectuee, String commentaireAdmin,
            StatutValidation ancienStatut, StatutValidation nouveauStatut, LocalDateTime dateAction,
            Utilisateur adminResponsable, Produit produitConcerne) {
        this.id = id;
        this.actionEffectuee = actionEffectuee;
        this.commentaireAdmin = commentaireAdmin;
        this.ancienStatut = ancienStatut;
        this.nouveauStatut = nouveauStatut;
        this.dateAction = dateAction;
        this.adminResponsable = adminResponsable;
        this.produitConcerne = produitConcerne;
    }

    public static HistoriqueValidationBuilder builder() {
        return new HistoriqueValidationBuilder();
    }

    public static class HistoriqueValidationBuilder {
        private Long id;
        private String actionEffectuee;
        private String commentaireAdmin;
        private StatutValidation ancienStatut;
        private StatutValidation nouveauStatut;
        private LocalDateTime dateAction;
        private Utilisateur adminResponsable;
        private Produit produitConcerne;

        public HistoriqueValidationBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public HistoriqueValidationBuilder actionEffectuee(String actionEffectuee) {
            this.actionEffectuee = actionEffectuee;
            return this;
        }

        public HistoriqueValidationBuilder commentaireAdmin(String commentaireAdmin) {
            this.commentaireAdmin = commentaireAdmin;
            return this;
        }

        public HistoriqueValidationBuilder ancienStatut(StatutValidation ancienStatut) {
            this.ancienStatut = ancienStatut;
            return this;
        }

        public HistoriqueValidationBuilder nouveauStatut(StatutValidation nouveauStatut) {
            this.nouveauStatut = nouveauStatut;
            return this;
        }

        public HistoriqueValidationBuilder dateAction(LocalDateTime dateAction) {
            this.dateAction = dateAction;
            return this;
        }

        public HistoriqueValidationBuilder adminResponsable(Utilisateur adminResponsable) {
            this.adminResponsable = adminResponsable;
            return this;
        }

        public HistoriqueValidationBuilder produitConcerne(Produit produitConcerne) {
            this.produitConcerne = produitConcerne;
            return this;
        }

        public HistoriqueValidation build() {
            return new HistoriqueValidation(id, actionEffectuee, commentaireAdmin, ancienStatut, nouveauStatut,
                    dateAction, adminResponsable, produitConcerne);
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Ex : "VALIDATION" | "REFUS" | "ARCHIVAGE" */
    @Column(name = "action_effectuee", nullable = false)
    private String actionEffectuee;

    /** Motif saisi par l'admin lors d'un refus */
    @Column(name = "commentaire_admin", columnDefinition = "TEXT")
    private String commentaireAdmin;

    @Enumerated(EnumType.STRING)
    @Column(name = "ancien_statut")
    private StatutValidation ancienStatut;

    @Enumerated(EnumType.STRING)
    @Column(name = "nouveau_statut")
    private StatutValidation nouveauStatut;

    @Column(name = "date_action", nullable = false)
    private LocalDateTime dateAction;

    // ─────────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────────

    /** 0..* HistoriqueValidation → 1 Utilisateur (admin) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_responsable_id")
    private Utilisateur adminResponsable;

    /** 0..* HistoriqueValidation → 1 Produit (composition) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_concerne_id", nullable = false)
    private Produit produitConcerne;

    // Explicit Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getActionEffectuee() {
        return actionEffectuee;
    }

    public void setActionEffectuee(String actionEffectuee) {
        this.actionEffectuee = actionEffectuee;
    }

    public String getCommentaireAdmin() {
        return commentaireAdmin;
    }

    public void setCommentaireAdmin(String commentaireAdmin) {
        this.commentaireAdmin = commentaireAdmin;
    }

    public StatutValidation getAncienStatut() {
        return ancienStatut;
    }

    public void setAncienStatut(StatutValidation ancienStatut) {
        this.ancienStatut = ancienStatut;
    }

    public StatutValidation getNouveauStatut() {
        return nouveauStatut;
    }

    public void setNouveauStatut(StatutValidation nouveauStatut) {
        this.nouveauStatut = nouveauStatut;
    }

    public LocalDateTime getDateAction() {
        return dateAction;
    }

    public void setDateAction(LocalDateTime dateAction) {
        this.dateAction = dateAction;
    }

    public Utilisateur getAdminResponsable() {
        return adminResponsable;
    }

    public void setAdminResponsable(Utilisateur adminResponsable) {
        this.adminResponsable = adminResponsable;
    }

    public Produit getProduitConcerne() {
        return produitConcerne;
    }

    public void setProduitConcerne(Produit produitConcerne) {
        this.produitConcerne = produitConcerne;
    }

    @PrePersist
    protected void onCreate() {
        this.dateAction = LocalDateTime.now();
    }
}

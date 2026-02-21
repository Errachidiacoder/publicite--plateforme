package com.publicity_platform.project.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "historique_navigations")
public class HistoriqueNavigation {

    public HistoriqueNavigation() {
    }

    public HistoriqueNavigation(Long id, String utilisateurOuSession, Integer dureeConsultationSec,
            String sourceRecherche, LocalDateTime dateConsultation, Utilisateur utilisateur, Produit produitConsulte,
            Categorie categorieVisitee) {
        this.id = id;
        this.utilisateurOuSession = utilisateurOuSession;
        this.dureeConsultationSec = dureeConsultationSec;
        this.sourceRecherche = sourceRecherche;
        this.dateConsultation = dateConsultation;
        this.utilisateur = utilisateur;
        this.produitConsulte = produitConsulte;
        this.categorieVisitee = categorieVisitee;
    }

    public static HistoriqueNavigationBuilder builder() {
        return new HistoriqueNavigationBuilder();
    }

    public static class HistoriqueNavigationBuilder {
        private Long id;
        private String utilisateurOuSession;
        private Integer dureeConsultationSec;
        private String sourceRecherche;
        private LocalDateTime dateConsultation;
        private Utilisateur utilisateur;
        private Produit produitConsulte;
        private Categorie categorieVisitee;

        public HistoriqueNavigationBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public HistoriqueNavigationBuilder utilisateurOuSession(String utilisateurOuSession) {
            this.utilisateurOuSession = utilisateurOuSession;
            return this;
        }

        public HistoriqueNavigationBuilder dureeConsultationSec(Integer dureeConsultationSec) {
            this.dureeConsultationSec = dureeConsultationSec;
            return this;
        }

        public HistoriqueNavigationBuilder sourceRecherche(String sourceRecherche) {
            this.sourceRecherche = sourceRecherche;
            return this;
        }

        public HistoriqueNavigationBuilder dateConsultation(LocalDateTime dateConsultation) {
            this.dateConsultation = dateConsultation;
            return this;
        }

        public HistoriqueNavigationBuilder utilisateur(Utilisateur utilisateur) {
            this.utilisateur = utilisateur;
            return this;
        }

        public HistoriqueNavigationBuilder produitConsulte(Produit produitConsulte) {
            this.produitConsulte = produitConsulte;
            return this;
        }

        public HistoriqueNavigationBuilder categorieVisitee(Categorie categorieVisitee) {
            this.categorieVisitee = categorieVisitee;
            return this;
        }

        public HistoriqueNavigation build() {
            return new HistoriqueNavigation(id, utilisateurOuSession, dureeConsultationSec, sourceRecherche,
                    dateConsultation, utilisateur, produitConsulte, categorieVisitee);
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ID utilisateur connecté ou session anonyme */
    @Column(name = "utilisateur_ou_session")
    private String utilisateurOuSession;

    /** Durée passée sur la page du produit (en secondes) */
    @Column(name = "duree_consultation_sec")
    private Integer dureeConsultationSec;

    /**
     * Mot-clé tapé dans la recherche, source (direct, recherche, recommandation)
     */
    @Column(name = "source_recherche")
    private String sourceRecherche;

    @Column(name = "date_consultation")
    private LocalDateTime dateConsultation;

    // ─────────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────────

    /** 0..* HistoriqueNavigation → 1 Utilisateur (peut être null si anonyme) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur utilisateur;

    /** 0..* HistoriqueNavigation → 1 Produit consulté */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_consulte_id")
    private Produit produitConsulte;

    /** 0..* HistoriqueNavigation → 1 Categorie visitée */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_visitee_id")
    private Categorie categorieVisitee;

    // Explicit Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUtilisateurOuSession() {
        return utilisateurOuSession;
    }

    public void setUtilisateurOuSession(String utilisateurOuSession) {
        this.utilisateurOuSession = utilisateurOuSession;
    }

    public Integer getDureeConsultationSec() {
        return dureeConsultationSec;
    }

    public void setDureeConsultationSec(Integer dureeConsultationSec) {
        this.dureeConsultationSec = dureeConsultationSec;
    }

    public String getSourceRecherche() {
        return sourceRecherche;
    }

    public void setSourceRecherche(String sourceRecherche) {
        this.sourceRecherche = sourceRecherche;
    }

    public LocalDateTime getDateConsultation() {
        return dateConsultation;
    }

    public void setDateConsultation(LocalDateTime dateConsultation) {
        this.dateConsultation = dateConsultation;
    }

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    public Produit getProduitConsulte() {
        return produitConsulte;
    }

    public void setProduitConsulte(Produit produitConsulte) {
        this.produitConsulte = produitConsulte;
    }

    public Categorie getCategorieVisitee() {
        return categorieVisitee;
    }

    public void setCategorieVisitee(Categorie categorieVisitee) {
        this.categorieVisitee = categorieVisitee;
    }

    @PrePersist
    protected void onCreate() {
        this.dateConsultation = LocalDateTime.now();
    }
}

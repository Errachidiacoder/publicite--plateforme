package com.publicity_platform.project.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "historique_navigations")
public class HistoriqueNavigation {

    public HistoriqueNavigation() {
    }

    public HistoriqueNavigation(Long id, String utilisateurOuSession, Integer dureeConsultationSec,
            String sourceRecherche, LocalDateTime dateConsultation, Utilisateur utilisateur, Anonce anonceConsulte,
            Categorie categorieVisitee) {
        this.id = id;
        this.utilisateurOuSession = utilisateurOuSession;
        this.dureeConsultationSec = dureeConsultationSec;
        this.sourceRecherche = sourceRecherche;
        this.dateConsultation = dateConsultation;
        this.utilisateur = utilisateur;
        this.anonceConsulte = anonceConsulte;
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
        private Anonce anonceConsulte;
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

        public HistoriqueNavigationBuilder anonceConsulte(Anonce anonceConsulte) {
            this.anonceConsulte = anonceConsulte;
            return this;
        }

        public HistoriqueNavigationBuilder categorieVisitee(Categorie categorieVisitee) {
            this.categorieVisitee = categorieVisitee;
            return this;
        }

        public HistoriqueNavigation build() {
            return new HistoriqueNavigation(id, utilisateurOuSession, dureeConsultationSec, sourceRecherche,
                    dateConsultation, utilisateur, anonceConsulte, categorieVisitee);
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

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur utilisateur;

    /** 0..* HistoriqueNavigation → 1 Anonce consulté */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "anonce_consulte_id")
    private Anonce anonceConsulte;

    /** 0..* HistoriqueNavigation → 1 Categorie visitée */
    @JsonIgnore
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

    public Anonce getAnonceConsulte() {
        return anonceConsulte;
    }

    public void setAnonceConsulte(Anonce anonceConsulte) {
        this.anonceConsulte = anonceConsulte;
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

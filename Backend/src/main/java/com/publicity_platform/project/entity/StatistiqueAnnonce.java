package com.publicity_platform.project.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "statistiques_annonces")
public class StatistiqueAnnonce {

    public StatistiqueAnnonce() {
    }

    public StatistiqueAnnonce(Long id, Long totalVuesGlobales, Integer totalContactsRecus, Double tauxConversionEstime,
            String periodeAnalyse, LocalDateTime dateGeneration, Produit produitSuivi) {
        this.id = id;
        this.totalVuesGlobales = totalVuesGlobales;
        this.totalContactsRecus = totalContactsRecus;
        this.tauxConversionEstime = tauxConversionEstime;
        this.periodeAnalyse = periodeAnalyse;
        this.dateGeneration = dateGeneration;
        this.produitSuivi = produitSuivi;
    }

    public static StatistiqueAnnonceBuilder builder() {
        return new StatistiqueAnnonceBuilder();
    }

    public static class StatistiqueAnnonceBuilder {
        private Long id;
        private Long totalVuesGlobales = 0L;
        private Integer totalContactsRecus = 0;
        private Double tauxConversionEstime;
        private String periodeAnalyse;
        private LocalDateTime dateGeneration;
        private Produit produitSuivi;

        public StatistiqueAnnonceBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public StatistiqueAnnonceBuilder totalVuesGlobales(Long totalVuesGlobales) {
            this.totalVuesGlobales = totalVuesGlobales;
            return this;
        }

        public StatistiqueAnnonceBuilder totalContactsRecus(Integer totalContactsRecus) {
            this.totalContactsRecus = totalContactsRecus;
            return this;
        }

        public StatistiqueAnnonceBuilder tauxConversionEstime(Double tauxConversionEstime) {
            this.tauxConversionEstime = tauxConversionEstime;
            return this;
        }

        public StatistiqueAnnonceBuilder periodeAnalyse(String periodeAnalyse) {
            this.periodeAnalyse = periodeAnalyse;
            return this;
        }

        public StatistiqueAnnonceBuilder dateGeneration(LocalDateTime dateGeneration) {
            this.dateGeneration = dateGeneration;
            return this;
        }

        public StatistiqueAnnonceBuilder produitSuivi(Produit produitSuivi) {
            this.produitSuivi = produitSuivi;
            return this;
        }

        public StatistiqueAnnonce build() {
            return new StatistiqueAnnonce(id, totalVuesGlobales, totalContactsRecus, tauxConversionEstime,
                    periodeAnalyse, dateGeneration, produitSuivi);
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "total_vues_globales")
    private Long totalVuesGlobales = 0L;

    @Column(name = "total_contacts_recus")
    private Integer totalContactsRecus = 0;

    @Column(name = "taux_conversion_estime")
    private Double tauxConversionEstime;

    /** Ex : "QUOTIDIEN" | "MENSUEL" */
    @Column(name = "periode_analyse")
    private String periodeAnalyse;

    @Column(name = "date_generation")
    private LocalDateTime dateGeneration;

    // ─────────────────────────────────────────────
    // Relation 0..* StatistiqueAnnonce → 1 Produit (composition)
    // ─────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_suivi_id", nullable = false)
    private Produit produitSuivi;

    // Explicit Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTotalVuesGlobales() {
        return totalVuesGlobales;
    }

    public void setTotalVuesGlobales(Long totalVuesGlobales) {
        this.totalVuesGlobales = totalVuesGlobales;
    }

    public Integer getTotalContactsRecus() {
        return totalContactsRecus;
    }

    public void setTotalContactsRecus(Integer totalContactsRecus) {
        this.totalContactsRecus = totalContactsRecus;
    }

    public Double getTauxConversionEstime() {
        return tauxConversionEstime;
    }

    public void setTauxConversionEstime(Double tauxConversionEstime) {
        this.tauxConversionEstime = tauxConversionEstime;
    }

    public String getPeriodeAnalyse() {
        return periodeAnalyse;
    }

    public void setPeriodeAnalyse(String periodeAnalyse) {
        this.periodeAnalyse = periodeAnalyse;
    }

    public LocalDateTime getDateGeneration() {
        return dateGeneration;
    }

    public void setDateGeneration(LocalDateTime dateGeneration) {
        this.dateGeneration = dateGeneration;
    }

    public Produit getProduitSuivi() {
        return produitSuivi;
    }

    public void setProduitSuivi(Produit produitSuivi) {
        this.produitSuivi = produitSuivi;
    }

    @PrePersist
    protected void onCreate() {
        this.dateGeneration = LocalDateTime.now();
    }
}

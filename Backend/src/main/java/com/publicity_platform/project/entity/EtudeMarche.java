package com.publicity_platform.project.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Résultat d'une étude de marché automatisée pour les vendeurs.
 * Analyse les produits les plus vendus, les catégories tendance
 * et les mots-clés recherchés par les clients marocains.
 */
@Entity
@Table(name = "etudes_marche")
public class EtudeMarche {

    public EtudeMarche() {
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "categorie_cible")
    private String categorieCible;

    /** Score de potentiel "winning product" (0-100) */
    @Column(name = "score_winning")
    private Double scoreWinning;

    /** Mots-clés populaires séparés par des virgules */
    @Column(name = "mots_cles_tendance", columnDefinition = "TEXT")
    private String motsClesTendance;

    /** Nombre de recherches dans cette catégorie */
    @Column(name = "volume_recherche")
    private Long volumeRecherche;

    /** Nombre de produits vendus dans cette catégorie */
    @Column(name = "nombre_ventes_categorie")
    private Long nombreVentesCategorie;

    /** Panier moyen dans cette catégorie en DH */
    @Column(name = "panier_moyen")
    private Double panierMoyen;

    /** Ville avec le plus de demande */
    @Column(name = "ville_top_demande")
    private String villeTopDemande;

    @Column(name = "date_analyse", nullable = false, updatable = false)
    private LocalDateTime dateAnalyse;

    @PrePersist
    protected void onCreate() {
        this.dateAnalyse = LocalDateTime.now();
    }

    // ─────────────────────────────────────────────
    // Getters & Setters
    // ─────────────────────────────────────────────

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCategorieCible() {
        return categorieCible;
    }

    public void setCategorieCible(String categorieCible) {
        this.categorieCible = categorieCible;
    }

    public Double getScoreWinning() {
        return scoreWinning;
    }

    public void setScoreWinning(Double scoreWinning) {
        this.scoreWinning = scoreWinning;
    }

    public String getMotsClesTendance() {
        return motsClesTendance;
    }

    public void setMotsClesTendance(String motsClesTendance) {
        this.motsClesTendance = motsClesTendance;
    }

    public Long getVolumeRecherche() {
        return volumeRecherche;
    }

    public void setVolumeRecherche(Long volumeRecherche) {
        this.volumeRecherche = volumeRecherche;
    }

    public Long getNombreVentesCategorie() {
        return nombreVentesCategorie;
    }

    public void setNombreVentesCategorie(Long nombreVentesCategorie) {
        this.nombreVentesCategorie = nombreVentesCategorie;
    }

    public Double getPanierMoyen() {
        return panierMoyen;
    }

    public void setPanierMoyen(Double panierMoyen) {
        this.panierMoyen = panierMoyen;
    }

    public String getVilleTopDemande() {
        return villeTopDemande;
    }

    public void setVilleTopDemande(String villeTopDemande) {
        this.villeTopDemande = villeTopDemande;
    }

    public LocalDateTime getDateAnalyse() {
        return dateAnalyse;
    }

    public void setDateAnalyse(LocalDateTime dateAnalyse) {
        this.dateAnalyse = dateAnalyse;
    }
}

package com.publicity_platform.project.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.publicity_platform.project.enumm.StatutBoutique;
import com.publicity_platform.project.enumm.TypeActivite;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Représente le profil commercial d'un vendeur sur SouqBladi.
 * Chaque vendeur (auto-entrepreneur, magasin, coopérative, SARL, etc.)
 * possède une boutique avec ses informations fiscales et commerciales.
 */
@Entity
@Table(name = "boutiques")
public class Boutique {

    public Boutique() {
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "nom_boutique", nullable = false)
    private String nomBoutique;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_activite", nullable = false)
    private TypeActivite typeActivite;

    @Column(name = "description_boutique", columnDefinition = "TEXT")
    private String descriptionBoutique;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "banniere_url")
    private String banniereUrl;

    /** Identifiant Commun de l'Entreprise (obligatoire pour SARL) */
    @Column(name = "ice")
    private String ice;

    /** Registre de Commerce */
    @Column(name = "registre_commerce")
    private String registreCommerce;

    @Column(name = "ville")
    private String ville;

    @Column(name = "adresse_complete")
    private String adresseComplete;

    @Column(name = "telephone_boutique")
    private String telephoneBoutique;

    @Column(name = "note_moyenne")
    private Double noteMoyenne = 0.0;

    @Column(name = "nombre_ventes")
    private Long nombreVentes = 0L;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_boutique", nullable = false)
    private StatutBoutique statutBoutique = StatutBoutique.EN_ATTENTE;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    // ─────────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────────

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietaire_id", nullable = false, unique = true)
    private Utilisateur proprietaire;

    /** Une boutique contient plusieurs produits */
    @JsonIgnore
    @OneToMany(mappedBy = "boutique", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Produit> produits = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
        if (this.statutBoutique == null) {
            this.statutBoutique = StatutBoutique.EN_ATTENTE;
        }
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

    public String getNomBoutique() {
        return nomBoutique;
    }

    public void setNomBoutique(String nomBoutique) {
        this.nomBoutique = nomBoutique;
    }

    public TypeActivite getTypeActivite() {
        return typeActivite;
    }

    public void setTypeActivite(TypeActivite typeActivite) {
        this.typeActivite = typeActivite;
    }

    public String getDescriptionBoutique() {
        return descriptionBoutique;
    }

    public void setDescriptionBoutique(String descriptionBoutique) {
        this.descriptionBoutique = descriptionBoutique;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getBanniereUrl() {
        return banniereUrl;
    }

    public void setBanniereUrl(String banniereUrl) {
        this.banniereUrl = banniereUrl;
    }

    public String getIce() {
        return ice;
    }

    public void setIce(String ice) {
        this.ice = ice;
    }

    public String getRegistreCommerce() {
        return registreCommerce;
    }

    public void setRegistreCommerce(String registreCommerce) {
        this.registreCommerce = registreCommerce;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public String getAdresseComplete() {
        return adresseComplete;
    }

    public void setAdresseComplete(String adresseComplete) {
        this.adresseComplete = adresseComplete;
    }

    public String getTelephoneBoutique() {
        return telephoneBoutique;
    }

    public void setTelephoneBoutique(String telephoneBoutique) {
        this.telephoneBoutique = telephoneBoutique;
    }

    public Double getNoteMoyenne() {
        return noteMoyenne;
    }

    public void setNoteMoyenne(Double noteMoyenne) {
        this.noteMoyenne = noteMoyenne;
    }

    public Long getNombreVentes() {
        return nombreVentes;
    }

    public void setNombreVentes(Long nombreVentes) {
        this.nombreVentes = nombreVentes;
    }

    public StatutBoutique getStatutBoutique() {
        return statutBoutique;
    }

    public void setStatutBoutique(StatutBoutique statutBoutique) {
        this.statutBoutique = statutBoutique;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Utilisateur getProprietaire() {
        return proprietaire;
    }

    public void setProprietaire(Utilisateur proprietaire) {
        this.proprietaire = proprietaire;
    }

    public List<Produit> getProduits() {
        return produits;
    }

    public void setProduits(List<Produit> produits) {
        this.produits = produits;
    }
}

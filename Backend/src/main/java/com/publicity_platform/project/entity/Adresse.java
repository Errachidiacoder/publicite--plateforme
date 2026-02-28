package com.publicity_platform.project.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

/**
 * Adresse de livraison ou de facturation d'un utilisateur.
 * Un utilisateur peut avoir plusieurs adresses, dont une par défaut.
 */
@Entity
@Table(name = "adresses")
public class Adresse {

    public Adresse() {
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "rue", nullable = false)
    private String rue;

    @NotBlank
    @Column(name = "ville", nullable = false)
    private String ville;

    @Column(name = "code_postal")
    private String codePostal;

    @Column(name = "region")
    private String region;

    @Column(name = "pays", nullable = false)
    private String pays = "Maroc";

    @Column(name = "telephone")
    private String telephone;

    @Column(name = "nom_destinataire")
    private String nomDestinataire;

    @Column(name = "par_defaut", nullable = false)
    private Boolean parDefaut = false;

    // ─────────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────────

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    // ─────────────────────────────────────────────
    // Getters & Setters
    // ─────────────────────────────────────────────

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRue() {
        return rue;
    }

    public void setRue(String rue) {
        this.rue = rue;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public String getCodePostal() {
        return codePostal;
    }

    public void setCodePostal(String codePostal) {
        this.codePostal = codePostal;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getPays() {
        return pays;
    }

    public void setPays(String pays) {
        this.pays = pays;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getNomDestinataire() {
        return nomDestinataire;
    }

    public void setNomDestinataire(String nomDestinataire) {
        this.nomDestinataire = nomDestinataire;
    }

    public Boolean getParDefaut() {
        return parDefaut;
    }

    public void setParDefaut(Boolean parDefaut) {
        this.parDefaut = parDefaut;
    }

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }
}

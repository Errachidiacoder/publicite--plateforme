package com.publicity_platform.project.dto;

public class LigneCommandeDto {
    private Long id;
    private Long produitId;
    private String produitNom;
    private String produitImage;
    private Integer quantite;
    private Double prixUnitaire;
    private Double sousTotal;

    public LigneCommandeDto() {
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProduitId() {
        return produitId;
    }

    public void setProduitId(Long produitId) {
        this.produitId = produitId;
    }

    public String getProduitNom() {
        return produitNom;
    }

    public void setProduitNom(String produitNom) {
        this.produitNom = produitNom;
    }

    public String getProduitImage() {
        return produitImage;
    }

    public void setProduitImage(String produitImage) {
        this.produitImage = produitImage;
    }

    public Integer getQuantite() {
        return quantite;
    }

    public void setQuantite(Integer quantite) {
        this.quantite = quantite;
    }

    public Double getPrixUnitaire() {
        return prixUnitaire;
    }

    public void setPrixUnitaire(Double prixUnitaire) {
        this.prixUnitaire = prixUnitaire;
    }

    public Double getSousTotal() {
        return sousTotal;
    }

    public void setSousTotal(Double sousTotal) {
        this.sousTotal = sousTotal;
    }

    private boolean avisDepose;

    public boolean isAvisDepose() {
        return avisDepose;
    }

    public void setAvisDepose(boolean avisDepose) {
        this.avisDepose = avisDepose;
    }
}

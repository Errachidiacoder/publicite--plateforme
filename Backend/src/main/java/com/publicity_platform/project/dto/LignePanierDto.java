package com.publicity_platform.project.dto;

import java.math.BigDecimal;

public class LignePanierDto {
    private Long id;
    private Long produitId;
    private String produitNom;
    private String produitImage;
    private BigDecimal prix;
    private BigDecimal prixPromo;
    private Integer quantite;
    private Double sousTotal;
    private Integer stockDisponible;

    public LignePanierDto() {
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

    public BigDecimal getPrix() {
        return prix;
    }

    public void setPrix(BigDecimal prix) {
        this.prix = prix;
    }

    public BigDecimal getPrixPromo() {
        return prixPromo;
    }

    public void setPrixPromo(BigDecimal prixPromo) {
        this.prixPromo = prixPromo;
    }

    public Integer getQuantite() {
        return quantite;
    }

    public void setQuantite(Integer quantite) {
        this.quantite = quantite;
    }

    public Double getSousTotal() {
        return sousTotal;
    }

    public void setSousTotal(Double sousTotal) {
        this.sousTotal = sousTotal;
    }

    public Integer getStockDisponible() {
        return stockDisponible;
    }

    public void setStockDisponible(Integer stockDisponible) {
        this.stockDisponible = stockDisponible;
    }
}

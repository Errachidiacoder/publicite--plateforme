package com.publicity_platform.project.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ProduitResponseDto {

    private Long id;
    private String nom;
    private String descriptionCourte;
    private String descriptionDetaillee;
    private BigDecimal prix;
    private BigDecimal prixPromo;
    private Integer quantiteStock;
    private String statutProduit;
    private Long categorieId;
    private String categorieNom;
    private String categorieSlug;
    private String tags;
    private String deliveryOption;
    private Double noteMoyenne;
    private Integer nombreAvis;
    private Long compteurVues;
    private Long nombreVentes;
    private String primaryImageUrl;
    private List<ProductImageDto> images;
    private Long boutiqueId;
    private String boutiqueNom;
    private String typeActivite;
    private LocalDateTime createdAt;

    // Getters & Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getDescriptionCourte() {
        return descriptionCourte;
    }

    public void setDescriptionCourte(String descriptionCourte) {
        this.descriptionCourte = descriptionCourte;
    }

    public String getDescriptionDetaillee() {
        return descriptionDetaillee;
    }

    public void setDescriptionDetaillee(String descriptionDetaillee) {
        this.descriptionDetaillee = descriptionDetaillee;
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

    public Integer getQuantiteStock() {
        return quantiteStock;
    }

    public void setQuantiteStock(Integer quantiteStock) {
        this.quantiteStock = quantiteStock;
    }

    public String getStatutProduit() {
        return statutProduit;
    }

    public void setStatutProduit(String statutProduit) {
        this.statutProduit = statutProduit;
    }

    public Long getCategorieId() {
        return categorieId;
    }

    public void setCategorieId(Long categorieId) {
        this.categorieId = categorieId;
    }

    public String getCategorieNom() {
        return categorieNom;
    }

    public void setCategorieNom(String categorieNom) {
        this.categorieNom = categorieNom;
    }

    public String getCategorieSlug() {
        return categorieSlug;
    }

    public void setCategorieSlug(String categorieSlug) {
        this.categorieSlug = categorieSlug;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public String getDeliveryOption() {
        return deliveryOption;
    }

    public void setDeliveryOption(String deliveryOption) {
        this.deliveryOption = deliveryOption;
    }

    public Double getNoteMoyenne() {
        return noteMoyenne;
    }

    public void setNoteMoyenne(Double noteMoyenne) {
        this.noteMoyenne = noteMoyenne;
    }

    public Integer getNombreAvis() {
        return nombreAvis;
    }

    public void setNombreAvis(Integer nombreAvis) {
        this.nombreAvis = nombreAvis;
    }

    public Long getCompteurVues() {
        return compteurVues;
    }

    public void setCompteurVues(Long compteurVues) {
        this.compteurVues = compteurVues;
    }

    public Long getNombreVentes() {
        return nombreVentes;
    }

    public void setNombreVentes(Long nombreVentes) {
        this.nombreVentes = nombreVentes;
    }

    public String getPrimaryImageUrl() {
        return primaryImageUrl;
    }

    public void setPrimaryImageUrl(String primaryImageUrl) {
        this.primaryImageUrl = primaryImageUrl;
    }

    public List<ProductImageDto> getImages() {
        return images;
    }

    public void setImages(List<ProductImageDto> images) {
        this.images = images;
    }

    public Long getBoutiqueId() {
        return boutiqueId;
    }

    public void setBoutiqueId(Long boutiqueId) {
        this.boutiqueId = boutiqueId;
    }

    public String getBoutiqueNom() {
        return boutiqueNom;
    }

    public void setBoutiqueNom(String boutiqueNom) {
        this.boutiqueNom = boutiqueNom;
    }

    public String getTypeActivite() {
        return typeActivite;
    }

    public void setTypeActivite(String typeActivite) {
        this.typeActivite = typeActivite;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

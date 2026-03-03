package com.publicity_platform.project.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class ProduitRequestDto {

    @NotBlank(message = "Le nom du produit est obligatoire")
    @Size(max = 100, message = "Le nom ne doit pas dépasser 100 caractères")
    private String nom;

    @Size(max = 200, message = "La description courte ne doit pas dépasser 200 caractères")
    private String descriptionCourte;

    @NotBlank(message = "La description détaillée est obligatoire")
    private String descriptionDetaillee;

    @NotNull(message = "Le prix est obligatoire")
    @DecimalMin(value = "0.01", message = "Le prix doit être supérieur à 0")
    private BigDecimal prix;

    @DecimalMin(value = "0.0", message = "Le prix promo doit être positif")
    private BigDecimal prixPromo;

    @NotNull(message = "La quantité en stock est obligatoire")
    @Min(value = 0, message = "La quantité ne peut pas être négative")
    private Integer quantiteStock;

    @NotNull(message = "La catégorie est obligatoire")
    private Long categorieId;

    private String tags;
    private String sku;
    private String deliveryOption;
    private String statutProduit;
    private Double poidsProduit;
    private String dimensions;

    // Getters & Setters

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

    public Long getCategorieId() {
        return categorieId;
    }

    public void setCategorieId(Long categorieId) {
        this.categorieId = categorieId;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getDeliveryOption() {
        return deliveryOption;
    }

    public void setDeliveryOption(String deliveryOption) {
        this.deliveryOption = deliveryOption;
    }

    public String getStatutProduit() {
        return statutProduit;
    }

    public void setStatutProduit(String statutProduit) {
        this.statutProduit = statutProduit;
    }

    public Double getPoidsProduit() {
        return poidsProduit;
    }

    public void setPoidsProduit(Double poidsProduit) {
        this.poidsProduit = poidsProduit;
    }

    public String getDimensions() {
        return dimensions;
    }

    public void setDimensions(String dimensions) {
        this.dimensions = dimensions;
    }
}

package com.publicity_platform.project.dto;

import com.publicity_platform.project.entity.Produit;

public class ProduitRecommandationDTO {
    private Long id;
    private String name;
    private String description;
    private String categoryName;
    private Double price;
    private Long viewCount;
    private Boolean premium;
    private String imageUrl;

    public ProduitRecommandationDTO() {
    }

    public static ProduitRecommandationDTO fromEntity(Produit p) {
        ProduitRecommandationDTO dto = new ProduitRecommandationDTO();
        dto.setId(p.getId());
        dto.setName(p.getTitreProduit());
        dto.setDescription(p.getDescriptionDetaillee());
        dto.setCategoryName(p.getCategorie() != null ? p.getCategorie().getNomCategorie() : "Divers");
        dto.setPrice(p.getPrixAfiche());
        dto.setViewCount(p.getCompteurVues());
        dto.setPremium(p.getAnnoncePremium());
        dto.setImageUrl(p.getImageUrl());
        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Long getViewCount() {
        return viewCount;
    }

    public void setViewCount(Long viewCount) {
        this.viewCount = viewCount;
    }

    public Boolean getPremium() {
        return premium;
    }

    public void setPremium(Boolean premium) {
        this.premium = premium;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}

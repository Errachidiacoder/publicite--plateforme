package com.publicity_platform.project.dto;

import java.util.List;
import java.util.stream.Collectors;

public class CategorieDto {
    private Long id;
    private String nomCategorie;
    private String iconeCategorie;
    private String descriptionCategorie;
    private List<CategorieDto> sousCategories;

    public CategorieDto() {
    }

    public CategorieDto(Long id, String nomCategorie, String iconeCategorie, String descriptionCategorie,
            List<CategorieDto> sousCategories) {
        this.id = id;
        this.nomCategorie = nomCategorie;
        this.iconeCategorie = iconeCategorie;
        this.descriptionCategorie = descriptionCategorie;
        this.sousCategories = sousCategories;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomCategorie() {
        return nomCategorie;
    }

    public void setNomCategorie(String nomCategorie) {
        this.nomCategorie = nomCategorie;
    }

    public String getIconeCategorie() {
        return iconeCategorie;
    }

    public void setIconeCategorie(String iconeCategorie) {
        this.iconeCategorie = iconeCategorie;
    }

    public String getDescriptionCategorie() {
        return descriptionCategorie;
    }

    public void setDescriptionCategorie(String descriptionCategorie) {
        this.descriptionCategorie = descriptionCategorie;
    }

    public List<CategorieDto> getSousCategories() {
        return sousCategories;
    }

    public void setSousCategories(List<CategorieDto> sousCategories) {
        this.sousCategories = sousCategories;
    }

    public static CategorieDto fromEntity(com.publicity_platform.project.entity.Categorie entity) {
        if (entity == null)
            return null;

        List<CategorieDto> children = null;
        if (entity.getSousCategories() != null) {
            children = entity.getSousCategories().stream()
                    .map(CategorieDto::fromEntity)
                    .collect(Collectors.toList());
        }

        return new CategorieDto(
                entity.getId(),
                entity.getNomCategorie(),
                entity.getIconeCategorie(),
                entity.getDescriptionCategorie(),
                children);
    }
}

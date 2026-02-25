package com.publicity_platform.project.dto;

public class CategorieDto {
    private Long id;
    private String nomCategorie;
    private String iconeCategorie;

    public CategorieDto() {
    }

    public CategorieDto(Long id, String nomCategorie, String iconeCategorie) {
        this.id = id;
        this.nomCategorie = nomCategorie;
        this.iconeCategorie = iconeCategorie;
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

    public static CategorieDto fromEntity(com.publicity_platform.project.entity.Categorie entity) {
        if (entity == null)
            return null;
        return new CategorieDto(
                entity.getId(),
                entity.getNomCategorie(),
                entity.getIconeCategorie());
    }
}

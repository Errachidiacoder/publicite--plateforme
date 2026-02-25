package com.publicity_platform.project.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "categories")
public class Categorie {

    public Categorie() {
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom_categorie", nullable = false)
    private String nomCategorie;

    @Column(name = "description_categorie", columnDefinition = "TEXT")
    private String descriptionCategorie;

    @Column(name = "url_image_couverture")
    private String urlImageCouverture;

    @Column(name = "icone_categorie")
    private String iconeCategorie;

    @Column(name = "categorie_active", nullable = false)
    private Boolean categorieActive = true;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_parente_id")
    private Categorie categorieParente;

    @JsonIgnore
    @OneToMany(mappedBy = "categorieParente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Categorie> sousCategories;

    @JsonIgnore
    @OneToMany(mappedBy = "categorie", fetch = FetchType.LAZY)
    private List<Produit> produits;

    public String getNomCategorie() {
        return nomCategorie;
    }

    public void setNomCategorie(String nomCategorie) {
        this.nomCategorie = nomCategorie;
    }

    public String getDescriptionCategorie() {
        return descriptionCategorie;
    }

    public void setDescriptionCategorie(String descriptionCategorie) {
        this.descriptionCategorie = descriptionCategorie;
    }

    public Boolean getCategorieActive() {
        return categorieActive;
    }

    public void setCategorieActive(Boolean categorieActive) {
        this.categorieActive = categorieActive;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public static CategorieBuilder builder() {
        return new CategorieBuilder();
    }

    public String getIconeCategorie() {
        return iconeCategorie;
    }

    public void setIconeCategorie(String iconeCategorie) {
        this.iconeCategorie = iconeCategorie;
    }

    public static class CategorieBuilder {
        private String nomCategorie;
        private String descriptionCategorie;
        private String iconeCategorie;
        private Boolean categorieActive = true;

        public CategorieBuilder nomCategorie(String nomCategorie) {
            this.nomCategorie = nomCategorie;
            return this;
        }

        public CategorieBuilder descriptionCategorie(String descriptionCategorie) {
            this.descriptionCategorie = descriptionCategorie;
            return this;
        }

        public CategorieBuilder iconeCategorie(String iconeCategorie) {
            this.iconeCategorie = iconeCategorie;
            return this;
        }

        public CategorieBuilder categorieActive(Boolean categorieActive) {
            this.categorieActive = categorieActive;
            return this;
        }

        public Categorie build() {
            Categorie cat = new Categorie();
            cat.setNomCategorie(nomCategorie);
            cat.setDescriptionCategorie(descriptionCategorie);
            cat.setIconeCategorie(iconeCategorie);
            cat.setCategorieActive(categorieActive);
            return cat;
        }
    }
}

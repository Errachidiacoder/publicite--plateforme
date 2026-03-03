package com.publicity_platform.project.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.text.Normalizer;
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

    @Column(name = "slug", unique = true)
    private String slug;

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

    @PrePersist
    protected void onPrePersist() {
        generateSlug();
    }

    @PreUpdate
    protected void onPreUpdate() {
        generateSlug();
    }

    private void generateSlug() {
        if (this.nomCategorie != null) {
            String normalized = Normalizer.normalize(this.nomCategorie, Normalizer.Form.NFD);
            this.slug = normalized
                    .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
                    .toLowerCase()
                    .replaceAll("[^a-z0-9\\s-]", "")
                    .replaceAll("[\\s]+", "-")
                    .replaceAll("-+", "-")
                    .replaceAll("(^-|-$)", "");
        }
    }

    // Getters & Setters

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

    public String getDescriptionCategorie() {
        return descriptionCategorie;
    }

    public void setDescriptionCategorie(String descriptionCategorie) {
        this.descriptionCategorie = descriptionCategorie;
    }

    public String getUrlImageCouverture() {
        return urlImageCouverture;
    }

    public void setUrlImageCouverture(String urlImageCouverture) {
        this.urlImageCouverture = urlImageCouverture;
    }

    public String getIconeCategorie() {
        return iconeCategorie;
    }

    public void setIconeCategorie(String iconeCategorie) {
        this.iconeCategorie = iconeCategorie;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public Boolean getCategorieActive() {
        return categorieActive;
    }

    public void setCategorieActive(Boolean categorieActive) {
        this.categorieActive = categorieActive;
    }

    public Categorie getCategorieParente() {
        return categorieParente;
    }

    public void setCategorieParente(Categorie categorieParente) {
        this.categorieParente = categorieParente;
    }

    public List<Categorie> getSousCategories() {
        return sousCategories;
    }

    public void setSousCategories(List<Categorie> sousCategories) {
        this.sousCategories = sousCategories;
    }

    public List<Produit> getProduits() {
        return produits;
    }

    public void setProduits(List<Produit> produits) {
        this.produits = produits;
    }

    public static CategorieBuilder builder() {
        return new CategorieBuilder();
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

package com.publicity_platform.project.entity;

import com.publicity_platform.project.enumm.DeliveryOption;
import com.publicity_platform.project.enumm.Disponibilite;
import com.publicity_platform.project.enumm.StatutProduit;
import com.publicity_platform.project.enumm.TypeAnnonce;
import com.publicity_platform.project.enumm.TypePrix;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "produits")
public class Produit {

    public Produit() {
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ─── Existing fields (kept for backward compatibility) ───

    @NotBlank
    @Column(name = "titre_produit", nullable = false)
    private String titreProduit;

    @NotBlank
    @Column(name = "description_detaillee", columnDefinition = "TEXT", nullable = false)
    private String descriptionDetaillee;

    @Column(name = "type_annonce", nullable = false)
    private TypeAnnonce typeAnnonce;

    @Column(name = "prix_affiche")
    private Double prixAfiche;

    @Column(name = "type_prix")
    private TypePrix typePrix;

    @Column(name = "disponibilite")
    private Disponibilite disponibilite;

    @Column(name = "ville_localisation")
    private String villeLocalisation;

    @Column(name = "image_url")
    private String imageUrl;

    // ─── New marketplace fields ───

    @Column(name = "description_courte", length = 200)
    private String descriptionCourte;

    @Column(name = "prix", precision = 12, scale = 2)
    private BigDecimal prix;

    @Column(name = "prix_promo", precision = 12, scale = 2)
    private BigDecimal prixPromo;

    @Column(name = "tags", length = 500)
    private String tags;

    @Column(name = "sku", unique = true)
    private String sku;

    @Column(name = "statut_produit")
    private StatutProduit statutProduit = StatutProduit.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_option")
    private DeliveryOption deliveryOption;

    @Column(name = "poids_produit")
    private Double poidsProduit;

    @Column(name = "dimensions", length = 100)
    private String dimensions;

    @Version
    @Column(name = "version")
    private Long version;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ─── Stats fields (existing) ───

    @Column(name = "note_moyenne", nullable = false)
    private Double noteMoyenne = 0.0;

    @Column(name = "nombre_avis", nullable = false)
    private Integer nombreAvis = 0;

    @Column(name = "compteur_vues", nullable = false)
    private Long compteurVues = 0L;

    @Column(name = "nombre_ventes", nullable = false)
    private Long nombreVentes = 0L;

    @Column(name = "quantite_stock")
    private Integer quantiteStock = 0;

    // ─── Relations ───

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "boutique_id")
    private Boutique boutique;

    @JsonIgnore
    @OneToMany(mappedBy = "produit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Anonce> anonces;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "annonceur_id", nullable = false)
    private Utilisateur annonceur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;

    @OneToMany(mappedBy = "produit", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProductImage> images = new ArrayList<>();

    // ─── Lifecycle callbacks ───

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.statutProduit == null) {
            this.statutProduit = StatutProduit.DRAFT;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        // Auto-set OUT_OF_STOCK when stock reaches 0
        if (this.quantiteStock != null && this.quantiteStock <= 0
                && this.statutProduit == StatutProduit.ACTIVE) {
            this.statutProduit = StatutProduit.OUT_OF_STOCK;
        }
    }

    // ─── Getters & Setters ───

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitreProduit() {
        return titreProduit;
    }

    public void setTitreProduit(String titreProduit) {
        this.titreProduit = titreProduit;
    }

    public String getDescriptionDetaillee() {
        return descriptionDetaillee;
    }

    public void setDescriptionDetaillee(String descriptionDetaillee) {
        this.descriptionDetaillee = descriptionDetaillee;
    }

    public TypeAnnonce getTypeAnnonce() {
        return typeAnnonce;
    }

    public void setTypeAnnonce(TypeAnnonce typeAnnonce) {
        this.typeAnnonce = typeAnnonce;
    }

    public Double getPrixAfiche() {
        return prixAfiche;
    }

    public void setPrixAfiche(Double prixAfiche) {
        this.prixAfiche = prixAfiche;
    }

    public TypePrix getTypePrix() {
        return typePrix;
    }

    public void setTypePrix(TypePrix typePrix) {
        this.typePrix = typePrix;
    }

    public Disponibilite getDisponibilite() {
        return disponibilite;
    }

    public void setDisponibilite(Disponibilite disponibilite) {
        this.disponibilite = disponibilite;
    }

    public String getVilleLocalisation() {
        return villeLocalisation;
    }

    public void setVilleLocalisation(String villeLocalisation) {
        this.villeLocalisation = villeLocalisation;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getDescriptionCourte() {
        return descriptionCourte;
    }

    public void setDescriptionCourte(String descriptionCourte) {
        this.descriptionCourte = descriptionCourte;
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

    public StatutProduit getStatutProduit() {
        return statutProduit;
    }

    public void setStatutProduit(StatutProduit statutProduit) {
        this.statutProduit = statutProduit;
    }

    public DeliveryOption getDeliveryOption() {
        return deliveryOption;
    }

    public void setDeliveryOption(DeliveryOption deliveryOption) {
        this.deliveryOption = deliveryOption;
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

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
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

    public Integer getQuantiteStock() {
        return quantiteStock;
    }

    public void setQuantiteStock(Integer quantiteStock) {
        this.quantiteStock = quantiteStock;
    }

    public Boutique getBoutique() {
        return boutique;
    }

    public void setBoutique(Boutique boutique) {
        this.boutique = boutique;
    }

    public Utilisateur getAnnonceur() {
        return annonceur;
    }

    public void setAnnonceur(Utilisateur annonceur) {
        this.annonceur = annonceur;
    }

    public Categorie getCategorie() {
        return categorie;
    }

    public void setCategorie(Categorie categorie) {
        this.categorie = categorie;
    }

    public List<ProductImage> getImages() {
        return images;
    }

    public void setImages(List<ProductImage> images) {
        this.images = images;
    }

    public List<Anonce> getAnonces() {
        return anonces;
    }

    public void setAnonces(List<Anonce> anonces) {
        this.anonces = anonces;
    }

    // ─── Builder ───

    public static ProduitBuilder builder() {
        return new ProduitBuilder();
    }

    public static class ProduitBuilder {
        private String titreProduit;
        private String descriptionDetaillee;
        private TypeAnnonce typeAnnonce;
        private Double prixAfiche;
        private TypePrix typePrix;
        private Utilisateur annonceur;
        private Categorie categorie;
        private String imageUrl;

        public ProduitBuilder titreProduit(String titreProduit) {
            this.titreProduit = titreProduit;
            return this;
        }

        public ProduitBuilder descriptionDetaillee(String descriptionDetaillee) {
            this.descriptionDetaillee = descriptionDetaillee;
            return this;
        }

        public ProduitBuilder typeAnnonce(TypeAnnonce typeAnnonce) {
            this.typeAnnonce = typeAnnonce;
            return this;
        }

        public ProduitBuilder prixAfiche(Double prixAfiche) {
            this.prixAfiche = prixAfiche;
            return this;
        }

        public ProduitBuilder typePrix(TypePrix typePrix) {
            this.typePrix = typePrix;
            return this;
        }

        public ProduitBuilder annonceur(Utilisateur annonceur) {
            this.annonceur = annonceur;
            return this;
        }

        public ProduitBuilder categorie(Categorie categorie) {
            this.categorie = categorie;
            return this;
        }

        public ProduitBuilder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public Produit build() {
            Produit p = new Produit();
            p.setTitreProduit(titreProduit);
            p.setDescriptionDetaillee(descriptionDetaillee);
            p.setTypeAnnonce(typeAnnonce);
            p.setPrixAfiche(prixAfiche);
            p.setTypePrix(typePrix);
            p.setAnnonceur(annonceur);
            p.setCategorie(categorie);
            p.setImageUrl(imageUrl);
            return p;
        }
    }
}

package com.publicity_platform.project.entity;

import com.publicity_platform.project.enumm.Disponibilite;
import com.publicity_platform.project.enumm.TypeAnnonce;
import com.publicity_platform.project.enumm.TypePrix;
import com.publicity_platform.project.entity.Anonce;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

@Entity
@Table(name = "produits")
public class Produit {

    public Produit() {
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "titre_produit", nullable = false)
    private String titreProduit;

    @NotBlank
    @Column(name = "description_detaillee", columnDefinition = "TEXT", nullable = false)
    private String descriptionDetaillee;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_annonce", nullable = false)
    private TypeAnnonce typeAnnonce;

    @Column(name = "prix_affiche")
    private Double prixAfiche;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_prix")
    private TypePrix typePrix;

    @Enumerated(EnumType.STRING)
    @Column(name = "disponibilite")
    private Disponibilite disponibilite;

    @Column(name = "ville_localisation")
    private String villeLocalisation;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "note_moyenne", nullable = false)
    private Double noteMoyenne = 0.0;

    @Column(name = "nombre_avis", nullable = false)
    private Integer nombreAvis = 0;

    @JsonIgnore
    @OneToMany(mappedBy = "produit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Anonce> anonces;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "annonceur_id", nullable = false)
    private Utilisateur annonceur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;

    @JsonIgnore
    @OneToMany(mappedBy = "produit", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<MediaAsset> medias;

    @JsonIgnore
    @OneToMany(mappedBy = "produitConcerne", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HistoriqueValidation> historiques;

    @JsonIgnore
    @OneToMany(mappedBy = "produitSuivi", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<StatistiqueAnnonce> statistiques;

    @JsonIgnore
    @OneToMany(mappedBy = "produitConsulte", fetch = FetchType.LAZY)
    private List<HistoriqueNavigation> navigations;

    @JsonIgnore
    @OneToMany(mappedBy = "produitSource", fetch = FetchType.LAZY)
    private List<Notification> notifications;

    @PrePersist
    protected void onCreate() {
        // Product-specific initialization logic can be added here if needed
    }

    // Explicit Getters and Setters
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

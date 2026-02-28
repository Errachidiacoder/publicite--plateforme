package com.publicity_platform.project.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "media_assets")
public class MediaAsset {

    public MediaAsset() {
    }

    public MediaAsset(Long id, String urlStockage, String formatFichier, Long tailleFichierKo, Boolean imagePrincipale,
            Integer ordreAffichage, LocalDateTime dateTelechargement, Produit produit) {
        this.id = id;
        this.urlStockage = urlStockage;
        this.formatFichier = formatFichier;
        this.tailleFichierKo = tailleFichierKo;
        this.imagePrincipale = imagePrincipale;
        this.ordreAffichage = ordreAffichage;
        this.dateTelechargement = dateTelechargement;
        this.produit = produit;
    }

    public static MediaAssetBuilder builder() {
        return new MediaAssetBuilder();
    }

    public static class MediaAssetBuilder {
        private Long id;
        private String urlStockage;
        private String formatFichier;
        private Long tailleFichierKo;
        private Boolean imagePrincipale = false;
        private Integer ordreAffichage;
        private LocalDateTime dateTelechargement;
        private Produit produit;

        public MediaAssetBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public MediaAssetBuilder urlStockage(String urlStockage) {
            this.urlStockage = urlStockage;
            return this;
        }

        public MediaAssetBuilder formatFichier(String formatFichier) {
            this.formatFichier = formatFichier;
            return this;
        }

        public MediaAssetBuilder tailleFichierKo(Long tailleFichierKo) {
            this.tailleFichierKo = tailleFichierKo;
            return this;
        }

        public MediaAssetBuilder imagePrincipale(Boolean imagePrincipale) {
            this.imagePrincipale = imagePrincipale;
            return this;
        }

        public MediaAssetBuilder ordreAffichage(Integer ordreAffichage) {
            this.ordreAffichage = ordreAffichage;
            return this;
        }

        public MediaAssetBuilder dateTelechargement(LocalDateTime dateTelechargement) {
            this.dateTelechargement = dateTelechargement;
            return this;
        }

        public MediaAssetBuilder produit(Produit produit) {
            this.produit = produit;
            return this;
        }

        public MediaAsset build() {
            return new MediaAsset(id, urlStockage, formatFichier, tailleFichierKo, imagePrincipale, ordreAffichage,
                    dateTelechargement, produit);
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "url_stockage", nullable = false)
    private String urlStockage;

    /** JPG / PNG */
    @Column(name = "format_fichier")
    private String formatFichier;

    @Column(name = "taille_fichier_ko")
    private Long tailleFichierKo;

    /** true = image mise en avant dans la galerie */
    @Column(name = "image_principale", nullable = false)
    private Boolean imagePrincipale = false;

    @Column(name = "ordre_affichage")
    private Integer ordreAffichage;

    @Column(name = "date_telechargement")
    private LocalDateTime dateTelechargement;

    // ─────────────────────────────────────────────
    // Relation 1..* MediaAsset → 1 Produit (composition)
    // ─────────────────────────────────────────────

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_id", nullable = false)
    private Produit produit;

    // Explicit Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUrlStockage() {
        return urlStockage;
    }

    public void setUrlStockage(String urlStockage) {
        this.urlStockage = urlStockage;
    }

    public String getFormatFichier() {
        return formatFichier;
    }

    public void setFormatFichier(String formatFichier) {
        this.formatFichier = formatFichier;
    }

    public Long getTailleFichierKo() {
        return tailleFichierKo;
    }

    public void setTailleFichierKo(Long tailleFichierKo) {
        this.tailleFichierKo = tailleFichierKo;
    }

    public Boolean getImagePrincipale() {
        return imagePrincipale;
    }

    public void setImagePrincipale(Boolean imagePrincipale) {
        this.imagePrincipale = imagePrincipale;
    }

    public Integer getOrdreAffichage() {
        return ordreAffichage;
    }

    public void setOrdreAffichage(Integer ordreAffichage) {
        this.ordreAffichage = ordreAffichage;
    }

    public LocalDateTime getDateTelechargement() {
        return dateTelechargement;
    }

    public void setDateTelechargement(LocalDateTime dateTelechargement) {
        this.dateTelechargement = dateTelechargement;
    }

    public Produit getProduit() {
        return produit;
    }

    public void setProduit(Produit produit) {
        this.produit = produit;
    }

    @PrePersist
    protected void onCreate() {
        this.dateTelechargement = LocalDateTime.now();
    }
}

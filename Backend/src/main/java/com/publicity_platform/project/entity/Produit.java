package com.publicity_platform.project.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.publicity_platform.project.enumm.Disponibilite;
import com.publicity_platform.project.enumm.StatutValidation;
import com.publicity_platform.project.enumm.TypeAnnonce;
import com.publicity_platform.project.enumm.TypePrix;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
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

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_validation", nullable = false)
    private StatutValidation statutValidation = StatutValidation.EN_ATTENTE;

    @Column(name = "annonce_premium", nullable = false)
    private Boolean annoncePremium = false;

    @Column(name = "compteur_vues", nullable = false)
    private Long compteurVues = 0L;

    @Column(name = "date_soumission", nullable = false, updatable = false)
    private LocalDateTime dateSoumission;

    @Column(name = "date_publication")
    private LocalDateTime datePublication;

    @Column(name = "date_expiration")
    private LocalDateTime dateExpiration;

    @Column(name = "ville_localisation")
    private String villeLocalisation;

    @Column(name = "motif_refus_admin", columnDefinition = "TEXT")
    private String motifRefusAdmin;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "annonceur_id", nullable = false)
    private Utilisateur annonceur;

    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
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

    // ─── Champs SouqBladi ───────────────────────

    @Column(name = "quantite_stock")
    private Integer quantiteStock = 0;

    @Column(name = "prix_promo")
    private Double prixPromo;

    @Column(name = "nombre_ventes")
    private Long nombreVentes = 0L;

    @Column(name = "nombre_avis")
    private Integer nombreAvis = 0;

    @Column(name = "note_moyenne")
    private Double noteMoyenne = 0.0;

    // ─── Relations SouqBladi ────────────────────

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "boutique_id")
    private Boutique boutique;

    @JsonIgnore
    @OneToMany(mappedBy = "produit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Avis> avis;

    @PrePersist
    protected void onCreate() {
        this.dateSoumission = LocalDateTime.now();
        if (this.statutValidation == null) {
            this.statutValidation = StatutValidation.EN_ATTENTE;
        }
    }

    public void incrementerVues() {
        this.compteurVues++;
    }

    public void publier(int dureeEnMois) {
        this.statutValidation = StatutValidation.VALIDE;
        this.datePublication = LocalDateTime.now();
        this.dateExpiration = LocalDateTime.now().plusMonths(dureeEnMois);
    }

    public void archiver() {
        this.statutValidation = StatutValidation.ARCHIVE;
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

    public StatutValidation getStatutValidation() {
        return statutValidation;
    }

    public void setStatutValidation(StatutValidation statutValidation) {
        this.statutValidation = statutValidation;
    }

    public Boolean getAnnoncePremium() {
        return annoncePremium;
    }

    public void setAnnoncePremium(Boolean annoncePremium) {
        this.annoncePremium = annoncePremium;
    }

    public Long getCompteurVues() {
        return compteurVues;
    }

    public void setCompteurVues(Long compteurVues) {
        this.compteurVues = compteurVues;
    }

    public LocalDateTime getDateSoumission() {
        return dateSoumission;
    }

    public void setDateSoumission(LocalDateTime dateSoumission) {
        this.dateSoumission = dateSoumission;
    }

    public String getVilleLocalisation() {
        return villeLocalisation;
    }

    public void setVilleLocalisation(String villeLocalisation) {
        this.villeLocalisation = villeLocalisation;
    }

    public String getMotifRefusAdmin() {
        return motifRefusAdmin;
    }

    public void setMotifRefusAdmin(String motifRefusAdmin) {
        this.motifRefusAdmin = motifRefusAdmin;
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
        private StatutValidation statutValidation = StatutValidation.EN_ATTENTE;
        private Utilisateur annonceur;
        private Categorie categorie;

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

        public ProduitBuilder statutValidation(StatutValidation statutValidation) {
            this.statutValidation = statutValidation;
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

        public Produit build() {
            Produit p = new Produit();
            p.setTitreProduit(titreProduit);
            p.setDescriptionDetaillee(descriptionDetaillee);
            p.setTypeAnnonce(typeAnnonce);
            p.setPrixAfiche(prixAfiche);
            p.setTypePrix(typePrix);
            p.setStatutValidation(statutValidation);
            p.setAnnonceur(annonceur);
            p.setCategorie(categorie);
            return p;
        }
    }

    // ─── Getters & Setters SouqBladi ───────────

    public Integer getQuantiteStock() {
        return quantiteStock;
    }

    public void setQuantiteStock(Integer quantiteStock) {
        this.quantiteStock = quantiteStock;
    }

    public Double getPrixPromo() {
        return prixPromo;
    }

    public void setPrixPromo(Double prixPromo) {
        this.prixPromo = prixPromo;
    }

    public Long getNombreVentes() {
        return nombreVentes;
    }

    public void setNombreVentes(Long nombreVentes) {
        this.nombreVentes = nombreVentes;
    }

    public Integer getNombreAvis() {
        return nombreAvis;
    }

    public void setNombreAvis(Integer nombreAvis) {
        this.nombreAvis = nombreAvis;
    }

    public Double getNoteMoyenne() {
        return noteMoyenne;
    }

    public void setNoteMoyenne(Double noteMoyenne) {
        this.noteMoyenne = noteMoyenne;
    }

    public Boutique getBoutique() {
        return boutique;
    }

    public void setBoutique(Boutique boutique) {
        this.boutique = boutique;
    }

    public List<Avis> getAvis() {
        return avis;
    }

    public void setAvis(List<Avis> avis) {
        this.avis = avis;
    }

    public List<MediaAsset> getMedias() {
        return medias;
    }

    public void setMedias(List<MediaAsset> medias) {
        this.medias = medias;
    }

    public LocalDateTime getDatePublication() {
        return datePublication;
    }

    public void setDatePublication(LocalDateTime datePublication) {
        this.datePublication = datePublication;
    }

    public LocalDateTime getDateExpiration() {
        return dateExpiration;
    }

    public void setDateExpiration(LocalDateTime dateExpiration) {
        this.dateExpiration = dateExpiration;
    }
}

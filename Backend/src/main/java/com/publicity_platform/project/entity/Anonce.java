package com.publicity_platform.project.entity;

import com.publicity_platform.project.enumm.Disponibilite;
import com.publicity_platform.project.enumm.StatutValidation;
import com.publicity_platform.project.enumm.TypeAnnonce;
import com.publicity_platform.project.enumm.TypePrix;
import com.publicity_platform.project.entity.Produit;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "anonces")
public class Anonce {

    public Anonce() {
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "titre_anonce", nullable = false)
    private String titreAnonce;

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

    @Column(name = "image_url")
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_id", nullable = true)
    private Produit produit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "annonceur_id", nullable = false)
    private Utilisateur annonceur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;

    @JsonIgnore
    @OneToMany(mappedBy = "anonce", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<MediaAsset> medias;

    @JsonIgnore
    @OneToMany(mappedBy = "anonceConcerne", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HistoriqueValidation> historiques;

    @JsonIgnore
    @OneToMany(mappedBy = "anonceSuivi", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<StatistiqueAnnonce> statistiques;

    @JsonIgnore
    @OneToMany(mappedBy = "anonceConsulte", fetch = FetchType.LAZY)
    private List<HistoriqueNavigation> navigations;

    @JsonIgnore
    @OneToMany(mappedBy = "anonceSource", fetch = FetchType.LAZY)
    private List<Notification> notifications;

    @PrePersist
    protected void onCreate() {
        this.dateSoumission = LocalDateTime.now();
        this.statutValidation = StatutValidation.EN_ATTENTE;
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

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitreAnonce() {
        return titreAnonce;
    }

    public void setTitreAnonce(String titreAnonce) {
        this.titreAnonce = titreAnonce;
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

    public Produit getProduit() {
        return produit;
    }

    public void setProduit(Produit produit) {
        this.produit = produit;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
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

    public List<MediaAsset> getMedias() {
        return medias;
    }

    public void setMedias(List<MediaAsset> medias) {
        this.medias = medias;
    }

    public List<HistoriqueValidation> getHistoriques() {
        return historiques;
    }

    public void setHistoriques(List<HistoriqueValidation> historiques) {
        this.historiques = historiques;
    }

    public List<StatistiqueAnnonce> getStatistiques() {
        return statistiques;
    }

    public void setStatistiques(List<StatistiqueAnnonce> statistiques) {
        this.statistiques = statistiques;
    }

    public List<HistoriqueNavigation> getNavigations() {
        return navigations;
    }

    public void setNavigations(List<HistoriqueNavigation> navigations) {
        this.navigations = navigations;
    }

    public List<Notification> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<Notification> notifications) {
        this.notifications = notifications;
    }

    public static AnonceBuilder builder() {
        return new AnonceBuilder();
    }

    public static class AnonceBuilder {
        private String titreAnonce;
        private String descriptionDetaillee;
        private TypeAnnonce typeAnnonce;
        private Double prixAfiche;
        private TypePrix typePrix;
        private StatutValidation statutValidation = StatutValidation.EN_ATTENTE;
        private Utilisateur annonceur;
        private Categorie categorie;
        private String imageUrl;

        public AnonceBuilder titreAnonce(String titreAnonce) {
            this.titreAnonce = titreAnonce;
            return this;
        }

        public AnonceBuilder descriptionDetaillee(String descriptionDetaillee) {
            this.descriptionDetaillee = descriptionDetaillee;
            return this;
        }

        public AnonceBuilder typeAnnonce(TypeAnnonce typeAnnonce) {
            this.typeAnnonce = typeAnnonce;
            return this;
        }

        public AnonceBuilder prixAfiche(Double prixAfiche) {
            this.prixAfiche = prixAfiche;
            return this;
        }

        public AnonceBuilder typePrix(TypePrix typePrix) {
            this.typePrix = typePrix;
            return this;
        }

        public AnonceBuilder statutValidation(StatutValidation statutValidation) {
            this.statutValidation = statutValidation;
            return this;
        }

        public AnonceBuilder annonceur(Utilisateur annonceur) {
            this.annonceur = annonceur;
            return this;
        }

        public AnonceBuilder categorie(Categorie categorie) {
            this.categorie = categorie;
            return this;
        }

        public AnonceBuilder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public Anonce build() {
            Anonce a = new Anonce();
            a.setTitreAnonce(titreAnonce);
            a.setDescriptionDetaillee(descriptionDetaillee);
            a.setTypeAnnonce(typeAnnonce);
            a.setPrixAfiche(prixAfiche);
            a.setTypePrix(typePrix);
            a.setStatutValidation(statutValidation);
            a.setAnnonceur(annonceur);
            a.setCategorie(categorie);
            a.setImageUrl(imageUrl);
            return a;
        }
    }
}

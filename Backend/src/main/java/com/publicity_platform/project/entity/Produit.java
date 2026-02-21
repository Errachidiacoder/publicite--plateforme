package com.publicity_platform.project.entity;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "annonceur_id", nullable = false)
    private Utilisateur annonceur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;

    @OneToMany(mappedBy = "produit", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<MediaAsset> medias;

    @OneToMany(mappedBy = "produitConcerne", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HistoriqueValidation> historiques;

    @OneToMany(mappedBy = "produitSuivi", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<StatistiqueAnnonce> statistiques;

    @OneToMany(mappedBy = "produitConsulte", fetch = FetchType.LAZY)
    private List<HistoriqueNavigation> navigations;

    @OneToMany(mappedBy = "produitSource", fetch = FetchType.LAZY)
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
}

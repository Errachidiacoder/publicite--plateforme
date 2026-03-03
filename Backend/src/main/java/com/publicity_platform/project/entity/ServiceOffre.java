package com.publicity_platform.project.entity;

import com.publicity_platform.project.enumm.ModeTravail;
import com.publicity_platform.project.enumm.StatutPaiementService;
import com.publicity_platform.project.enumm.StatutService;
import com.publicity_platform.project.enumm.TypeContrat;
import com.publicity_platform.project.enumm.TypePrix;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

@Entity
@Table(name = "services_offres")
public class ServiceOffre {

    public ServiceOffre() {
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "titre_service", nullable = false)
    private String titreService;

    @NotBlank
    @Column(name = "description_detaillee", columnDefinition = "TEXT", nullable = false)
    private String descriptionDetaillee;

    @Column(name = "prix_affiche")
    private Double prixAfiche;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_prix")
    private TypePrix typePrix;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode_travail", nullable = false)
    private ModeTravail modeTravail;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_contrat", nullable = false)
    private TypeContrat typeContrat;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_service", nullable = false)
    private StatutService statutService = StatutService.EN_ATTENTE;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_paiement", nullable = false)
    private StatutPaiementService statutPaiement = StatutPaiementService.NON_INITIE;

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

    @Column(name = "ville_localisation", nullable = false)
    private String villeLocalisation;

    @Column(name = "motif_refus_admin", columnDefinition = "TEXT")
    private String motifRefusAdmin;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "telephone_contact")
    private String telephoneContact;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demandeur_id", nullable = false)
    private Utilisateur demandeur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;

    @PrePersist
    protected void onCreate() {
        this.dateSoumission = LocalDateTime.now();
        this.statutService = StatutService.EN_ATTENTE;
        this.statutPaiement = StatutPaiementService.NON_INITIE;
    }

    public void incrementerVues() {
        this.compteurVues++;
    }

    public void valider(int dureeEnMois) {
        this.statutService = StatutService.VALIDE;
        this.datePublication = LocalDateTime.now();
        this.dateExpiration = LocalDateTime.now().plusMonths(dureeEnMois);
        this.statutPaiement = StatutPaiementService.EN_ATTENTE;
    }

    public void activer() {
        this.statutService = StatutService.ACTIVEE;
    }

    public void archiver() {
        this.statutService = StatutService.ARCHIVE;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitreService() {
        return titreService;
    }

    public void setTitreService(String titreService) {
        this.titreService = titreService;
    }

    public String getDescriptionDetaillee() {
        return descriptionDetaillee;
    }

    public void setDescriptionDetaillee(String descriptionDetaillee) {
        this.descriptionDetaillee = descriptionDetaillee;
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

    public ModeTravail getModeTravail() {
        return modeTravail;
    }

    public void setModeTravail(ModeTravail modeTravail) {
        this.modeTravail = modeTravail;
    }

    public TypeContrat getTypeContrat() {
        return typeContrat;
    }

    public void setTypeContrat(TypeContrat typeContrat) {
        this.typeContrat = typeContrat;
    }

    public StatutService getStatutService() {
        return statutService;
    }

    public void setStatutService(StatutService statutService) {
        this.statutService = statutService;
    }

    public StatutPaiementService getStatutPaiement() {
        return statutPaiement;
    }

    public void setStatutPaiement(StatutPaiementService statutPaiement) {
        this.statutPaiement = statutPaiement;
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

    public String getTelephoneContact() {
        return telephoneContact;
    }

    public void setTelephoneContact(String telephoneContact) {
        this.telephoneContact = telephoneContact;
    }

    public Utilisateur getDemandeur() {
        return demandeur;
    }

    public void setDemandeur(Utilisateur demandeur) {
        this.demandeur = demandeur;
    }

    public Categorie getCategorie() {
        return categorie;
    }

    public void setCategorie(Categorie categorie) {
        this.categorie = categorie;
    }
}

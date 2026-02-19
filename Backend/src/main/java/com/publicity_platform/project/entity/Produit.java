package com.publicity_platform.project.entity;

import com.publicity_platform.project.enumm.Disponibilite;
import com.publicity_platform.project.enumm.StatutValidation;
import com.publicity_platform.project.enumm.TypeAnnonce;
import com.publicity_platform.project.enumm.TypePrix;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "produits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produit {

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

    /** Null si typePrix = SUR_DEVIS */
    @Column(name = "prix_affiche")
    private Double prixAfiche;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_prix")
    private TypePrix typePrix;

    @Enumerated(EnumType.STRING)
    @Column(name = "disponibilite")
    private Disponibilite disponibilite;

    /** Cycle de vie : EN_ATTENTE → VALIDE / REFUSE → ARCHIVE */
    @Enumerated(EnumType.STRING)
    @Column(name = "statut_validation", nullable = false)
    @Builder.Default
    private StatutValidation statutValidation = StatutValidation.EN_ATTENTE;

    @Column(name = "annonce_premium", nullable = false)
    @Builder.Default
    private Boolean annoncePremium = false;

    @Column(name = "compteur_vues", nullable = false)
    @Builder.Default
    private Long compteurVues = 0L;

    @Column(name = "date_soumission", nullable = false, updatable = false)
    private LocalDateTime dateSoumission;

    @Column(name = "date_publication")
    private LocalDateTime datePublication;

    /** Durée choisie par l'annonceur : 3 / 6 / 12 mois */
    @Column(name = "date_expiration")
    private LocalDateTime dateExpiration;

    @Column(name = "ville_localisation")
    private String villeLocalisation;

    /** Obligatoire si statut = REFUSE */
    @Column(name = "motif_refus_admin", columnDefinition = "TEXT")
    private String motifRefusAdmin;

    // ─────────────────────────────────────────────
    // Relations ManyToOne (côté propriétaire de la FK)
    // ─────────────────────────────────────────────

    /** 0..* Produits → 1 Utilisateur (annonceur) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "annonceur_id", nullable = false)
    private Utilisateur annonceur;

    /** 0..* Produits → 1 Categorie */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;

    // ─────────────────────────────────────────────
    // Relations OneToMany (composition)
    // ─────────────────────────────────────────────

    /** 1 Produit possède 1..* MediaAsset (composition — min 1 image) */
    @OneToMany(mappedBy = "produit",
            cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<MediaAsset> medias;

    /** 1 Produit retracé par 0..* HistoriqueValidation (composition) */
    @OneToMany(mappedBy = "produitConcerne",
            cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HistoriqueValidation> historiques;

    /** 1 Produit mesuré par 0..* StatistiqueAnnonce (composition) */
    @OneToMany(mappedBy = "produitSuivi",
            cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<StatistiqueAnnonce> statistiques;

    /** 1 Produit consulté via 0..* HistoriqueNavigation */
    @OneToMany(mappedBy = "produitConsulte", fetch = FetchType.LAZY)
    private List<HistoriqueNavigation> navigations;

    /** 1 Produit déclenche 0..* Notifications */
    @OneToMany(mappedBy = "produitSource", fetch = FetchType.LAZY)
    private List<Notification> notifications;

    // ─────────────────────────────────────────────
    // Lifecycle
    // ─────────────────────────────────────────────

    @PrePersist
    protected void onCreate() {
        this.dateSoumission = LocalDateTime.now();
        this.statutValidation = StatutValidation.EN_ATTENTE;
    }

    // ─────────────────────────────────────────────
    // Méthodes métier
    // ─────────────────────────────────────────────

    public void incrementerVues() {
        this.compteurVues++;
    }

    public void publier(int dureeEnMois) {
        this.statutValidation  = StatutValidation.VALIDE;
        this.datePublication   = LocalDateTime.now();
        this.dateExpiration    = LocalDateTime.now().plusMonths(dureeEnMois);
    }

    public void archiver() {
        this.statutValidation = StatutValidation.ARCHIVE;
    }
}

package com.publicity_platform.project.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "historique_navigations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoriqueNavigation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ID utilisateur connecté ou session anonyme */
    @Column(name = "utilisateur_ou_session")
    private String utilisateurOuSession;

    /** Durée passée sur la page du produit (en secondes) */
    @Column(name = "duree_consultation_sec")
    private Integer dureeConsultationSec;

    /** Mot-clé tapé dans la recherche, source (direct, recherche, recommandation) */
    @Column(name = "source_recherche")
    private String sourceRecherche;

    @Column(name = "date_consultation")
    private LocalDateTime dateConsultation;

    // ─────────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────────

    /** 0..* HistoriqueNavigation → 1 Utilisateur (peut être null si anonyme) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur utilisateur;

    /** 0..* HistoriqueNavigation → 1 Produit consulté */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_consulte_id")
    private Produit produitConsulte;

    /** 0..* HistoriqueNavigation → 1 Categorie visitée */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_visitee_id")
    private Categorie categorieVisitee;

    @PrePersist
    protected void onCreate() {
        this.dateConsultation = LocalDateTime.now();
    }
}

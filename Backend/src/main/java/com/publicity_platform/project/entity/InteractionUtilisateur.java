package com.publicity_platform.project.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interactions_utilisateurs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InteractionUtilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Score calculé par l'algorithme (entre 0 et 1) */
    @Column(name = "score_affinite")
    private Double scoreAffinite;

    /** CONTENT_BASED | BEHAVIOR_BASED | COLLABORATIVE */
    @Column(name = "algorithme_utilise")
    private String algorithmeUtilise;

    /** true si la recommandation a été affichée à l'utilisateur */
    @Column(name = "recommandation_affichee", nullable = false)
    @Builder.Default
    private Boolean recommandationAffichee = false;

    @Column(name = "date_generation")
    private LocalDateTime dateGeneration;

    // ─────────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────────

    /** 0..* InteractionUtilisateur → 1 Produit recommandé */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_recommande_id", nullable = false)
    private Produit produitRecommande;

    /** 0..* InteractionUtilisateur → 1 Utilisateur ciblé */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_cible_id", nullable = false)
    private Utilisateur utilisateurCible;

    @PrePersist
    protected void onCreate() {
        this.dateGeneration = LocalDateTime.now();
    }
}

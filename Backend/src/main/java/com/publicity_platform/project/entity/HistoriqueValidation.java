package com.publicity_platform.project.entity;


import com.publicity_platform.project.enumm.StatutValidation;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "historique_validations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoriqueValidation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Ex : "VALIDATION" | "REFUS" | "ARCHIVAGE" */
    @Column(name = "action_effectuee", nullable = false)
    private String actionEffectuee;

    /** Motif saisi par l'admin lors d'un refus */
    @Column(name = "commentaire_admin", columnDefinition = "TEXT")
    private String commentaireAdmin;

    @Enumerated(EnumType.STRING)
    @Column(name = "ancien_statut")
    private StatutValidation ancienStatut;

    @Enumerated(EnumType.STRING)
    @Column(name = "nouveau_statut")
    private StatutValidation nouveauStatut;

    @Column(name = "date_action", nullable = false)
    private LocalDateTime dateAction;

    // ─────────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────────

    /** 0..* HistoriqueValidation → 1 Utilisateur (admin) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_responsable_id")
    private Utilisateur adminResponsable;

    /** 0..* HistoriqueValidation → 1 Produit (composition) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_concerne_id", nullable = false)
    private Produit produitConcerne;

    @PrePersist
    protected void onCreate() {
        this.dateAction = LocalDateTime.now();
    }
}

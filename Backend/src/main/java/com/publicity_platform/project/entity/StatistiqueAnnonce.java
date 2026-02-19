package com.publicity_platform.project.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "statistiques_annonces")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatistiqueAnnonce {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "total_vues_globales")
    @Builder.Default
    private Long totalVuesGlobales = 0L;

    @Column(name = "total_contacts_recus")
    @Builder.Default
    private Integer totalContactsRecus = 0;

    @Column(name = "taux_conversion_estime")
    private Double tauxConversionEstime;

    /** Ex : "QUOTIDIEN" | "MENSUEL" */
    @Column(name = "periode_analyse")
    private String periodeAnalyse;

    @Column(name = "date_generation")
    private LocalDateTime dateGeneration;

    // ─────────────────────────────────────────────
    // Relation  0..* StatistiqueAnnonce → 1 Produit  (composition)
    // ─────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_suivi_id", nullable = false)
    private Produit produitSuivi;

    @PrePersist
    protected void onCreate() {
        this.dateGeneration = LocalDateTime.now();
    }
}

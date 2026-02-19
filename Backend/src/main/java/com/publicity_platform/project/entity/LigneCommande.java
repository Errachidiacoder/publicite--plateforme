package com.publicity_platform.project.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lignes_commande")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LigneCommande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quantite_commandee", nullable = false)
    private Integer quantiteCommandee;

    @Column(name = "prix_unitaire_ttc", nullable = false)
    private Double prixUnitaireTTC;

    @Column(name = "sous_total_ligne")
    private Double sousTotalLigne;

    // ─────────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────────

    /** 0..* LigneCommande → 1 Produit (référence le produit acheté) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_commande_id", nullable = false)
    private Produit produitCommande;

    /** 1..* LigneCommande → 1 Commande (composition) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commande_parente_id", nullable = false)
    private Commande commandeParente;

    // ─────────────────────────────────────────────
    // Calcul automatique du sous-total
    // ─────────────────────────────────────────────

    @PrePersist
    @PreUpdate
    protected void calculerSousTotal() {
        if (this.prixUnitaireTTC != null && this.quantiteCommandee != null) {
            this.sousTotalLigne = this.prixUnitaireTTC * this.quantiteCommandee;
        }
    }
}

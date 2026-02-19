package com.publicity_platform.project.entity;


import com.publicity_platform.project.enumm.MethodePaiement;
import com.publicity_platform.project.enumm.StatutCommande;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "commandes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Commande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference_commande", nullable = false, unique = true)
    private String referenceCommande;

    @Column(name = "montant_total_ttc")
    private Double montantTotalTTC;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_commande", nullable = false)
    @Builder.Default
    private StatutCommande statutCommande = StatutCommande.EN_ATTENTE_PAIEMENT;

    @Enumerated(EnumType.STRING)
    @Column(name = "methode_paiement")
    private MethodePaiement methodePaiement;

    @Column(name = "date_passage_commande")
    private LocalDateTime datePassageCommande;

    @Column(name = "date_livraison_prevue")
    private LocalDateTime dateLivraisonPrevue;

    // ─────────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────────

    /** 0..* Commandes → 1 Utilisateur (acheteur) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acheteur_id", nullable = false)
    private Utilisateur acheteur;

    /** 1 Commande contient 1..* LigneCommande  (composition) */
    @OneToMany(mappedBy = "commandeParente",
            cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<LigneCommande> lignes;

    /** 1 Commande génère 1 Paiement  (composition) */
    @OneToOne(mappedBy = "commande",
            cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Paiement paiement;

    // ─────────────────────────────────────────────
    // Lifecycle & méthodes métier
    // ─────────────────────────────────────────────

    @PrePersist
    protected void onCreate() {
        this.datePassageCommande = LocalDateTime.now();
        this.referenceCommande   = "CMD-" + System.currentTimeMillis();
    }

   /* public Double calculerTotal() {
        if (lignes == null) return 0.0;
        return lignes.stream()
                .mapToDouble(LigneCommande::getSousTotalLigne)
                .sum();
    }*/
}

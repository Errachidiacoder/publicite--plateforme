package com.publicity_platform.project.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "paiements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "montant_transacte", nullable = false)
    private Double montantTransacte;

    /** ID retourné par Stripe ou PayPal */
    @Column(name = "id_transaction_externe")
    private String idTransactionExterne;

    /** SUCCESS | FAILED | PENDING */
    @Column(name = "statut_paiement")
    private String statutPaiement;

    @Column(name = "date_paiement")
    private LocalDateTime datePaiement;

    /** "STRIPE" | "PAYPAL" */
    @Column(name = "fournisseur_paiement")
    private String fournisseurPaiement;

    /**
     * SÉCURITÉ : toujours false.
     * Les données bancaires ne sont JAMAIS stockées en base.
     * Tout est géré côté Stripe / PayPal.
     */
    @Column(name = "donnees_bancaires_stockees", nullable = false)
    @Builder.Default
    private Boolean donneesBancairesStockees = false;

    // ─────────────────────────────────────────────
    // Relation  1 Paiement → 1 Commande  (composition)
    // ─────────────────────────────────────────────

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commande_id", nullable = false)
    private Commande commande;

    @PrePersist
    protected void onCreate() {
        this.datePaiement = LocalDateTime.now();
        // Garantie supplémentaire
        this.donneesBancairesStockees = false;
    }
}

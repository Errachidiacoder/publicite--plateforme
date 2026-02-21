package com.publicity_platform.project.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "paiements")
public class Paiement {

    public Paiement() {
    }

    public Paiement(Long id, Double montantTransacte, String idTransactionExterne, String statutPaiement,
            LocalDateTime datePaiement, String fournisseurPaiement, Boolean donneesBancairesStockees,
            Commande commande) {
        this.id = id;
        this.montantTransacte = montantTransacte;
        this.idTransactionExterne = idTransactionExterne;
        this.statutPaiement = statutPaiement;
        this.datePaiement = datePaiement;
        this.fournisseurPaiement = fournisseurPaiement;
        this.donneesBancairesStockees = donneesBancairesStockees;
        this.commande = commande;
    }

    public static PaiementBuilder builder() {
        return new PaiementBuilder();
    }

    public static class PaiementBuilder {
        private Long id;
        private Double montantTransacte;
        private String idTransactionExterne;
        private String statutPaiement;
        private LocalDateTime datePaiement;
        private String fournisseurPaiement;
        private Boolean donneesBancairesStockees = false;
        private Commande commande;

        public PaiementBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PaiementBuilder montantTransacte(Double montantTransacte) {
            this.montantTransacte = montantTransacte;
            return this;
        }

        public PaiementBuilder idTransactionExterne(String idTransactionExterne) {
            this.idTransactionExterne = idTransactionExterne;
            return this;
        }

        public PaiementBuilder statutPaiement(String statutPaiement) {
            this.statutPaiement = statutPaiement;
            return this;
        }

        public PaiementBuilder datePaiement(LocalDateTime datePaiement) {
            this.datePaiement = datePaiement;
            return this;
        }

        public PaiementBuilder fournisseurPaiement(String fournisseurPaiement) {
            this.fournisseurPaiement = fournisseurPaiement;
            return this;
        }

        public PaiementBuilder donneesBancairesStockees(Boolean donneesBancairesStockees) {
            this.donneesBancairesStockees = donneesBancairesStockees;
            return this;
        }

        public PaiementBuilder commande(Commande commande) {
            this.commande = commande;
            return this;
        }

        public Paiement build() {
            return new Paiement(id, montantTransacte, idTransactionExterne, statutPaiement, datePaiement,
                    fournisseurPaiement, donneesBancairesStockees, commande);
        }
    }

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
    private Boolean donneesBancairesStockees = false;

    // ─────────────────────────────────────────────
    // Relation 1 Paiement → 1 Commande (composition)
    // ─────────────────────────────────────────────

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commande_id", nullable = false)
    private Commande commande;

    // Explicit Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getMontantTransacte() {
        return montantTransacte;
    }

    public void setMontantTransacte(Double montantTransacte) {
        this.montantTransacte = montantTransacte;
    }

    public String getIdTransactionExterne() {
        return idTransactionExterne;
    }

    public void setIdTransactionExterne(String idTransactionExterne) {
        this.idTransactionExterne = idTransactionExterne;
    }

    public String getStatutPaiement() {
        return statutPaiement;
    }

    public void setStatutPaiement(String statutPaiement) {
        this.statutPaiement = statutPaiement;
    }

    public LocalDateTime getDatePaiement() {
        return datePaiement;
    }

    public void setDatePaiement(LocalDateTime datePaiement) {
        this.datePaiement = datePaiement;
    }

    public String getFournisseurPaiement() {
        return fournisseurPaiement;
    }

    public void setFournisseurPaiement(String fournisseurPaiement) {
        this.fournisseurPaiement = fournisseurPaiement;
    }

    public Boolean getDonneesBancairesStockees() {
        return donneesBancairesStockees;
    }

    public void setDonneesBancairesStockees(Boolean donneesBancairesStockees) {
        this.donneesBancairesStockees = donneesBancairesStockees;
    }

    public Commande getCommande() {
        return commande;
    }

    public void setCommande(Commande commande) {
        this.commande = commande;
    }

    @PrePersist
    protected void onCreate() {
        this.datePaiement = LocalDateTime.now();
        // Garantie supplémentaire
        this.donneesBancairesStockees = false;
    }
}

package com.publicity_platform.project.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "lignes_commande")
public class LigneCommande {

    public LigneCommande() {
    }

    public LigneCommande(Long id, Integer quantiteCommandee, Double prixUnitaireTTC, Double sousTotalLigne,
            Produit produitCommande, Commande commandeParente) {
        this.id = id;
        this.quantiteCommandee = quantiteCommandee;
        this.prixUnitaireTTC = prixUnitaireTTC;
        this.sousTotalLigne = sousTotalLigne;
        this.produitCommande = produitCommande;
        this.commandeParente = commandeParente;
    }

    public static LigneCommandeBuilder builder() {
        return new LigneCommandeBuilder();
    }

    public static class LigneCommandeBuilder {
        private Long id;
        private Integer quantiteCommandee;
        private Double prixUnitaireTTC;
        private Double sousTotalLigne;
        private Produit produitCommande;
        private Commande commandeParente;

        public LigneCommandeBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public LigneCommandeBuilder quantiteCommandee(Integer quantiteCommandee) {
            this.quantiteCommandee = quantiteCommandee;
            return this;
        }

        public LigneCommandeBuilder prixUnitaireTTC(Double prixUnitaireTTC) {
            this.prixUnitaireTTC = prixUnitaireTTC;
            return this;
        }

        public LigneCommandeBuilder sousTotalLigne(Double sousTotalLigne) {
            this.sousTotalLigne = sousTotalLigne;
            return this;
        }

        public LigneCommandeBuilder produitCommande(Produit produitCommande) {
            this.produitCommande = produitCommande;
            return this;
        }

        public LigneCommandeBuilder commandeParente(Commande commandeParente) {
            this.commandeParente = commandeParente;
            return this;
        }

        public LigneCommande build() {
            return new LigneCommande(id, quantiteCommandee, prixUnitaireTTC, sousTotalLigne, produitCommande,
                    commandeParente);
        }
    }

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

    // Explicit Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getQuantiteCommandee() {
        return quantiteCommandee;
    }

    public void setQuantiteCommandee(Integer quantiteCommandee) {
        this.quantiteCommandee = quantiteCommandee;
    }

    public Double getPrixUnitaireTTC() {
        return prixUnitaireTTC;
    }

    public void setPrixUnitaireTTC(Double prixUnitaireTTC) {
        this.prixUnitaireTTC = prixUnitaireTTC;
    }

    public Double getSousTotalLigne() {
        return sousTotalLigne;
    }

    public void setSousTotalLigne(Double sousTotalLigne) {
        this.sousTotalLigne = sousTotalLigne;
    }

    public Produit getProduitCommande() {
        return produitCommande;
    }

    public void setProduitCommande(Produit produitCommande) {
        this.produitCommande = produitCommande;
    }

    public Commande getCommandeParente() {
        return commandeParente;
    }

    public void setCommandeParente(Commande commandeParente) {
        this.commandeParente = commandeParente;
    }

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

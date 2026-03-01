package com.publicity_platform.project.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

/**
 * Ligne d'un panier : un produit avec une quantité et son sous-total.
 */
@Entity
@Table(name = "lignes_panier")
public class LignePanier {

    public LignePanier() {
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quantite", nullable = false)
    private Integer quantite = 1;

    @Column(name = "sous_total")
    private Double sousTotal;

    // ─────────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────────

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "panier_id", nullable = false)
    private Panier panier;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_id", nullable = false)
    private Produit produit;

    // ─────────────────────────────────────────────
    // Calcul automatique du sous-total
    // ─────────────────────────────────────────────

    @PrePersist
    @PreUpdate
    protected void calculerSousTotal() {
        if (produit != null && produit.getPrixAfiche() != null && quantite != null) {
            this.sousTotal = produit.getPrixAfiche() * quantite;
        }
    }

    // ─────────────────────────────────────────────
    // Getters & Setters
    // ─────────────────────────────────────────────

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getQuantite() {
        return quantite;
    }

    public void setQuantite(Integer quantite) {
        this.quantite = quantite;
    }

    public Double getSousTotal() {
        return sousTotal;
    }

    public void setSousTotal(Double sousTotal) {
        this.sousTotal = sousTotal;
    }

    public Panier getPanier() {
        return panier;
    }

    public void setPanier(Panier panier) {
        this.panier = panier;
    }

    public Produit getProduit() {
        return produit;
    }

    public void setProduit(Produit produit) {
        this.produit = produit;
    }
}

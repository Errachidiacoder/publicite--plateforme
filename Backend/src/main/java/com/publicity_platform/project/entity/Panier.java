package com.publicity_platform.project.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Panier d'achat d'un utilisateur. Chaque utilisateur possède un seul panier
 * actif.
 */
@Entity
@Table(name = "paniers")
public class Panier {

    public Panier() {
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ─────────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────────

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false, unique = true)
    private Utilisateur utilisateur;

    /** Un panier contient plusieurs lignes */
    @JsonIgnore
    @OneToMany(mappedBy = "panier", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<LignePanier> lignes = new ArrayList<>();

    // ─────────────────────────────────────────────
    // Méthodes métier
    // ─────────────────────────────────────────────

    /**
     * Calcule le montant total du panier.
     */
    public Double calculerTotal() {
        if (lignes == null || lignes.isEmpty()) {
            return 0.0;
        }
        return lignes.stream()
                .mapToDouble(LignePanier::getSousTotal)
                .sum();
    }

    /**
     * Nombre d'articles dans le panier.
     */
    public int getNombreArticles() {
        if (lignes == null) {
            return 0;
        }
        return lignes.stream()
                .mapToInt(LignePanier::getQuantite)
                .sum();
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

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    public List<LignePanier> getLignes() {
        return lignes;
    }

    public void setLignes(List<LignePanier> lignes) {
        this.lignes = lignes;
    }
}

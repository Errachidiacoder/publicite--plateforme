package com.publicity_platform.project.entity;


import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Categorie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom_categorie", nullable = false)
    private String nomCategorie;

    @Column(name = "description_categorie", columnDefinition = "TEXT")
    private String descriptionCategorie;

    @Column(name = "url_image_couverture")
    private String urlImageCouverture;

    @Column(name = "icone_categorie")
    private String iconeCategorie;

    @Column(name = "categorie_active", nullable = false)
    @Builder.Default
    private Boolean categorieActive = true;

    // ─────────────────────────────────────────────
    // Auto-référence  1 Categorie contient 0..* SousCategories
    // ─────────────────────────────────────────────

    /** Catégorie parente (null = catégorie racine) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_parente_id")
    private Categorie categorieParente;

    /** 1 Categorie → 0..* sous-catégories (composition) */
    @OneToMany(mappedBy = "categorieParente",
            cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Categorie> sousCategories;

    // ─────────────────────────────────────────────
    // Relation inverse  1 Categorie ← 0..* Produits
    // ─────────────────────────────────────────────

    @OneToMany(mappedBy = "categorie", fetch = FetchType.LAZY)
    private List<Produit> produits;
}

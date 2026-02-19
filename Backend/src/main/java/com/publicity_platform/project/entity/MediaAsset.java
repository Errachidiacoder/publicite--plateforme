package com.publicity_platform.project.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "media_assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "url_stockage", nullable = false)
    private String urlStockage;

    /** JPG / PNG */
    @Column(name = "format_fichier")
    private String formatFichier;

    @Column(name = "taille_fichier_ko")
    private Long tailleFichierKo;

    /** true = image mise en avant dans la galerie */
    @Column(name = "image_principale", nullable = false)
    @Builder.Default
    private Boolean imagePrincipale = false;

    @Column(name = "ordre_affichage")
    private Integer ordreAffichage;

    @Column(name = "date_telechargement")
    private LocalDateTime dateTelechargement;

    // ─────────────────────────────────────────────
    // Relation  1..* MediaAsset → 1 Produit  (composition)
    // ─────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_id", nullable = false)
    private Produit produit;

    @PrePersist
    protected void onCreate() {
        this.dateTelechargement = LocalDateTime.now();
    }
}

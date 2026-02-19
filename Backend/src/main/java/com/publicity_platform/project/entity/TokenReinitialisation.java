package com.publicity_platform.project.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tokens_reinitialisation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenReinitialisation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** UUID unique envoyé par email */
    @Column(name = "valeur_token", nullable = false, unique = true)
    private String valeurToken;

    /** Expiration : 1 heure après création */
    @Column(name = "date_expiration", nullable = false)
    private LocalDateTime dateExpiration;

    @Column(name = "deja_utilise", nullable = false)
    @Builder.Default
    private Boolean dejaUtilise = false;

    // ─────────────────────────────────────────────
    // Relation  0..* TokenReinitialisation → 1 Utilisateur
    // ─────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    // ─────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────

    public boolean isExpire() {
        return LocalDateTime.now().isAfter(this.dateExpiration);
    }
}


package com.publicity_platform.project.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sujet_notification", nullable = false)
    private String sujetNotification;

    @Column(name = "corps_message", columnDefinition = "TEXT")
    private String corpsMessage;

    /** Ex : VALIDATION / REFUS / EXPIRATION */
    @Column(name = "type_evenement")
    private String typeEvenement;

    @Column(name = "notification_lue", nullable = false)
    @Builder.Default
    private Boolean notificationLue = false;

    @Column(name = "date_envoi")
    private LocalDateTime dateEnvoi;

    // ─────────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────────

    /** 0..* Notifications → 1 Utilisateur destinataire */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destinataire_id", nullable = false)
    private Utilisateur destinataire;

    /** 0..* Notifications ← 1 Produit source (optionnel) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_source_id")
    private Produit produitSource;

    @PrePersist
    protected void onCreate() {
        this.dateEnvoi = LocalDateTime.now();
    }
}

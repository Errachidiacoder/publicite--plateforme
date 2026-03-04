package com.publicity_platform.project.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    public Notification() {
    }

    public Notification(Long id, String sujetNotification, String corpsMessage, String typeEvenement,
            Boolean notificationLue, LocalDateTime dateEnvoi, Utilisateur destinataire, Anonce anonceSource,
            Long commandeId, String lienAction) {
        this.id = id;
        this.sujetNotification = sujetNotification;
        this.corpsMessage = corpsMessage;
        this.typeEvenement = typeEvenement;
        this.notificationLue = notificationLue;
        this.dateEnvoi = dateEnvoi;
        this.destinataire = destinataire;
        this.anonceSource = anonceSource;
        this.commandeId = commandeId;
        this.lienAction = lienAction;
    }

    public static NotificationBuilder builder() {
        return new NotificationBuilder();
    }

    public static class NotificationBuilder {
        private Long id;
        private String sujetNotification;
        private String corpsMessage;
        private String typeEvenement;
        private Boolean notificationLue = false;
        private LocalDateTime dateEnvoi;
        private Utilisateur destinataire;
        private Anonce anonceSource;
        private Long commandeId;
        private String lienAction;

        public NotificationBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public NotificationBuilder sujetNotification(String sujetNotification) {
            this.sujetNotification = sujetNotification;
            return this;
        }

        public NotificationBuilder corpsMessage(String corpsMessage) {
            this.corpsMessage = corpsMessage;
            return this;
        }

        public NotificationBuilder typeEvenement(String typeEvenement) {
            this.typeEvenement = typeEvenement;
            return this;
        }

        public NotificationBuilder notificationLue(Boolean notificationLue) {
            this.notificationLue = notificationLue;
            return this;
        }

        public NotificationBuilder dateEnvoi(LocalDateTime dateEnvoi) {
            this.dateEnvoi = dateEnvoi;
            return this;
        }

        public NotificationBuilder destinataire(Utilisateur destinataire) {
            this.destinataire = destinataire;
            return this;
        }

        public NotificationBuilder anonceSource(Anonce anonceSource) {
            this.anonceSource = anonceSource;
            return this;
        }

        public NotificationBuilder commandeId(Long commandeId) {
            this.commandeId = commandeId;
            return this;
        }

        public NotificationBuilder lienAction(String lienAction) {
            this.lienAction = lienAction;
            return this;
        }

        public Notification build() {
            return new Notification(id, sujetNotification, corpsMessage, typeEvenement, notificationLue, dateEnvoi,
                    destinataire, anonceSource, commandeId, lienAction);
        }
    }

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
    private Boolean notificationLue = false;

    @Column(name = "date_envoi")
    private LocalDateTime dateEnvoi;

    // ─────────────────────────────────────────────
    // Relations
    // ─────────────────────────────────────────────

    /** 0..* Notifications → 1 Utilisateur destinataire */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destinataire_id", nullable = false)
    private Utilisateur destinataire;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "anonce_source_id")
    private Anonce anonceSource;

    @Column(name = "commande_id")
    private Long commandeId;

    @Column(name = "lien_action")
    private String lienAction;

    // Explicit Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSujetNotification() {
        return sujetNotification;
    }

    public void setSujetNotification(String sujetNotification) {
        this.sujetNotification = sujetNotification;
    }

    public String getCorpsMessage() {
        return corpsMessage;
    }

    public void setCorpsMessage(String corpsMessage) {
        this.corpsMessage = corpsMessage;
    }

    public String getTypeEvenement() {
        return typeEvenement;
    }

    public void setTypeEvenement(String typeEvenement) {
        this.typeEvenement = typeEvenement;
    }

    public Boolean getNotificationLue() {
        return notificationLue;
    }

    public void setNotificationLue(Boolean notificationLue) {
        this.notificationLue = notificationLue;
    }

    public LocalDateTime getDateEnvoi() {
        return dateEnvoi;
    }

    public void setDateEnvoi(LocalDateTime dateEnvoi) {
        this.dateEnvoi = dateEnvoi;
    }

    public Utilisateur getDestinataire() {
        return destinataire;
    }

    public void setDestinataire(Utilisateur destinataire) {
        this.destinataire = destinataire;
    }

    public Anonce getAnonceSource() {
        return anonceSource;
    }

    public void setAnonceSource(Anonce anonceSource) {
        this.anonceSource = anonceSource;
    }

    public Long getCommandeId() {
        return commandeId;
    }

    public void setCommandeId(Long commandeId) {
        this.commandeId = commandeId;
    }

    public String getLienAction() {
        return lienAction;
    }

    public void setLienAction(String lienAction) {
        this.lienAction = lienAction;
    }

    @PrePersist
    protected void onCreate() {
        this.dateEnvoi = LocalDateTime.now();
    }
}
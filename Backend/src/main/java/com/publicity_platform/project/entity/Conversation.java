package com.publicity_platform.project.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversations")
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private ServiceOffre service;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_a_id", nullable = false)
    private Utilisateur userA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_b_id", nullable = false)
    private Utilisateur userB;

    @Column(name = "last_message", columnDefinition = "TEXT")
    private String lastMessage;

    @Column(name = "last_at")
    private LocalDateTime lastAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.lastAt = this.createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ServiceOffre getService() { return service; }
    public void setService(ServiceOffre service) { this.service = service; }
    public Utilisateur getUserA() { return userA; }
    public void setUserA(Utilisateur userA) { this.userA = userA; }
    public Utilisateur getUserB() { return userB; }
    public void setUserB(Utilisateur userB) { this.userB = userB; }
    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }
    public LocalDateTime getLastAt() { return lastAt; }
    public void setLastAt(LocalDateTime lastAt) { this.lastAt = lastAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

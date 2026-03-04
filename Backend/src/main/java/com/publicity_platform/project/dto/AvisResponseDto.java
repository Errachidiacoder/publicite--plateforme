package com.publicity_platform.project.dto;

import java.time.LocalDateTime;

/**
 * DTO for returning review data with user info to the frontend.
 */
public class AvisResponseDto {

    private Long id;
    private Integer note;
    private String commentaire;
    private LocalDateTime dateAvis;
    private String nomUtilisateur;
    private Long produitId;
    private Long commandeId;

    public AvisResponseDto() {
    }

    public AvisResponseDto(Long id, Integer note, String commentaire, LocalDateTime dateAvis,
            String nomUtilisateur, Long produitId, Long commandeId) {
        this.id = id;
        this.note = note;
        this.commentaire = commentaire;
        this.dateAvis = dateAvis;
        this.nomUtilisateur = nomUtilisateur;
        this.produitId = produitId;
        this.commandeId = commandeId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getNote() {
        return note;
    }

    public void setNote(Integer note) {
        this.note = note;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }

    public LocalDateTime getDateAvis() {
        return dateAvis;
    }

    public void setDateAvis(LocalDateTime dateAvis) {
        this.dateAvis = dateAvis;
    }

    public String getNomUtilisateur() {
        return nomUtilisateur;
    }

    public void setNomUtilisateur(String nomUtilisateur) {
        this.nomUtilisateur = nomUtilisateur;
    }

    public Long getProduitId() {
        return produitId;
    }

    public void setProduitId(Long produitId) {
        this.produitId = produitId;
    }

    public Long getCommandeId() {
        return commandeId;
    }

    public void setCommandeId(Long commandeId) {
        this.commandeId = commandeId;
    }
}

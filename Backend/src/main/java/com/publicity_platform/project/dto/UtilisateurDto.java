package com.publicity_platform.project.dto;

import java.time.LocalDateTime;

public class UtilisateurDto {
    private Long id;
    private String nomComplet;
    private String adresseEmail;
    private String numeroDeTelephone;
    private LocalDateTime dateInscription;

    public UtilisateurDto() {
    }

    public UtilisateurDto(Long id, String nomComplet, String adresseEmail, String numeroDeTelephone,
            LocalDateTime dateInscription) {
        this.id = id;
        this.nomComplet = nomComplet;
        this.adresseEmail = adresseEmail;
        this.numeroDeTelephone = numeroDeTelephone;
        this.dateInscription = dateInscription;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomComplet() {
        return nomComplet;
    }

    public void setNomComplet(String nomComplet) {
        this.nomComplet = nomComplet;
    }

    public String getAdresseEmail() {
        return adresseEmail;
    }

    public void setAdresseEmail(String adresseEmail) {
        this.adresseEmail = adresseEmail;
    }

    public String getNumeroDeTelephone() {
        return numeroDeTelephone;
    }

    public void setNumeroDeTelephone(String numeroDeTelephone) {
        this.numeroDeTelephone = numeroDeTelephone;
    }

    public LocalDateTime getDateInscription() {
        return dateInscription;
    }

    public void setDateInscription(LocalDateTime dateInscription) {
        this.dateInscription = dateInscription;
    }

    public static UtilisateurDto fromEntity(com.publicity_platform.project.entity.Utilisateur entity) {
        return new UtilisateurDto(
                entity.getId(),
                entity.getNomComplet(),
                entity.getAdresseEmail(),
                entity.getNumeroDeTelephone(),
                entity.getDateInscription());
    }
}

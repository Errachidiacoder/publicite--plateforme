package com.publicity_platform.project.dto;

import com.publicity_platform.project.enumm.MethodePaiement;
import com.publicity_platform.project.enumm.StatutCommande;

import java.time.LocalDateTime;
import java.util.List;

public class CommandeResponseDto {
    private Long id;
    private String referenceCommande;
    private StatutCommande statutCommande;
    private MethodePaiement methodePaiement;
    private Double montantTotal;
    private List<LigneCommandeDto> lignes;
    private String adresseLivraison;
    private String telephoneContact;
    private String notesLivraison;
    private LocalDateTime datePassageCommande;
    private int nombreArticles;

    public CommandeResponseDto() {
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReferenceCommande() {
        return referenceCommande;
    }

    public void setReferenceCommande(String referenceCommande) {
        this.referenceCommande = referenceCommande;
    }

    public StatutCommande getStatutCommande() {
        return statutCommande;
    }

    public void setStatutCommande(StatutCommande statutCommande) {
        this.statutCommande = statutCommande;
    }

    public MethodePaiement getMethodePaiement() {
        return methodePaiement;
    }

    public void setMethodePaiement(MethodePaiement methodePaiement) {
        this.methodePaiement = methodePaiement;
    }

    public Double getMontantTotal() {
        return montantTotal;
    }

    public void setMontantTotal(Double montantTotal) {
        this.montantTotal = montantTotal;
    }

    public List<LigneCommandeDto> getLignes() {
        return lignes;
    }

    public void setLignes(List<LigneCommandeDto> lignes) {
        this.lignes = lignes;
    }

    public String getAdresseLivraison() {
        return adresseLivraison;
    }

    public void setAdresseLivraison(String adresseLivraison) {
        this.adresseLivraison = adresseLivraison;
    }

    public String getTelephoneContact() {
        return telephoneContact;
    }

    public void setTelephoneContact(String telephoneContact) {
        this.telephoneContact = telephoneContact;
    }

    public String getNotesLivraison() {
        return notesLivraison;
    }

    public void setNotesLivraison(String notesLivraison) {
        this.notesLivraison = notesLivraison;
    }

    public LocalDateTime getDatePassageCommande() {
        return datePassageCommande;
    }

    public void setDatePassageCommande(LocalDateTime datePassageCommande) {
        this.datePassageCommande = datePassageCommande;
    }

    public int getNombreArticles() {
        return nombreArticles;
    }

    public void setNombreArticles(int nombreArticles) {
        this.nombreArticles = nombreArticles;
    }
}

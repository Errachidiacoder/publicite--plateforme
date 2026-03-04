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

    // ─── Order lifecycle fields ──────────────────

    private String annulationRaison;
    private String annulePar;
    private String numeroSuivi;
    private String societeLivraison;
    private LocalDateTime dateExpeditionReelle;
    private LocalDateTime dateLivraisonReelle;
    private Boolean paiementConfirme;

    public String getAnnulationRaison() {
        return annulationRaison;
    }

    public void setAnnulationRaison(String annulationRaison) {
        this.annulationRaison = annulationRaison;
    }

    public String getAnnulePar() {
        return annulePar;
    }

    public void setAnnulePar(String annulePar) {
        this.annulePar = annulePar;
    }

    public String getNumeroSuivi() {
        return numeroSuivi;
    }

    public void setNumeroSuivi(String numeroSuivi) {
        this.numeroSuivi = numeroSuivi;
    }

    public String getSocieteLivraison() {
        return societeLivraison;
    }

    public void setSocieteLivraison(String societeLivraison) {
        this.societeLivraison = societeLivraison;
    }

    public LocalDateTime getDateExpeditionReelle() {
        return dateExpeditionReelle;
    }

    public void setDateExpeditionReelle(LocalDateTime dateExpeditionReelle) {
        this.dateExpeditionReelle = dateExpeditionReelle;
    }

    public LocalDateTime getDateLivraisonReelle() {
        return dateLivraisonReelle;
    }

    public void setDateLivraisonReelle(LocalDateTime dateLivraisonReelle) {
        this.dateLivraisonReelle = dateLivraisonReelle;
    }

    public Boolean getPaiementConfirme() {
        return paiementConfirme;
    }

    public void setPaiementConfirme(Boolean paiementConfirme) {
        this.paiementConfirme = paiementConfirme;
    }

    private LocalDateTime datePaiement;

    public LocalDateTime getDatePaiement() {
        return datePaiement;
    }

    public void setDatePaiement(LocalDateTime datePaiement) {
        this.datePaiement = datePaiement;
    }
}

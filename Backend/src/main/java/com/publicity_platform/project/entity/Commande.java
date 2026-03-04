package com.publicity_platform.project.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.publicity_platform.project.enumm.MethodePaiement;
import com.publicity_platform.project.enumm.StatutCommande;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "commandes")
public class Commande {

        public Commande() {
        }

        public Commande(Long id, String referenceCommande, Double montantTotalTTC, StatutCommande statutCommande,
                        MethodePaiement methodePaiement, LocalDateTime datePassageCommande,
                        LocalDateTime dateLivraisonPrevue,
                        Utilisateur acheteur, List<LigneCommande> lignes, Paiement paiement) {
                this.id = id;
                this.referenceCommande = referenceCommande;
                this.montantTotalTTC = montantTotalTTC;
                this.statutCommande = statutCommande;
                this.methodePaiement = methodePaiement;
                this.datePassageCommande = datePassageCommande;
                this.dateLivraisonPrevue = dateLivraisonPrevue;
                this.acheteur = acheteur;
                this.lignes = lignes;
                this.paiement = paiement;
        }

        public static CommandeBuilder builder() {
                return new CommandeBuilder();
        }

        public static class CommandeBuilder {
                private Long id;
                private String referenceCommande;
                private Double montantTotalTTC;
                private StatutCommande statutCommande = StatutCommande.EN_ATTENTE_PAIEMENT;
                private MethodePaiement methodePaiement;
                private LocalDateTime datePassageCommande;
                private LocalDateTime dateLivraisonPrevue;
                private Utilisateur acheteur;
                private List<LigneCommande> lignes;
                private Paiement paiement;

                public CommandeBuilder id(Long id) {
                        this.id = id;
                        return this;
                }

                public CommandeBuilder referenceCommande(String referenceCommande) {
                        this.referenceCommande = referenceCommande;
                        return this;
                }

                public CommandeBuilder montantTotalTTC(Double montantTotalTTC) {
                        this.montantTotalTTC = montantTotalTTC;
                        return this;
                }

                public CommandeBuilder statutCommande(StatutCommande statutCommande) {
                        this.statutCommande = statutCommande;
                        return this;
                }

                public CommandeBuilder methodePaiement(MethodePaiement methodePaiement) {
                        this.methodePaiement = methodePaiement;
                        return this;
                }

                public CommandeBuilder datePassageCommande(LocalDateTime datePassageCommande) {
                        this.datePassageCommande = datePassageCommande;
                        return this;
                }

                public CommandeBuilder dateLivraisonPrevue(LocalDateTime dateLivraisonPrevue) {
                        this.dateLivraisonPrevue = dateLivraisonPrevue;
                        return this;
                }

                public CommandeBuilder acheteur(Utilisateur acheteur) {
                        this.acheteur = acheteur;
                        return this;
                }

                public CommandeBuilder lignes(List<LigneCommande> lignes) {
                        this.lignes = lignes;
                        return this;
                }

                public CommandeBuilder paiement(Paiement paiement) {
                        this.paiement = paiement;
                        return this;
                }

                public Commande build() {
                        return new Commande(id, referenceCommande, montantTotalTTC, statutCommande, methodePaiement,
                                        datePassageCommande, dateLivraisonPrevue, acheteur, lignes, paiement);
                }
        }

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(name = "reference_commande", nullable = false, unique = true)
        private String referenceCommande;

        @Column(name = "montant_total_ttc")
        private Double montantTotalTTC;

        @Enumerated(EnumType.STRING)
        @Column(name = "statut_commande", nullable = false)
        private StatutCommande statutCommande = StatutCommande.EN_ATTENTE_PAIEMENT;

        @Enumerated(EnumType.STRING)
        @Column(name = "methode_paiement")
        private MethodePaiement methodePaiement;

        @Column(name = "date_passage_commande")
        private LocalDateTime datePassageCommande;

        @Column(name = "date_livraison_prevue")
        private LocalDateTime dateLivraisonPrevue;

        // ─────────────────────────────────────────────
        // Relations
        // ─────────────────────────────────────────────

        /** 0..* Commandes → 1 Utilisateur (acheteur) */
        @JsonIgnore
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "acheteur_id", nullable = false)
        private Utilisateur acheteur;

        /** 1 Commande contient 1..* LigneCommande (composition) */
        @JsonIgnore
        @OneToMany(mappedBy = "commandeParente", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
        private List<LigneCommande> lignes;

        /** 1 Commande génère 1 Paiement (composition) */
        @JsonIgnore
        @OneToOne(mappedBy = "commande", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
        private Paiement paiement;

        // ─── Champs SouqBladi ───────────────────────

        @Column(name = "adresse_livraison", columnDefinition = "TEXT")
        private String adresseLivraison;

        @Column(name = "telephone_contact")
        private String telephoneContact;

        @Column(name = "notes_livraison", columnDefinition = "TEXT")
        private String notesLivraison;

        /** Le livreur assigné à cette commande */
        @JsonIgnore
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "livreur_id")
        private Utilisateur livreur;

        // ─── Order lifecycle fields ──────────────────

        @Column(name = "annulation_raison", columnDefinition = "TEXT")
        private String annulationRaison;

        @Column(name = "annule_par")
        private String annulePar; // CLIENT or VENDEUR

        @Column(name = "numero_suivi")
        private String numeroSuivi;

        @Column(name = "societe_livraison")
        private String societeLivraison;

        @Column(name = "date_expedition_reelle")
        private LocalDateTime dateExpeditionReelle;

        @Column(name = "date_livraison_reelle")
        private LocalDateTime dateLivraisonReelle;

        @Column(name = "paiement_confirme", nullable = false)
        private Boolean paiementConfirme = false;

        @Column(name = "date_paiement")
        private LocalDateTime datePaiement;

        // Explicit Getters and Setters
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

        public Double getMontantTotalTTC() {
                return montantTotalTTC;
        }

        public void setMontantTotalTTC(Double montantTotalTTC) {
                this.montantTotalTTC = montantTotalTTC;
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

        public LocalDateTime getDatePassageCommande() {
                return datePassageCommande;
        }

        public void setDatePassageCommande(LocalDateTime datePassageCommande) {
                this.datePassageCommande = datePassageCommande;
        }

        public LocalDateTime getDateLivraisonPrevue() {
                return dateLivraisonPrevue;
        }

        public void setDateLivraisonPrevue(LocalDateTime dateLivraisonPrevue) {
                this.dateLivraisonPrevue = dateLivraisonPrevue;
        }

        public Utilisateur getAcheteur() {
                return acheteur;
        }

        public void setAcheteur(Utilisateur acheteur) {
                this.acheteur = acheteur;
        }

        public List<LigneCommande> getLignes() {
                return lignes;
        }

        public void setLignes(List<LigneCommande> lignes) {
                this.lignes = lignes;
        }

        public Paiement getPaiement() {
                return paiement;
        }

        public void setPaiement(Paiement paiement) {
                this.paiement = paiement;
        }

        // ─────────────────────────────────────────────
        // Lifecycle & méthodes métier
        // ─────────────────────────────────────────────

        @PrePersist
        protected void onCreate() {
                this.datePassageCommande = LocalDateTime.now();
                this.referenceCommande = "CMD-" + System.currentTimeMillis();
        }

        /*
         * public Double calculerTotal() {
         * if (lignes == null) return 0.0;
         * return lignes.stream()
         * .mapToDouble(LigneCommande::getSousTotalLigne)
         * .sum();
         * }
         */

        // ─── Getters & Setters SouqBladi ───────────

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

        public Utilisateur getLivreur() {
                return livreur;
        }

        public void setLivreur(Utilisateur livreur) {
                this.livreur = livreur;
        }

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

        public LocalDateTime getDatePaiement() {
                return datePaiement;
        }

        public void setDatePaiement(LocalDateTime datePaiement) {
                this.datePaiement = datePaiement;
        }
}

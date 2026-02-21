package com.publicity_platform.project.entity;

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
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "acheteur_id", nullable = false)
        private Utilisateur acheteur;

        /** 1 Commande contient 1..* LigneCommande (composition) */
        @OneToMany(mappedBy = "commandeParente", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
        private List<LigneCommande> lignes;

        /** 1 Commande génère 1 Paiement (composition) */
        @OneToOne(mappedBy = "commande", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
        private Paiement paiement;

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
}

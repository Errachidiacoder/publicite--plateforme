package com.publicity_platform.project.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "utilisateurs", uniqueConstraints = @UniqueConstraint(columnNames = "adresse_email"))
public class Utilisateur implements UserDetails {

    public Utilisateur() {
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "nom_complet", nullable = false)
    private String nomComplet;

    @Email
    @NotBlank
    @Column(name = "adresse_email", nullable = false, unique = true)
    private String adresseEmail;

    @NotBlank
    @Column(name = "mot_de_passe_hache", nullable = false)
    private String motDePasseHache;

    @Column(name = "numero_de_telephone")
    private String numeroDeTelephone;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "utilisateurs_roles", joinColumns = @JoinColumn(name = "utilisateur_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private java.util.Set<Role> roles = new java.util.HashSet<>();

    @Column(name = "compte_actif", nullable = false)
    private Boolean compteActif = true;

    @Column(name = "email_verifie", nullable = false)
    private Boolean emailVerifie = false;

    @Column(name = "date_inscription", nullable = false, updatable = false)
    private LocalDateTime dateInscription;

    @JsonIgnore
    @OneToMany(mappedBy = "annonceur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Produit> produits;

    @JsonIgnore
    @OneToMany(mappedBy = "destinataire", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Notification> notifications;

    @JsonIgnore
    @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TokenReinitialisation> tokens;

    @JsonIgnore
    @OneToMany(mappedBy = "acheteur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Commande> commandes;

    @JsonIgnore
    @OneToMany(mappedBy = "adminResponsable", fetch = FetchType.LAZY)
    private List<HistoriqueValidation> historiquesEffectues;

    @JsonIgnore
    @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HistoriqueNavigation> historiquesNavigation;

    @PrePersist
    protected void onCreate() {
        this.dateInscription = LocalDateTime.now();
    }

    public static UtilisateurBuilder builder() {
        return new UtilisateurBuilder();
    }

    public static class UtilisateurBuilder {
        private String nomComplet;
        private String adresseEmail;
        private String motDePasseHache;
        private String numeroDeTelephone;
        private java.util.Set<Role> roles = new java.util.HashSet<>();
        private Boolean compteActif = true;
        private Boolean emailVerifie = false;

        public UtilisateurBuilder nomComplet(String nomComplet) {
            this.nomComplet = nomComplet;
            return this;
        }

        public UtilisateurBuilder adresseEmail(String adresseEmail) {
            this.adresseEmail = adresseEmail;
            return this;
        }

        public UtilisateurBuilder motDePasseHache(String motDePasseHache) {
            this.motDePasseHache = motDePasseHache;
            return this;
        }

        public UtilisateurBuilder numeroDeTelephone(String numeroDeTelephone) {
            this.numeroDeTelephone = numeroDeTelephone;
            return this;
        }

        public UtilisateurBuilder roles(java.util.Set<Role> roles) {
            this.roles = roles;
            return this;
        }

        public UtilisateurBuilder compteActif(Boolean compteActif) {
            this.compteActif = compteActif;
            return this;
        }

        public UtilisateurBuilder emailVerifie(Boolean emailVerifie) {
            this.emailVerifie = emailVerifie;
            return this;
        }

        public Utilisateur build() {
            Utilisateur user = new Utilisateur();
            user.setNomComplet(nomComplet);
            user.setAdresseEmail(adresseEmail);
            user.setMotDePasseHache(motDePasseHache);
            user.setNumeroDeTelephone(numeroDeTelephone);
            user.setRoles(roles);
            user.setCompteActif(compteActif);
            user.setEmailVerifie(emailVerifie);
            return user;
        }
    }

    // Explicit Getters and Setters
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

    public String getMotDePasseHache() {
        return motDePasseHache;
    }

    public void setMotDePasseHache(String motDePasseHache) {
        this.motDePasseHache = motDePasseHache;
    }

    public String getNumeroDeTelephone() {
        return numeroDeTelephone;
    }

    public void setNumeroDeTelephone(String numeroDeTelephone) {
        this.numeroDeTelephone = numeroDeTelephone;
    }

    public java.util.Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(java.util.Set<Role> roles) {
        this.roles = roles;
    }

    public Boolean getCompteActif() {
        return compteActif;
    }

    public void setCompteActif(Boolean compteActif) {
        this.compteActif = compteActif;
    }

    public Boolean getEmailVerifie() {
        return emailVerifie;
    }

    public void setEmailVerifie(Boolean emailVerifie) {
        this.emailVerifie = emailVerifie;
    }

    public LocalDateTime getDateInscription() {
        return dateInscription;
    }

    public void setDateInscription(LocalDateTime dateInscription) {
        this.dateInscription = dateInscription;
    }

    public List<Produit> getProduits() {
        return produits;
    }

    public void setProduits(List<Produit> produits) {
        this.produits = produits;
    }

    public List<Notification> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<Notification> notifications) {
        this.notifications = notifications;
    }

    public List<Commande> getCommandes() {
        return commandes;
    }

    public void setCommandes(List<Commande> commandes) {
        this.commandes = commandes;
    }

    public List<HistoriqueValidation> getHistoriquesEffectues() {
        return historiquesEffectues;
    }

    public void setHistoriquesEffectues(List<HistoriqueValidation> historiquesEffectues) {
        this.historiquesEffectues = historiquesEffectues;
    }

    public List<TokenReinitialisation> getTokens() {
        return tokens;
    }

    public void setTokens(List<TokenReinitialisation> tokens) {
        this.tokens = tokens;
    }

    public List<HistoriqueNavigation> getHistoriquesNavigation() {
        return historiquesNavigation;
    }

    public void setHistoriquesNavigation(List<HistoriqueNavigation> historiquesNavigation) {
        this.historiquesNavigation = historiquesNavigation;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public String getPassword() {
        return motDePasseHache;
    }

    @Override
    public String getUsername() {
        return adresseEmail;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return compteActif;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return compteActif;
    }
}

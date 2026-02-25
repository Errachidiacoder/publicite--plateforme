package com.publicity_platform.project.dto;

import com.publicity_platform.project.enumm.Disponibilite;
import com.publicity_platform.project.enumm.StatutValidation;
import com.publicity_platform.project.enumm.TypeAnnonce;
import com.publicity_platform.project.enumm.TypePrix;

import java.time.LocalDateTime;

public class ProduitDto {
    private Long id;
    private String titreProduit;
    private String descriptionDetaillee;
    private TypeAnnonce typeAnnonce;
    private Double prixAfiche;
    private TypePrix typePrix;
    private Disponibilite disponibilite;
    private StatutValidation statutValidation;
    private LocalDateTime dateSoumission;
    private String villeLocalisation;
    private String imageUrl;
    private String motifRefusAdmin;
    private UtilisateurDto annonceur;
    private CategorieDto categorie;
    private Long compteurVues;

    public ProduitDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitreProduit() {
        return titreProduit;
    }

    public void setTitreProduit(String titreProduit) {
        this.titreProduit = titreProduit;
    }

    public String getDescriptionDetaillee() {
        return descriptionDetaillee;
    }

    public void setDescriptionDetaillee(String descriptionDetaillee) {
        this.descriptionDetaillee = descriptionDetaillee;
    }

    public TypeAnnonce getTypeAnnonce() {
        return typeAnnonce;
    }

    public void setTypeAnnonce(TypeAnnonce typeAnnonce) {
        this.typeAnnonce = typeAnnonce;
    }

    public Double getPrixAfiche() {
        return prixAfiche;
    }

    public void setPrixAfiche(Double prixAfiche) {
        this.prixAfiche = prixAfiche;
    }

    public TypePrix getTypePrix() {
        return typePrix;
    }

    public void setTypePrix(TypePrix typePrix) {
        this.typePrix = typePrix;
    }

    public Disponibilite getDisponibilite() {
        return disponibilite;
    }

    public void setDisponibilite(Disponibilite disponibilite) {
        this.disponibilite = disponibilite;
    }

    public StatutValidation getStatutValidation() {
        return statutValidation;
    }

    public void setStatutValidation(StatutValidation statutValidation) {
        this.statutValidation = statutValidation;
    }

    public LocalDateTime getDateSoumission() {
        return dateSoumission;
    }

    public void setDateSoumission(LocalDateTime dateSoumission) {
        this.dateSoumission = dateSoumission;
    }

    public String getVilleLocalisation() {
        return villeLocalisation;
    }

    public void setVilleLocalisation(String villeLocalisation) {
        this.villeLocalisation = villeLocalisation;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getMotifRefusAdmin() {
        return motifRefusAdmin;
    }

    public void setMotifRefusAdmin(String motifRefusAdmin) {
        this.motifRefusAdmin = motifRefusAdmin;
    }

    public UtilisateurDto getAnnonceur() {
        return annonceur;
    }

    public void setAnnonceur(UtilisateurDto annonceur) {
        this.annonceur = annonceur;
    }

    public CategorieDto getCategorie() {
        return categorie;
    }

    public void setCategorie(CategorieDto categorie) {
        this.categorie = categorie;
    }

    public Long getCompteurVues() {
        return compteurVues;
    }

    public void setCompteurVues(Long compteurVues) {
        this.compteurVues = compteurVues;
    }

    public static ProduitDto fromEntity(com.publicity_platform.project.entity.Produit entity) {
        if (entity == null)
            return null;
        ProduitDto dto = new ProduitDto();
        dto.setId(entity.getId());
        dto.setTitreProduit(entity.getTitreProduit());
        dto.setDescriptionDetaillee(entity.getDescriptionDetaillee());
        dto.setTypeAnnonce(entity.getTypeAnnonce());
        dto.setPrixAfiche(entity.getPrixAfiche());
        dto.setTypePrix(entity.getTypePrix());
        dto.setDisponibilite(entity.getDisponibilite());
        dto.setStatutValidation(entity.getStatutValidation());
        dto.setDateSoumission(entity.getDateSoumission());
        dto.setVilleLocalisation(entity.getVilleLocalisation());
        dto.setImageUrl(entity.getImageUrl());
        dto.setMotifRefusAdmin(entity.getMotifRefusAdmin());
        dto.setCompteurVues(entity.getCompteurVues() != null ? entity.getCompteurVues() : 0L);

        if (entity.getAnnonceur() != null) {
            dto.setAnnonceur(UtilisateurDto.fromEntity(entity.getAnnonceur()));
        }

        if (entity.getCategorie() != null) {
            dto.setCategorie(CategorieDto.fromEntity(entity.getCategorie()));
        }

        return dto;
    }
}

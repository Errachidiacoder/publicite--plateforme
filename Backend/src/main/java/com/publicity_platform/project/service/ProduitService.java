package com.publicity_platform.project.service;

import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.dto.ProduitDto;
import com.publicity_platform.project.repository.ProduitRepository;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProduitService {

    private final ProduitRepository repository;

    public ProduitService(ProduitRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ProduitDto> getProductsByAnnonceur(@NonNull Long annonceurId) {
        return repository.findByAnnonceurId(annonceurId).stream()
                .map(ProduitDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProduitDto> getAllProducts() {
        return repository.findAll().stream()
                .map(ProduitDto::fromEntity)
                .toList();
    }

    @Transactional
    public Produit createProduct(Produit produit) {
        return repository.save(produit);
    }

    @Transactional
    public ProduitDto createProductDto(Produit produit) {
        return ProduitDto.fromEntity(createProduct(produit));
    }

    @Transactional(readOnly = true)
    public ProduitDto getProductDtoById(@NonNull Long id) {
        return ProduitDto.fromEntity(getProductById(id));
    }

    @Transactional
    public ProduitDto updateProduct(@NonNull Long id, Produit produit) {
        Produit existing = getProductById(id);
        existing.setTitreProduit(produit.getTitreProduit());
        existing.setDescriptionDetaillee(produit.getDescriptionDetaillee());
        existing.setPrixAfiche(produit.getPrixAfiche());
        existing.setTypePrix(produit.getTypePrix());
        existing.setVilleLocalisation(produit.getVilleLocalisation());
        existing.setCategorie(produit.getCategorie());
        existing.setDisponibilite(produit.getDisponibilite());
        existing.setTypeAnnonce(produit.getTypeAnnonce());
        if (produit.getImageUrl() != null) {
            existing.setImageUrl(produit.getImageUrl());
        }
        Produit saved = repository.save(existing);
        return ProduitDto.fromEntity(saved);
    }

    public void deleteProduct(@NonNull Long id) {
        repository.deleteById(id);
    }

    public Produit getProductById(@NonNull Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Produit non trouvé"));
    }
}

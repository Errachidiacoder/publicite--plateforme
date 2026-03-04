package com.publicity_platform.project.service;

import com.publicity_platform.project.dto.*;
import com.publicity_platform.project.entity.Boutique;
import com.publicity_platform.project.entity.Categorie;
import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.entity.ProductImage;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.enumm.DeliveryOption;
import com.publicity_platform.project.enumm.StatutBoutique;
import com.publicity_platform.project.enumm.StatutProduit;
import com.publicity_platform.project.enumm.TypeActivite;
import com.publicity_platform.project.enumm.TypeAnnonce;
import com.publicity_platform.project.repository.BoutiqueRepository;
import com.publicity_platform.project.repository.CategorieRepository;
import com.publicity_platform.project.repository.ProduitRepository;
import com.publicity_platform.project.repository.ProduitSpecification;
import com.publicity_platform.project.repository.UtilisateurRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProduitService {

    private static final Logger log = LoggerFactory.getLogger(ProduitService.class);

    private final ProduitRepository repository;
    private final CategorieRepository categorieRepository;
    private final BoutiqueRepository boutiqueRepository;
    private final UtilisateurRepository utilisateurRepository;

    public ProduitService(ProduitRepository repository,
            CategorieRepository categorieRepository,
            BoutiqueRepository boutiqueRepository,
            UtilisateurRepository utilisateurRepository) {
        this.repository = repository;
        this.categorieRepository = categorieRepository;
        this.boutiqueRepository = boutiqueRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    // ─── Legacy methods (kept for backward compatibility with existing code) ───

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

    // ─── New marketplace methods ───

    @Transactional
    public ProduitResponseDto createMarketProduct(ProduitRequestDto dto, Long merchantId) {
        Boutique boutique = boutiqueRepository.findByProprietaireId(merchantId)
                .orElseGet(() -> autoCreateBoutique(merchantId));

        Categorie categorie = categorieRepository.findById(dto.getCategorieId())
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

        Produit produit = new Produit();
        produit.setTitreProduit(dto.getNom());
        produit.setDescriptionCourte(dto.getDescriptionCourte());
        produit.setDescriptionDetaillee(dto.getDescriptionDetaillee());
        produit.setPrix(dto.getPrix());
        produit.setPrixPromo(dto.getPrixPromo());
        produit.setQuantiteStock(dto.getQuantiteStock());
        produit.setCategorie(categorie);
        produit.setBoutique(boutique);
        produit.setTags(dto.getTags());
        produit.setPoidsProduit(dto.getPoidsProduit());
        produit.setDimensions(dto.getDimensions());

        // Auto-generate SKU if not provided
        if (dto.getSku() != null && !dto.getSku().isBlank()) {
            produit.setSku(dto.getSku());
        } else {
            String prefix = boutique.getTypeActivite().name().substring(0,
                    Math.min(3, boutique.getTypeActivite().name().length()));
            produit.setSku(prefix + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        // Delivery option
        if (dto.getDeliveryOption() != null && !dto.getDeliveryOption().isBlank()) {
            produit.setDeliveryOption(DeliveryOption.valueOf(dto.getDeliveryOption()));
        }

        // Status
        if (dto.getStatutProduit() != null && !dto.getStatutProduit().isBlank()) {
            produit.setStatutProduit(StatutProduit.valueOf(dto.getStatutProduit()));
        } else {
            produit.setStatutProduit(StatutProduit.DRAFT);
        }

        // Set annonceur (required by existing schema)
        produit.setAnnonceur(boutique.getProprietaire());

        // Set required legacy fields with defaults
        produit.setTypeAnnonce(TypeAnnonce.PRODUIT_PHYSIQUE);
        if (dto.getPrix() != null) {
            produit.setPrixAfiche(dto.getPrix().doubleValue());
        }

        Produit saved = repository.save(produit);
        log.info("Produit créé: {} (SKU: {}) par le marchand {}", saved.getTitreProduit(), saved.getSku(), merchantId);
        return toResponseDto(saved);
    }

    @Transactional
    public ProduitResponseDto updateMarketProduct(Long id, ProduitRequestDto dto, Long merchantId) {
        Produit existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        validateOwnership(existing, merchantId);

        Categorie categorie = categorieRepository.findById(dto.getCategorieId())
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

        existing.setTitreProduit(dto.getNom());
        existing.setDescriptionCourte(dto.getDescriptionCourte());
        existing.setDescriptionDetaillee(dto.getDescriptionDetaillee());
        existing.setPrix(dto.getPrix());
        existing.setPrixPromo(dto.getPrixPromo());
        existing.setQuantiteStock(dto.getQuantiteStock());
        existing.setCategorie(categorie);
        existing.setTags(dto.getTags());
        existing.setPoidsProduit(dto.getPoidsProduit());
        existing.setDimensions(dto.getDimensions());

        if (dto.getSku() != null && !dto.getSku().isBlank()) {
            existing.setSku(dto.getSku());
        }

        if (dto.getDeliveryOption() != null && !dto.getDeliveryOption().isBlank()) {
            existing.setDeliveryOption(DeliveryOption.valueOf(dto.getDeliveryOption()));
        }

        // Sync legacy prix field
        if (dto.getPrix() != null) {
            existing.setPrixAfiche(dto.getPrix().doubleValue());
        }

        Produit saved = repository.save(existing);
        log.info("Produit mis à jour: {} (ID: {})", saved.getTitreProduit(), saved.getId());
        return toResponseDto(saved);
    }

    @Transactional
    public void updateStatut(Long id, StatutProduit newStatut, Long merchantId) {
        Produit produit = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        validateOwnership(produit, merchantId);

        StatutProduit current = produit.getStatutProduit();

        // Validate transitions
        boolean validTransition;
        if (current == StatutProduit.DRAFT) {
            validTransition = newStatut == StatutProduit.ACTIVE;
        } else if (current == StatutProduit.ACTIVE) {
            validTransition = newStatut == StatutProduit.ARCHIVED;
        } else if (current == StatutProduit.ARCHIVED) {
            validTransition = newStatut == StatutProduit.ACTIVE;
        } else if (current == StatutProduit.OUT_OF_STOCK) {
            validTransition = newStatut == StatutProduit.ACTIVE || newStatut == StatutProduit.ARCHIVED;
        } else {
            validTransition = false;
        }

        if (!validTransition) {
            throw new RuntimeException("Transition de statut invalide: " + current + " → " + newStatut);
        }

        // Verify images exist before publishing
        if (newStatut == StatutProduit.ACTIVE && (produit.getImages() == null || produit.getImages().isEmpty())) {
            throw new RuntimeException("Au moins une image est requise avant de publier le produit");
        }

        produit.setStatutProduit(newStatut);
        repository.save(produit);
        log.info("Statut du produit {} changé: {} → {}", id, current, newStatut);
    }

    @Transactional(readOnly = true)
    public Page<ProduitResponseDto> searchProducts(ProductFilterRequest filter) {
        Sort sort = resolveSort(filter.getSort());
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        // Resolve category IDs (including subcategories)
        List<Long> categoryIds = null;
        if (filter.getCategorieId() != null) {
            categoryIds = collectCategoryIds(filter.getCategorieId());
        }

        TypeActivite merchantType = null;
        if (filter.getMerchantType() != null && !filter.getMerchantType().isBlank()) {
            try {
                merchantType = TypeActivite.valueOf(filter.getMerchantType());
            } catch (IllegalArgumentException ignored) {
                // Ignore invalid merchant type
            }
        }

        Page<Produit> page = repository.findAll(
                ProduitSpecification.withFilters(
                        filter.getKeyword(),
                        categoryIds,
                        filter.getMinPrice(),
                        filter.getMaxPrice(),
                        merchantType,
                        StatutProduit.ACTIVE),
                pageable);

        return page.map(this::toResponseDto);
    }

    @Transactional(readOnly = true)
    public Page<ProduitMerchantDto> getMerchantProducts(Long merchantId, Pageable pageable) {
        Optional<Boutique> boutiqueOpt = boutiqueRepository.findByProprietaireId(merchantId);
        if (boutiqueOpt.isEmpty()) {
            return Page.empty(pageable);
        }
        Boutique boutique = boutiqueOpt.get();
        return repository.findByBoutiqueId(boutique.getId(), pageable)
                .map(this::toMerchantDto);
    }

    @Transactional(readOnly = true)
    public ProduitResponseDto getMarketProductById(Long id) {
        Produit produit = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        return toResponseDto(produit);
    }

    @Transactional
    public void trackView(Long produitId) {
        repository.incrementCompteurVues(produitId);
    }

    @Transactional(readOnly = true)
    public List<ProduitResponseDto> getFeaturedProducts() {
        return repository.findTop8ByStatutProduitOrderByNombreVentesDesc(StatutProduit.ACTIVE)
                .stream()
                .map(this::toResponseDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<ProduitResponseDto> getProductsByCategory(String slug, Pageable pageable) {
        Categorie categorie = categorieRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

        List<Long> categoryIds = collectCategoryIds(categorie.getId());
        return repository.findByCategorieIdInAndStatutProduit(categoryIds, StatutProduit.ACTIVE, pageable)
                .map(this::toResponseDto);
    }

    // ─── Helper methods ───

    /**
     * Quick-fix: auto-create a default boutique for merchants who don't have one.
     * Derives TypeActivite from the merchant's role.
     * TODO: Replace with a proper boutique registration + admin approval workflow.
     */
    private Boutique autoCreateBoutique(Long merchantId) {
        Utilisateur merchant = utilisateurRepository.findById(merchantId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Boutique boutique = new Boutique();
        boutique.setNomBoutique("Boutique de " + merchant.getNomComplet());
        boutique.setTypeActivite(resolveTypeActivite(merchant));
        boutique.setStatutBoutique(StatutBoutique.ACTIVE);
        boutique.setProprietaire(merchant);
        boutique.setDescriptionBoutique("Boutique auto-créée");

        Boutique saved = boutiqueRepository.save(boutique);
        log.info("Boutique auto-créée pour le marchand {} (type: {}, id: {})",
                merchant.getNomComplet(), saved.getTypeActivite(), saved.getId());
        return saved;
    }

    /**
     * Map the merchant's role to a TypeActivite.
     */
    private TypeActivite resolveTypeActivite(Utilisateur merchant) {
        if (merchant.getRoles() != null) {
            for (var role : merchant.getRoles()) {
                String name = role.getName().replace("ROLE_", "");
                try {
                    return TypeActivite.valueOf(name);
                } catch (IllegalArgumentException ignored) {
                    // Not a merchant-type role, skip
                }
            }
        }
        return TypeActivite.AUTO_ENTREPRENEUR; // fallback
    }

    private List<Long> collectCategoryIds(Long parentId) {
        List<Long> ids = new ArrayList<>();
        ids.add(parentId);
        Categorie parent = categorieRepository.findById(parentId).orElse(null);
        if (parent != null && parent.getSousCategories() != null) {
            for (Categorie sub : parent.getSousCategories()) {
                ids.addAll(collectCategoryIds(sub.getId()));
            }
        }
        return ids;
    }

    private Sort resolveSort(String sortKey) {
        if (sortKey == null)
            return Sort.by(Sort.Direction.DESC, "createdAt");
        if ("price_asc".equals(sortKey)) {
            return Sort.by(Sort.Direction.ASC, "prix");
        } else if ("price_desc".equals(sortKey)) {
            return Sort.by(Sort.Direction.DESC, "prix");
        } else if ("rating".equals(sortKey)) {
            return Sort.by(Sort.Direction.DESC, "noteMoyenne");
        } else if ("best_selling".equals(sortKey)) {
            return Sort.by(Sort.Direction.DESC, "nombreVentes");
        } else {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
    }

    private void validateOwnership(Produit produit, Long merchantId) {
        if (produit.getAnnonceur() == null || !produit.getAnnonceur().getId().equals(merchantId)) {
            throw new RuntimeException("Vous n'avez pas la permission de modifier ce produit");
        }
    }

    public ProduitResponseDto toResponseDto(Produit p) {
        ProduitResponseDto dto = new ProduitResponseDto();
        dto.setId(p.getId());
        dto.setNom(p.getTitreProduit());
        dto.setDescriptionCourte(p.getDescriptionCourte());
        dto.setDescriptionDetaillee(p.getDescriptionDetaillee());
        dto.setPrix(p.getPrix());
        dto.setPrixPromo(p.getPrixPromo());
        dto.setQuantiteStock(p.getQuantiteStock());
        dto.setStatutProduit(p.getStatutProduit() != null ? p.getStatutProduit().name() : "DRAFT");
        dto.setTags(p.getTags());
        dto.setDeliveryOption(p.getDeliveryOption() != null ? p.getDeliveryOption().name() : null);
        dto.setNoteMoyenne(p.getNoteMoyenne());
        dto.setNombreAvis(p.getNombreAvis());
        dto.setCompteurVues(p.getCompteurVues());
        dto.setNombreVentes(p.getNombreVentes());
        dto.setCreatedAt(p.getCreatedAt());

        if (p.getCategorie() != null) {
            dto.setCategorieId(p.getCategorie().getId());
            dto.setCategorieNom(p.getCategorie().getNomCategorie());
            dto.setCategorieSlug(p.getCategorie().getSlug());
        }

        if (p.getBoutique() != null) {
            dto.setBoutiqueId(p.getBoutique().getId());
            dto.setBoutiqueNom(p.getBoutique().getNomBoutique());
            dto.setTypeActivite(
                    p.getBoutique().getTypeActivite() != null ? p.getBoutique().getTypeActivite().name() : null);
        }

        // Images
        if (p.getImages() != null && !p.getImages().isEmpty()) {
            dto.setImages(p.getImages().stream().map(ProductImageService::toDto).toList());
            p.getImages().stream()
                    .filter(ProductImage::getIsPrimary)
                    .findFirst()
                    .ifPresent(img -> dto.setPrimaryImageUrl(img.getUrl()));

            // Fallback to first image if no primary
            if (dto.getPrimaryImageUrl() == null) {
                dto.setPrimaryImageUrl(p.getImages().get(0).getUrl());
            }
        } else if (p.getImageUrl() != null) {
            dto.setPrimaryImageUrl(p.getImageUrl());
        }

        return dto;
    }

    private ProduitMerchantDto toMerchantDto(Produit p) {
        ProduitMerchantDto dto = new ProduitMerchantDto();
        dto.setId(p.getId());
        dto.setNom(p.getTitreProduit());
        dto.setDescriptionCourte(p.getDescriptionCourte());
        dto.setDescriptionDetaillee(p.getDescriptionDetaillee());
        dto.setPrix(p.getPrix());
        dto.setPrixPromo(p.getPrixPromo());
        dto.setQuantiteStock(p.getQuantiteStock());
        dto.setStatutProduit(p.getStatutProduit() != null ? p.getStatutProduit().name() : "DRAFT");
        dto.setTags(p.getTags());
        dto.setDeliveryOption(p.getDeliveryOption() != null ? p.getDeliveryOption().name() : null);
        dto.setNoteMoyenne(p.getNoteMoyenne());
        dto.setNombreAvis(p.getNombreAvis());
        dto.setCompteurVues(p.getCompteurVues());
        dto.setNombreVentes(p.getNombreVentes());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setSku(p.getSku());
        dto.setPoidsProduit(p.getPoidsProduit());
        dto.setDimensions(p.getDimensions());

        if (p.getCategorie() != null) {
            dto.setCategorieId(p.getCategorie().getId());
            dto.setCategorieNom(p.getCategorie().getNomCategorie());
            dto.setCategorieSlug(p.getCategorie().getSlug());
        }

        if (p.getBoutique() != null) {
            dto.setBoutiqueId(p.getBoutique().getId());
            dto.setBoutiqueNom(p.getBoutique().getNomBoutique());
            dto.setTypeActivite(
                    p.getBoutique().getTypeActivite() != null ? p.getBoutique().getTypeActivite().name() : null);
        }

        if (p.getImages() != null && !p.getImages().isEmpty()) {
            dto.setImages(p.getImages().stream().map(ProductImageService::toDto).toList());
            p.getImages().stream()
                    .filter(ProductImage::getIsPrimary)
                    .findFirst()
                    .ifPresent(img -> dto.setPrimaryImageUrl(img.getUrl()));
            if (dto.getPrimaryImageUrl() == null) {
                dto.setPrimaryImageUrl(p.getImages().get(0).getUrl());
            }
        } else if (p.getImageUrl() != null) {
            dto.setPrimaryImageUrl(p.getImageUrl());
        }

        return dto;
    }
}

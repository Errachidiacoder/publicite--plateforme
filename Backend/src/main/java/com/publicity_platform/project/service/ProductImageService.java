package com.publicity_platform.project.service;

import com.publicity_platform.project.dto.ProductImageDto;
import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.entity.ProductImage;
import com.publicity_platform.project.repository.ProductImageRepository;
import com.publicity_platform.project.repository.ProduitRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductImageService {

    private static final Logger log = LoggerFactory.getLogger(ProductImageService.class);

    private final ProductImageRepository imageRepository;
    private final ProduitRepository produitRepository;
    private final FileStorageService fileStorageService;

    public ProductImageService(ProductImageRepository imageRepository,
            ProduitRepository produitRepository,
            FileStorageService fileStorageService) {
        this.imageRepository = imageRepository;
        this.produitRepository = produitRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public List<ProductImageDto> uploadImages(Long produitId, List<MultipartFile> files, Long merchantId) {
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        validateOwnership(produit, merchantId);

        if (files.size() > 8) {
            throw new IllegalArgumentException("Maximum 8 images par produit");
        }

        List<ProductImage> existingImages = imageRepository.findByProduitIdOrderByDisplayOrderAsc(produitId);
        boolean hasPrimary = existingImages.stream().anyMatch(ProductImage::getIsPrimary);
        int nextOrder = existingImages.size();

        List<ProductImageDto> result = new ArrayList<>();

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            String url = fileStorageService.storeFile(file, "products");

            ProductImage image = new ProductImage();
            image.setProduit(produit);
            image.setUrl(url);
            image.setAltText(produit.getTitreProduit());
            image.setDisplayOrder(nextOrder + i);
            image.setIsPrimary(!hasPrimary && i == 0);

            if (!hasPrimary && i == 0) {
                hasPrimary = true;
            }

            ProductImage saved = imageRepository.save(image);
            result.add(toDto(saved));
        }

        log.info("Uploaded {} images pour le produit {}", files.size(), produitId);
        return result;
    }

    @Transactional
    public void setPrimary(Long produitId, Long imageId, Long merchantId) {
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        validateOwnership(produit, merchantId);

        List<ProductImage> images = imageRepository.findByProduitIdOrderByDisplayOrderAsc(produitId);
        for (ProductImage img : images) {
            img.setIsPrimary(img.getId().equals(imageId));
            imageRepository.save(img);
        }
        log.info("Image {} définie comme principale pour le produit {}", imageId, produitId);
    }

    @Transactional
    public void deleteImage(Long produitId, Long imageId, Long merchantId) {
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        validateOwnership(produit, merchantId);

        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image non trouvée"));

        if (!image.getProduit().getId().equals(produitId)) {
            throw new RuntimeException("Cette image n'appartient pas à ce produit");
        }

        fileStorageService.deleteFile(image.getUrl());
        imageRepository.delete(image);
        log.info("Image {} supprimée du produit {}", imageId, produitId);
    }

    private void validateOwnership(Produit produit, Long merchantId) {
        if (produit.getAnnonceur() == null || !produit.getAnnonceur().getId().equals(merchantId)) {
            throw new RuntimeException("Vous n'avez pas la permission de modifier ce produit");
        }
    }

    public static ProductImageDto toDto(ProductImage image) {
        return new ProductImageDto(
                image.getId(),
                image.getUrl(),
                image.getAltText(),
                image.getIsPrimary(),
                image.getDisplayOrder());
    }
}

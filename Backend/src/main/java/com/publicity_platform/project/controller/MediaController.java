package com.publicity_platform.project.controller;

import com.publicity_platform.project.entity.MediaAsset;
import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.repository.MediaAssetRepository;
import com.publicity_platform.project.repository.ProduitRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/media")
public class MediaController {

    private final MediaAssetRepository mediaRepo;
    private final ProduitRepository produitRepo;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public MediaController(MediaAssetRepository mediaRepo, ProduitRepository produitRepo) {
        this.mediaRepo = mediaRepo;
        this.produitRepo = produitRepo;
    }

    /**
     * Upload multiple media files for a product.
     * POST /api/v1/media/upload/{produitId}
     */
    @PostMapping("/upload/{produitId}")
    public ResponseEntity<List<MediaAsset>> uploadMedia(
            @PathVariable Long produitId,
            @RequestParam("files") MultipartFile[] files) throws IOException {

        Produit produit = produitRepo.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé: " + produitId));

        // Resolve to absolute path - transferTo(File) fails with relative paths in
        // Tomcat
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize()
                .resolve("produits").resolve(produitId.toString());
        Files.createDirectories(uploadPath);

        List<MediaAsset> savedMedias = new ArrayList<>();
        int existingCount = mediaRepo.findByProduitIdOrderByOrdreAffichageAsc(produitId).size();

        for (int i = 0; i < files.length; i++) {
            MultipartFile file = files[i];
            if (file.isEmpty())
                continue;

            // Generate unique filename
            String originalName = file.getOriginalFilename();
            String extension = originalName != null && originalName.contains(".")
                    ? originalName.substring(originalName.lastIndexOf('.'))
                    : "";
            String fileName = UUID.randomUUID().toString() + extension;

            // Use Files.copy with InputStream to avoid Tomcat temp-dir path resolution
            // issues
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            // Create MediaAsset record
            MediaAsset media = MediaAsset.builder()
                    .urlStockage("/uploads/produits/" + produitId + "/" + fileName)
                    .formatFichier(file.getContentType())
                    .tailleFichierKo(file.getSize() / 1024)
                    .imagePrincipale(existingCount == 0 && i == 0) // First image = main
                    .ordreAffichage(existingCount + i)
                    .produit(produit)
                    .build();

            savedMedias.add(mediaRepo.save(media));
        }

        return ResponseEntity.ok(savedMedias);
    }

    /**
     * Get all medias for a product.
     */
    @GetMapping("/produit/{produitId}")
    public ResponseEntity<List<MediaAsset>> getMediasForProduct(@PathVariable Long produitId) {
        return ResponseEntity.ok(mediaRepo.findByProduitIdOrderByOrdreAffichageAsc(produitId));
    }

    /**
     * Delete a media by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedia(@PathVariable Long id) {
        mediaRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

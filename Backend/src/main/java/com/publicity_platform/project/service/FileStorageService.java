package com.publicity_platform.project.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8081}")
    private String baseUrl;

    /**
     * Stocke un fichier dans le sous-dossier spécifié.
     *
     * @return l'URL publique du fichier
     */
    public String storeFile(MultipartFile file, String subfolder) {
        validateFile(file);

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String uuid = UUID.randomUUID().toString();
        String newFilename = uuid + extension;

        try {
            Path targetDir = Paths.get(uploadDir, subfolder);
            Files.createDirectories(targetDir);

            Path targetPath = targetDir.resolve(newFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            log.info("Fichier stocké : {}", targetPath);
            return baseUrl + "/api/v1/files/" + subfolder + "/" + newFilename;

        } catch (IOException e) {
            throw new RuntimeException("Erreur lors du stockage du fichier: " + e.getMessage(), e);
        }
    }

    /**
     * Supprime un fichier à partir de son URL publique.
     */
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank())
            return;

        try {
            // Extract path from URL: .../api/v1/files/subfolder/filename
            String marker = "/api/v1/files/";
            int idx = fileUrl.indexOf(marker);
            if (idx < 0)
                return;

            String relativePath = fileUrl.substring(idx + marker.length());
            Path filePath = Paths.get(uploadDir, relativePath);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Fichier supprimé : {}", filePath);
            }
        } catch (IOException e) {
            log.error("Erreur lors de la suppression du fichier: {}", e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier est vide");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Le fichier dépasse la taille maximale de 5 Mo");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Type de fichier non autorisé. Formats acceptés : JPG, PNG, WebP");
        }
    }
}

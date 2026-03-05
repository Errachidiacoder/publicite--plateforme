package com.publicity_platform.project.controller;

import com.publicity_platform.project.entity.Anonce;
import com.publicity_platform.project.entity.MediaAsset;
import com.publicity_platform.project.repository.AnonceRepository;
import com.publicity_platform.project.repository.MediaAssetRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/media")
public class MediaController {

    private static final Logger log = LoggerFactory.getLogger(MediaController.class);
    private final String uploadDir = "uploads/";

    @Autowired
    private AnonceRepository anonceRepository;

    @Autowired
    private MediaAssetRepository mediaAssetRepository;

    public MediaController() {
        log.info("Initializing MediaController. Upload directory: {}", uploadDir);
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            log.error("Could not initialize storage", e);
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        log.info("Receiving upload request for file: {}", file.getOriginalFilename());
        try {
            if (file.isEmpty()) {
                log.warn("Empty file received");
                return ResponseEntity.badRequest().build();
            }
            String extension = getFileExtension(file.getOriginalFilename());
            String fileName = UUID.randomUUID() + "." + extension;
            Path path = Paths.get(uploadDir + fileName);
            Files.copy(file.getInputStream(), path);
            String fileUrl = "http://localhost:8081/api/v1/media/files/" + fileName;
            log.info("File uploaded successfully: {}", fileUrl);
            return ResponseEntity.ok(Map.of("url", fileUrl));
        } catch (IOException e) {
            log.error("Error saving file", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/upload/{anonceId}")
    public ResponseEntity<String> uploadMultipleFiles(
            @PathVariable Long anonceId,
            @RequestParam("files") MultipartFile[] files) {
        log.info("Receiving multi-upload request for anonceId: {}, files count: {}", anonceId, files.length);

        Anonce anonce = anonceRepository.findById(anonceId).orElse(null);
        if (anonce == null) {
            log.warn("Anonce not found: {}", anonceId);
            return ResponseEntity.notFound().build();
        }

        try {
            for (int i = 0; i < files.length; i++) {
                MultipartFile file = files[i];
                if (file.isEmpty())
                    continue;

                String extension = getFileExtension(file.getOriginalFilename());
                String fileName = UUID.randomUUID() + "." + extension;
                Path path = Paths.get(uploadDir + fileName);
                Files.copy(file.getInputStream(), path);

                String fileUrl = "http://localhost:8081/api/v1/media/files/" + fileName;

                // Create MediaAsset record
                MediaAsset asset = new MediaAsset();
                asset.setUrlStockage(fileUrl);
                asset.setFormatFichier(extension.toUpperCase());
                asset.setTailleFichierKo(file.getSize() / 1024);
                asset.setAnonce(anonce);
                asset.setOrdreAffichage(i);
                asset.setImagePrincipale(i == 0);
                mediaAssetRepository.save(asset);

                // Set primary image URL for the anonce if it's the first one
                if (i == 0) {
                    anonce.setImageUrl(fileUrl);
                    anonceRepository.save(anonce);
                }
            }
            return ResponseEntity.ok("Success");
        } catch (IOException e) {
            log.error("Error saving multiple files", e);
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<byte[]> getFile(@PathVariable String filename) {
        try {
            Path path = Paths.get(uploadDir).resolve(filename);
            byte[] data = Files.readAllBytes(path);
            String contentType = Files.probeContentType(path);

            return ResponseEntity.ok()
                    .header("Content-Type", contentType != null ? contentType : "application/octet-stream")
                    .body(data);
        } catch (IOException e) {
            log.error("Error retrieving file: {}", filename, e);
            return ResponseEntity.notFound().build();
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null)
            return "bin";
        int lastIndex = fileName.lastIndexOf('.');
        if (lastIndex == -1)
            return "bin";
        return fileName.substring(lastIndex + 1);
    }
}

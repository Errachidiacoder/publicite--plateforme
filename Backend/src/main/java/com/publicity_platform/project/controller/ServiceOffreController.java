package com.publicity_platform.project.controller;

import com.publicity_platform.project.entity.ServiceOffre;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.entity.Categorie;
import com.publicity_platform.project.service.ServiceOffreService;
import com.publicity_platform.project.repository.CategorieRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/services")
public class ServiceOffreController {

    private final ServiceOffreService service;
    private final CategorieRepository categorieRepository;

    public ServiceOffreController(ServiceOffreService service, CategorieRepository categorieRepository) {
        this.service = service;
        this.categorieRepository = categorieRepository;
    }

    @PostMapping("/submit")
    public ResponseEntity<ServiceOffre> submit(@RequestBody ServiceOffre s,
                                               @AuthenticationPrincipal Utilisateur currentUser) {
        if (currentUser != null) {
            s.setDemandeur(currentUser);
        }
        if (s.getCategorie() != null && s.getCategorie().getId() != null) {
            Categorie cat = categorieRepository.findById(s.getCategorie().getId()).orElse(null);
            s.setCategorie(cat);
        }
        return ResponseEntity.ok(service.submit(s));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceOffre> getById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ServiceOffre>> myServices(@AuthenticationPrincipal Utilisateur currentUser) {
        if (currentUser == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(service.getByDemandeur(currentUser.getId()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ServiceOffre>> search(
            @RequestParam(required = false) String ville,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        String v = ville == null ? "" : ville.trim();
        LocalDateTime start;
        LocalDateTime end;
        try {
            start = (from != null && !from.isBlank()) ? LocalDate.parse(from).atStartOfDay() : LocalDate.now().minusMonths(12).atStartOfDay();
            end = (to != null && !to.isBlank()) ? LocalDate.parse(to).atTime(23, 59, 59) : LocalDateTime.now();
        } catch (DateTimeParseException ex) {
            start = LocalDate.now().minusMonths(12).atStartOfDay();
            end = LocalDateTime.now();
        }
        return ResponseEntity.ok(service.searchActiveByVilleAndDate(v, start, end));
    }
}

package com.publicity_platform.project.controller;

import com.publicity_platform.project.entity.Favoris;
import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.dto.ProduitDto;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.repository.FavorisRepository;
import com.publicity_platform.project.repository.ProduitRepository;
import com.publicity_platform.project.repository.UtilisateurRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/favoris")
public class FavorisController {

    private final FavorisRepository repository;
    private final UtilisateurRepository utilisateurRepository;
    private final ProduitRepository produitRepository;

    public FavorisController(FavorisRepository repository, UtilisateurRepository utilisateurRepository,
            ProduitRepository produitRepository) {
        this.repository = repository;
        this.utilisateurRepository = utilisateurRepository;
        this.produitRepository = produitRepository;
    }

    @GetMapping("/user/{userId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ProduitDto>> getByUser(@PathVariable Long userId) {
        List<Favoris> favoris = repository.findByUtilisateurId(userId);
        return ResponseEntity.ok(favoris.stream()
                .map(f -> ProduitDto.fromEntity(f.getProduit()))
                .toList());
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> isFavorited(@RequestParam Long userId, @RequestParam Long productId) {
        return ResponseEntity.ok(repository.findByUtilisateurIdAndProduitId(userId, productId).isPresent());
    }

    @GetMapping("/count/{userId}")
    public ResponseEntity<Long> getCount(@PathVariable Long userId) {
        return ResponseEntity.ok(repository.countByUtilisateurId(userId));
    }

    @PostMapping("/toggle")
    @Transactional
    public ResponseEntity<Boolean> toggle(@RequestParam Long userId, @RequestParam Long productId) {
        if (userId == null || productId == null) {
            return ResponseEntity.badRequest().build();
        }
        Optional<Favoris> existing = repository.findByUtilisateurIdAndProduitId(userId, productId);
        if (existing.isPresent()) {
            repository.delete(existing.get());
            return ResponseEntity.ok(false);
        } else {
            Utilisateur user = utilisateurRepository.findById(userId).orElseThrow();
            Produit prod = produitRepository.findById(productId).orElseThrow();
            repository.save(new Favoris(user, prod));
            return ResponseEntity.ok(true);
        }
    }
}

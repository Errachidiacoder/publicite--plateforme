package com.publicity_platform.project.controller;

import com.publicity_platform.project.dto.CommandeResponseDto;
import com.publicity_platform.project.entity.Commande;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.enumm.StatutCommande;
import com.publicity_platform.project.repository.ProduitRepository;
import com.publicity_platform.project.service.CommandeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/commandes")
public class CommandeController {

    private final CommandeService service;
    private final ProduitRepository produitRepository;

    public CommandeController(CommandeService service, ProduitRepository produitRepository) {
        this.service = service;
        this.produitRepository = produitRepository;
    }

    /** Passer une commande à partir du panier */
    @PostMapping
    public ResponseEntity<List<CommandeResponseDto>> passerCommande(
            @AuthenticationPrincipal Utilisateur user,
            @RequestBody Map<String, String> body) {
        String adresse = body.getOrDefault("adresseLivraison", "");
        String telephone = body.getOrDefault("telephoneContact", "");
        String notes = body.getOrDefault("notesLivraison", "");
        String methodePaiement = body.getOrDefault("methodePaiement", "PAIEMENT_A_LIVRAISON");
        return ResponseEntity.ok(service.passerCommande(user, adresse, telephone, notes, methodePaiement));
    }

    /** Historique des commandes du client connecté */
    @GetMapping("/mes-commandes")
    public ResponseEntity<List<CommandeResponseDto>> mesCommandes(@AuthenticationPrincipal Utilisateur user) {
        return ResponseEntity.ok(service.getCommandesAcheteur(user.getId()));
    }

    /** Détails d'une commande */
    @GetMapping("/{id}")
    public ResponseEntity<CommandeResponseDto> getCommande(@PathVariable Long id) {
        return ResponseEntity.ok(service.getCommandeById(id));
    }

    /** Commandes liées à la boutique du vendeur connecté */
    @GetMapping("/boutique/{boutiqueId}")
    public ResponseEntity<List<CommandeResponseDto>> commandesBoutique(@PathVariable Long boutiqueId) {
        return ResponseEntity.ok(service.getCommandesBoutique(boutiqueId));
    }

    /** Stats de la boutique pour le dashboard */
    @GetMapping("/boutique/{boutiqueId}/stats")
    public ResponseEntity<java.util.Map<String, Object>> statsBoutique(@PathVariable Long boutiqueId) {
        List<CommandeResponseDto> commandes = service.getCommandesBoutique(boutiqueId);
        int totalCommandes = commandes.size();
        double chiffreAffaires = commandes.stream()
                .filter(c -> Boolean.TRUE.equals(c.getPaiementConfirme()))
                .mapToDouble(c -> c.getMontantTotal() != null ? c.getMontantTotal() : 0).sum();
        long totalProduits = produitRepository.countByBoutiqueId(boutiqueId);
        return ResponseEntity.ok(java.util.Map.of(
                "totalCommandes", totalCommandes,
                "chiffreAffaires", chiffreAffaires,
                "totalProduits", totalProduits));
    }

    /** Commandes assignées à un livreur */
    @GetMapping("/livreur")
    public ResponseEntity<List<Commande>> commandesLivreur(@AuthenticationPrincipal Utilisateur user) {
        return ResponseEntity.ok(service.getCommandesLivreur(user.getId()));
    }

    /** Mettre à jour le statut d'une commande */
    @PutMapping("/{id}/statut")
    public ResponseEntity<Commande> updateStatut(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        StatutCommande nouveauStatut = StatutCommande.valueOf(body.get("statut"));
        String raison = body.getOrDefault("raison", null);
        String annulePar = body.getOrDefault("annulePar", null);
        String numeroSuivi = body.getOrDefault("numeroSuivi", null);
        String societeLivraison = body.getOrDefault("societeLivraison", null);
        return ResponseEntity
                .ok(service.mettreAJourStatut(id, nouveauStatut, raison, annulePar, numeroSuivi, societeLivraison));
    }

    /** Confirmer la réception du paiement (vendeur) */
    @PutMapping("/{id}/confirmer-paiement")
    public ResponseEntity<Commande> confirmerPaiement(@PathVariable Long id) {
        return ResponseEntity.ok(service.confirmerPaiement(id));
    }

    /** Assigner un livreur à une commande */
    @PutMapping("/{id}/assigner-livreur")
    public ResponseEntity<Commande> assignerLivreur(
            @PathVariable Long id,
            @AuthenticationPrincipal Utilisateur livreur) {
        return ResponseEntity.ok(service.assignerLivreur(id, livreur));
    }
}

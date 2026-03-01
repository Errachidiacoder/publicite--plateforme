package com.publicity_platform.project.controller;

import com.publicity_platform.project.entity.Commande;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.enumm.StatutCommande;
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

    public CommandeController(CommandeService service) {
        this.service = service;
    }

    /** Passer une commande à partir du panier */
    @PostMapping
    public ResponseEntity<Commande> passerCommande(
            @AuthenticationPrincipal Utilisateur user,
            @RequestBody Map<String, String> body) {
        String adresse = body.getOrDefault("adresseLivraison", "");
        String telephone = body.getOrDefault("telephoneContact", "");
        String notes = body.getOrDefault("notesLivraison", "");
        String methodePaiement = body.getOrDefault("methodePaiement", "PAIEMENT_A_LIVRAISON");
        return ResponseEntity.ok(service.passerCommande(user, adresse, telephone, notes, methodePaiement));
    }

    /** Historique des commandes du client connecté */
    @GetMapping
    public ResponseEntity<List<Commande>> mesCommandes(@AuthenticationPrincipal Utilisateur user) {
        return ResponseEntity.ok(service.getCommandesAcheteur(user.getId()));
    }

    /** Détails d'une commande */
    @GetMapping("/{id}")
    public ResponseEntity<Commande> getCommande(@PathVariable Long id) {
        return ResponseEntity.ok(service.getCommandeById(id));
    }

    /** Commandes liées à la boutique du vendeur connecté */
    @GetMapping("/boutique/{boutiqueId}")
    public ResponseEntity<List<Commande>> commandesBoutique(@PathVariable Long boutiqueId) {
        return ResponseEntity.ok(service.getCommandesBoutique(boutiqueId));
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
        return ResponseEntity.ok(service.mettreAJourStatut(id, nouveauStatut));
    }

    /** Assigner un livreur à une commande */
    @PutMapping("/{id}/assigner-livreur")
    public ResponseEntity<Commande> assignerLivreur(
            @PathVariable Long id,
            @AuthenticationPrincipal Utilisateur livreur) {
        return ResponseEntity.ok(service.assignerLivreur(id, livreur));
    }
}

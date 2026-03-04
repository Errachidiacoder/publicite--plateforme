package com.publicity_platform.project.service;

import com.publicity_platform.project.entity.Commande;
import com.publicity_platform.project.entity.LigneCommande;
import com.publicity_platform.project.entity.Utilisateur;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

/**
 * Builds and dispatches in-app notifications for order status transitions.
 */
@Component
public class OrderNotificationHelper {

    private final NotificationService notificationService;

    public OrderNotificationHelper(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // ─── Order Placed (EN_ATTENTE_PAIEMENT) ─────────────────────

    public void notifyOrderPlaced(Commande commande) {
        String ref = commande.getReferenceCommande();
        int nbArticles = commande.getLignes() != null ? commande.getLignes().size() : 0;
        double total = commande.getMontantTotalTTC() != null ? commande.getMontantTotalTTC() : 0;

        // Notify client
        notificationService.createOrderNotification(
                commande.getAcheteur(),
                "🛍️ Commande " + ref + " confirmée!",
                "Vous avez commandé " + nbArticles + " article(s) pour un total de MAD " + String.format("%.2f", total)
                        + ". Votre commande est en attente de confirmation du vendeur.",
                "COMMANDE_PLACEE",
                commande.getId(),
                "/mes-commandes");

        // Notify each merchant (by distinct boutique owner)
        notifyMerchants(commande, "📦 Nouvelle commande " + ref,
                "Un client vient de passer une commande contenant vos produits. Confirmez la commande pour commencer la préparation.",
                "COMMANDE_PLACEE");
    }

    // ─── Confirmed (PAIEMENT_CONFIRME) ──────────────────────────

    public void notifyConfirmee(Commande commande) {
        notificationService.createOrderNotification(
                commande.getAcheteur(),
                "✅ Commande " + commande.getReferenceCommande() + " confirmée!",
                "Le vendeur a accepté votre commande. Elle sera bientôt en cours de préparation.",
                "COMMANDE_CONFIRMEE",
                commande.getId(),
                "/mes-commandes");
    }

    // ─── In Preparation (EN_PREPARATION) ────────────────────────

    public void notifyEnPreparation(Commande commande) {
        notificationService.createOrderNotification(
                commande.getAcheteur(),
                "📦 Commande " + commande.getReferenceCommande() + " en préparation",
                "Le vendeur emballe vos articles avec soin. Vous serez notifié dès l'expédition.",
                "COMMANDE_EN_PREPARATION",
                commande.getId(),
                "/mes-commandes");
    }

    // ─── Shipped (EXPEDIEE) ─────────────────────────────────────

    public void notifyExpediee(Commande commande) {
        StringBuilder msg = new StringBuilder("Votre commande est en route!");
        if (commande.getNumeroSuivi() != null && !commande.getNumeroSuivi().isBlank()) {
            msg.append(" Numéro de suivi: ").append(commande.getNumeroSuivi()).append(".");
        }
        if (commande.getSocieteLivraison() != null && !commande.getSocieteLivraison().isBlank()) {
            msg.append(" Livrée par: ").append(commande.getSocieteLivraison()).append(".");
        }
        msg.append(" Livraison estimée: 2–5 jours ouvrables.");

        notificationService.createOrderNotification(
                commande.getAcheteur(),
                "🚚 Commande " + commande.getReferenceCommande() + " expédiée!",
                msg.toString(),
                "COMMANDE_EXPEDIEE",
                commande.getId(),
                "/mes-commandes");
    }

    // ─── Delivered (LIVREE) ─────────────────────────────────────

    public void notifyLivree(Commande commande) {
        notificationService.createOrderNotification(
                commande.getAcheteur(),
                "🎉 Commande " + commande.getReferenceCommande() + " livrée!",
                "Votre commande a bien été reçue. Merci pour votre achat!",
                "COMMANDE_LIVREE",
                commande.getId(),
                "/mes-commandes");
    }

    // ─── Cancelled (ANNULE) ─────────────────────────────────────

    public void notifyAnnulee(Commande commande) {
        String annulePar = commande.getAnnulePar() != null ? commande.getAnnulePar() : "INCONNU";
        String raison = commande.getAnnulationRaison() != null ? commande.getAnnulationRaison() : "Aucun motif fourni";

        if ("CLIENT".equals(annulePar)) {
            // Notify merchant(s)
            notifyMerchants(commande,
                    "❌ Commande " + commande.getReferenceCommande() + " annulée par le client",
                    "Le client a annulé sa commande. Motif: " + raison + ". Les produits ont été remis en stock.",
                    "COMMANDE_ANNULEE");
        } else {
            // Notify client
            notificationService.createOrderNotification(
                    commande.getAcheteur(),
                    "❌ Commande " + commande.getReferenceCommande() + " annulée",
                    "Le vendeur a annulé votre commande. Motif: " + raison
                            + ". Si vous avez des questions, contactez le support.",
                    "COMMANDE_ANNULEE",
                    commande.getId(),
                    "/mes-commandes");
        }
    }

    // ─── Payment Confirmed ──────────────────────────────────────

    public void notifyPaiementConfirme(Commande commande) {
        notificationService.createOrderNotification(
                commande.getAcheteur(),
                "💰 Paiement confirmé — Commande " + commande.getReferenceCommande(),
                "Le vendeur a confirmé la réception du paiement pour votre commande.",
                "PAIEMENT_CONFIRME_VENDEUR",
                commande.getId(),
                "/mes-commandes");
    }

    // ─── Helpers ────────────────────────────────────────────────

    private void notifyMerchants(Commande commande, String sujet, String message, String type) {
        if (commande.getLignes() == null)
            return;
        Set<Long> notifiedOwners = new HashSet<>();
        for (LigneCommande ligne : commande.getLignes()) {
            if (ligne.getProduitCommande() != null
                    && ligne.getProduitCommande().getBoutique() != null
                    && ligne.getProduitCommande().getBoutique().getProprietaire() != null) {
                Utilisateur owner = ligne.getProduitCommande().getBoutique().getProprietaire();
                if (notifiedOwners.add(owner.getId())) {
                    notificationService.createOrderNotification(
                            owner, sujet, message, type,
                            commande.getId(),
                            "/vendeur/commandes");
                }
            }
        }
    }
}

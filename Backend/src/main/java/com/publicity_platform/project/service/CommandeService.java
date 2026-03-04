package com.publicity_platform.project.service;

import com.publicity_platform.project.dto.CommandeResponseDto;
import com.publicity_platform.project.dto.LigneCommandeDto;
import com.publicity_platform.project.entity.*;
import com.publicity_platform.project.enumm.StatutCommande;
import com.publicity_platform.project.repository.CommandeRepository;
import com.publicity_platform.project.repository.ProduitRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommandeService {

    private static final Logger log = LoggerFactory.getLogger(CommandeService.class);
    private final CommandeRepository commandeRepository;
    private final PanierService panierService;
    private final ProduitRepository produitRepository;
    private final OrderNotificationHelper orderNotificationHelper;

    public CommandeService(CommandeRepository commandeRepository,
            PanierService panierService,
            ProduitRepository produitRepository,
            OrderNotificationHelper orderNotificationHelper) {
        this.commandeRepository = commandeRepository;
        this.panierService = panierService;
        this.produitRepository = produitRepository;
        this.orderNotificationHelper = orderNotificationHelper;
    }

    /**
     * Crée une commande PAR BOUTIQUE à partir du contenu actuel du panier.
     * Si le panier contient des produits de 3 boutiques différentes, 3 commandes
     * sont créées.
     */
    @Transactional
    public List<CommandeResponseDto> passerCommande(Utilisateur acheteur, String adresseLivraison,
            String telephoneContact, String notesLivraison,
            String methodePaiement) {

        Panier panier = panierService.getPanierUtilisateur(acheteur);

        if (panier.getLignes() == null || panier.getLignes().isEmpty()) {
            throw new RuntimeException("Le panier est vide, impossible de passer commande");
        }

        // Group cart lines by boutique
        java.util.Map<Long, List<LignePanier>> lignesParBoutique = new java.util.LinkedHashMap<>();
        for (LignePanier lp : panier.getLignes()) {
            Produit produit = lp.getProduit();
            Long boutiqueId = (produit.getBoutique() != null) ? produit.getBoutique().getId() : 0L;
            lignesParBoutique.computeIfAbsent(boutiqueId, k -> new ArrayList<>()).add(lp);
        }

        // Determine initial status based on payment method
        StatutCommande statutInitial;
        com.publicity_platform.project.enumm.MethodePaiement methode;
        if ("PAIEMENT_A_LIVRAISON".equals(methodePaiement)) {
            statutInitial = StatutCommande.EN_PREPARATION;
            methode = com.publicity_platform.project.enumm.MethodePaiement.PAIEMENT_A_LIVRAISON;
        } else {
            statutInitial = StatutCommande.EN_ATTENTE_PAIEMENT;
            try {
                methode = com.publicity_platform.project.enumm.MethodePaiement.valueOf(methodePaiement);
            } catch (IllegalArgumentException e) {
                methode = com.publicity_platform.project.enumm.MethodePaiement.PAIEMENT_A_LIVRAISON;
            }
        }

        List<CommandeResponseDto> result = new ArrayList<>();

        for (java.util.Map.Entry<Long, List<LignePanier>> entry : lignesParBoutique.entrySet()) {
            Commande commande = new Commande();
            commande.setAcheteur(acheteur);
            commande.setAdresseLivraison(adresseLivraison);
            commande.setTelephoneContact(telephoneContact);
            commande.setNotesLivraison(notesLivraison);
            commande.setStatutCommande(statutInitial);
            commande.setMethodePaiement(methode);
            commande.setLignes(new ArrayList<>());

            double totalTTC = 0.0;

            for (LignePanier lignePanier : entry.getValue()) {
                Produit produit = lignePanier.getProduit();

                // Re-validate stock at checkout time
                if (produit.getQuantiteStock() != null
                        && lignePanier.getQuantite() > produit.getQuantiteStock()) {
                    throw new RuntimeException(
                            "Stock insuffisant pour '" + produit.getTitreProduit()
                                    + "'. Disponible : " + produit.getQuantiteStock());
                }

                double prixEffectif = resolvePrix(produit);

                LigneCommande ligneCommande = new LigneCommande();
                ligneCommande.setProduitCommande(produit);
                ligneCommande.setQuantiteCommandee(lignePanier.getQuantite());
                ligneCommande.setPrixUnitaireTTC(prixEffectif);
                ligneCommande.setCommandeParente(commande);
                commande.getLignes().add(ligneCommande);

                totalTTC += prixEffectif * lignePanier.getQuantite();

                // Update stock and sales count
                if (produit.getQuantiteStock() != null && produit.getQuantiteStock() > 0) {
                    produit.setQuantiteStock(
                            produit.getQuantiteStock() - lignePanier.getQuantite());
                }
                produit.setNombreVentes(
                        (produit.getNombreVentes() != null ? produit.getNombreVentes() : 0)
                                + lignePanier.getQuantite());
                produitRepository.save(produit);
            }

            commande.setMontantTotalTTC(totalTTC);
            Commande saved = commandeRepository.save(commande);

            // Notify client + merchant for this sub-order
            try {
                orderNotificationHelper.notifyOrderPlaced(saved);
            } catch (Exception e) {
                log.error("Failed to send order placed notification for commande {}: {}", saved.getId(), e.getMessage(),
                        e);
            }

            result.add(toDto(saved));
        }

        // Clear the cart after all sub-orders are created
        panierService.viderPanier(acheteur);

        return result;
    }

    @Transactional(readOnly = true)
    public List<CommandeResponseDto> getCommandesAcheteur(Long acheteurId) {
        return commandeRepository.findByAcheteurIdOrderByDatePassageCommandeDesc(acheteurId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CommandeResponseDto getCommandeById(Long id) {
        Commande commande = commandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
        return toDto(commande);
    }

    @Transactional(readOnly = true)
    public List<CommandeResponseDto> getCommandesBoutique(Long boutiqueId) {
        return commandeRepository.findByBoutiqueId(boutiqueId)
                .stream().map(c -> toDtoForBoutique(c, boutiqueId)).collect(Collectors.toList());
    }

    public List<Commande> getCommandesLivreur(Long livreurId) {
        return commandeRepository.findByLivreurId(livreurId);
    }

    /**
     * Met à jour le statut d'une commande avec business logic per transition.
     */
    @Transactional
    public Commande mettreAJourStatut(Long commandeId, StatutCommande nouveauStatut,
            String raison, String annulePar, String numeroSuivi, String societeLivraison) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        StatutCommande ancienStatut = commande.getStatutCommande();

        // Cancellation validation: only from EN_PREPARATION or EN_LIVRAISON
        if (nouveauStatut == StatutCommande.ANNULE) {
            if (ancienStatut != StatutCommande.EN_PREPARATION && ancienStatut != StatutCommande.EN_LIVRAISON) {
                throw new RuntimeException(
                        "L'annulation n'est possible que pour les commandes en préparation ou en livraison.");
            }
            if (raison == null || raison.isBlank()) {
                throw new RuntimeException("Le motif d'annulation est obligatoire.");
            }
            commande.setAnnulationRaison(raison);
            commande.setAnnulePar(annulePar != null ? annulePar : "VENDEUR");

            // Restore stock
            if (commande.getLignes() != null) {
                for (LigneCommande ligne : commande.getLignes()) {
                    Produit produit = ligne.getProduitCommande();
                    if (produit != null && ligne.getQuantiteCommandee() != null) {
                        produit.setQuantiteStock(
                                (produit.getQuantiteStock() != null ? produit.getQuantiteStock() : 0)
                                        + ligne.getQuantiteCommandee());
                        produitRepository.save(produit);
                    }
                }
            }
        }

        // Shipping: save tracking info + date
        if (nouveauStatut == StatutCommande.EXPEDIEE) {
            commande.setDateExpeditionReelle(LocalDateTime.now());
            if (numeroSuivi != null && !numeroSuivi.isBlank()) {
                commande.setNumeroSuivi(numeroSuivi);
            }
            if (societeLivraison != null && !societeLivraison.isBlank()) {
                commande.setSocieteLivraison(societeLivraison);
            }
        }

        // Delivery: save date
        if (nouveauStatut == StatutCommande.LIVREE) {
            commande.setDateLivraisonReelle(LocalDateTime.now());
        }

        commande.setStatutCommande(nouveauStatut);
        Commande saved = commandeRepository.save(commande);

        // Dispatch notification
        try {
            switch (nouveauStatut) {
                case PAIEMENT_CONFIRME -> orderNotificationHelper.notifyConfirmee(saved);
                case EN_PREPARATION -> orderNotificationHelper.notifyEnPreparation(saved);
                case EXPEDIEE -> orderNotificationHelper.notifyExpediee(saved);
                case LIVREE -> orderNotificationHelper.notifyLivree(saved);
                case ANNULE -> orderNotificationHelper.notifyAnnulee(saved);
                default -> {
                    /* no notification for other transitions */ }
            }
        } catch (Exception e) {
            log.error("Failed to send status notification for commande {}: {}", saved.getId(), e.getMessage(), e);
        }

        return saved;
    }

    /**
     * Backward compatible overload (no extra params).
     */
    @Transactional
    public Commande mettreAJourStatut(Long commandeId, StatutCommande nouveauStatut) {
        return mettreAJourStatut(commandeId, nouveauStatut, null, null, null, null);
    }

    /**
     * Merchant confirms COD payment received — updates chiffre d'affaires.
     */
    @Transactional
    public Commande confirmerPaiement(Long commandeId) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
        if (commande.getStatutCommande() != StatutCommande.LIVREE) {
            throw new RuntimeException("Le paiement ne peut être confirmé que pour les commandes livrées.");
        }
        commande.setPaiementConfirme(true);
        Commande saved = commandeRepository.save(commande);
        try {
            orderNotificationHelper.notifyPaiementConfirme(saved);
        } catch (Exception ignored) {
        }
        return saved;
    }

    /**
     * Assigne un livreur à une commande.
     */
    @Transactional
    public Commande assignerLivreur(Long commandeId, Utilisateur livreur) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
        commande.setLivreur(livreur);
        commande.setStatutCommande(StatutCommande.EN_LIVRAISON);
        return commandeRepository.save(commande);
    }

    // ─── DTO Conversion ───────────────────────────

    private CommandeResponseDto toDto(Commande commande) {
        CommandeResponseDto dto = new CommandeResponseDto();
        dto.setId(commande.getId());
        dto.setReferenceCommande(commande.getReferenceCommande());
        dto.setStatutCommande(commande.getStatutCommande());
        dto.setMethodePaiement(commande.getMethodePaiement());
        dto.setMontantTotal(commande.getMontantTotalTTC());
        dto.setAdresseLivraison(commande.getAdresseLivraison());
        dto.setTelephoneContact(commande.getTelephoneContact());
        dto.setNotesLivraison(commande.getNotesLivraison());
        dto.setDatePassageCommande(commande.getDatePassageCommande());

        if (commande.getLignes() != null) {
            dto.setLignes(commande.getLignes().stream()
                    .map(this::toLigneDto)
                    .collect(Collectors.toList()));
            dto.setNombreArticles(commande.getLignes().stream()
                    .mapToInt(LigneCommande::getQuantiteCommandee)
                    .sum());
        } else {
            dto.setLignes(new ArrayList<>());
            dto.setNombreArticles(0);
        }

        // Order lifecycle fields
        dto.setAnnulationRaison(commande.getAnnulationRaison());
        dto.setAnnulePar(commande.getAnnulePar());
        dto.setNumeroSuivi(commande.getNumeroSuivi());
        dto.setSocieteLivraison(commande.getSocieteLivraison());
        dto.setDateExpeditionReelle(commande.getDateExpeditionReelle());
        dto.setDateLivraisonReelle(commande.getDateLivraisonReelle());
        dto.setPaiementConfirme(commande.getPaiementConfirme());

        return dto;
    }

    /**
     * Converts a Commande to DTO but only includes line items belonging to the
     * given boutique.
     * Recalculates montantTotal and nombreArticles based on filtered lines only.
     */
    private CommandeResponseDto toDtoForBoutique(Commande commande, Long boutiqueId) {
        CommandeResponseDto dto = new CommandeResponseDto();
        dto.setId(commande.getId());
        dto.setReferenceCommande(commande.getReferenceCommande());
        dto.setStatutCommande(commande.getStatutCommande());
        dto.setMethodePaiement(commande.getMethodePaiement());
        dto.setAdresseLivraison(commande.getAdresseLivraison());
        dto.setTelephoneContact(commande.getTelephoneContact());
        dto.setNotesLivraison(commande.getNotesLivraison());
        dto.setDatePassageCommande(commande.getDatePassageCommande());

        // Filter lines to only include products from this boutique
        List<LigneCommande> filteredLines = (commande.getLignes() != null)
                ? commande.getLignes().stream()
                        .filter(l -> l.getProduitCommande() != null
                                && l.getProduitCommande().getBoutique() != null
                                && boutiqueId.equals(l.getProduitCommande().getBoutique().getId()))
                        .collect(Collectors.toList())
                : new ArrayList<>();

        dto.setLignes(filteredLines.stream().map(this::toLigneDto).collect(Collectors.toList()));
        dto.setNombreArticles(filteredLines.stream().mapToInt(LigneCommande::getQuantiteCommandee).sum());

        // Recalculate montant based on merchant's items only
        double merchantTotal = filteredLines.stream()
                .mapToDouble(l -> l.getSousTotalLigne() != null ? l.getSousTotalLigne() : 0.0)
                .sum();
        dto.setMontantTotal(merchantTotal);

        // Order lifecycle fields
        dto.setAnnulationRaison(commande.getAnnulationRaison());
        dto.setAnnulePar(commande.getAnnulePar());
        dto.setNumeroSuivi(commande.getNumeroSuivi());
        dto.setSocieteLivraison(commande.getSocieteLivraison());
        dto.setDateExpeditionReelle(commande.getDateExpeditionReelle());
        dto.setDateLivraisonReelle(commande.getDateLivraisonReelle());
        dto.setPaiementConfirme(commande.getPaiementConfirme());

        return dto;
    }

    private LigneCommandeDto toLigneDto(LigneCommande ligne) {
        LigneCommandeDto dto = new LigneCommandeDto();
        dto.setId(ligne.getId());
        dto.setQuantite(ligne.getQuantiteCommandee());
        dto.setPrixUnitaire(ligne.getPrixUnitaireTTC());
        dto.setSousTotal(ligne.getSousTotalLigne());

        Produit p = ligne.getProduitCommande();
        if (p != null) {
            dto.setProduitId(p.getId());
            dto.setProduitNom(p.getTitreProduit());
            dto.setProduitImage(resolvePrimaryImage(p));
        }

        return dto;
    }

    // ─── Helpers ──────────────────────────────────

    private double resolvePrix(Produit produit) {
        if (produit.getPrixPromo() != null) {
            return produit.getPrixPromo().doubleValue();
        }
        if (produit.getPrix() != null) {
            return produit.getPrix().doubleValue();
        }
        if (produit.getPrixAfiche() != null) {
            return produit.getPrixAfiche();
        }
        return 0.0;
    }

    private String resolvePrimaryImage(Produit produit) {
        if (produit.getImages() != null && !produit.getImages().isEmpty()) {
            return produit.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .findFirst()
                    .map(ProductImage::getUrl)
                    .orElse(produit.getImages().get(0).getUrl());
        }
        return produit.getImageUrl();
    }
}

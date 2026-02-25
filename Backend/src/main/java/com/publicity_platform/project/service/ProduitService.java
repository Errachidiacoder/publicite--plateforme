package com.publicity_platform.project.service;

import com.publicity_platform.project.entity.HistoriqueValidation;
import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.dto.ProduitDto;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.enumm.StatutValidation;
import com.publicity_platform.project.repository.HistoriqueValidationRepository;
import com.publicity_platform.project.repository.ProduitRepository;
import com.publicity_platform.project.repository.UtilisateurRepository;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProduitService {

        private final ProduitRepository repository;
        private final NotificationService notificationService;
        private final UtilisateurRepository utilisateurRepository;
        private final HistoriqueValidationRepository historiqueValidationRepository;

        public ProduitService(ProduitRepository repository,
                        NotificationService notificationService,
                        UtilisateurRepository utilisateurRepository,
                        HistoriqueValidationRepository historiqueValidationRepository) {
                this.repository = repository;
                this.notificationService = notificationService;
                this.utilisateurRepository = utilisateurRepository;
                this.historiqueValidationRepository = historiqueValidationRepository;
        }

        @Transactional(readOnly = true)
        public List<ProduitDto> getAllValidatedProducts() {
                return repository.findByStatutValidation(StatutValidation.VALIDE).stream()
                                .map(ProduitDto::fromEntity)
                                .toList();
        }

        @Transactional(readOnly = true)
        public List<ProduitDto> getAllActiveProducts() {
                return repository.findByStatutValidation(StatutValidation.ACTIVEE).stream()
                                .map(ProduitDto::fromEntity)
                                .toList();
        }

        @Transactional(readOnly = true)
        public List<ProduitDto> getPendingProducts() {
                return repository.findByStatutValidation(StatutValidation.EN_ATTENTE).stream()
                                .map(ProduitDto::fromEntity)
                                .toList();
        }

        @Transactional(readOnly = true)
        public List<ProduitDto> getProductsByAnnonceur(@NonNull Long annonceurId) {
                return repository.findByAnnonceurId(annonceurId).stream()
                                .map(ProduitDto::fromEntity)
                                .toList();
        }

        @Transactional(readOnly = true)
        public List<ProduitDto> getAllProducts() {
                return repository.findAll().stream()
                                .map(ProduitDto::fromEntity)
                                .toList();
        }

        @Transactional(readOnly = true)
        public List<ProduitDto> getProductsByStatus(StatutValidation status) {
                return repository.findByStatutValidation(status).stream()
                                .map(ProduitDto::fromEntity)
                                .toList();
        }

        @Transactional
        public Produit submitProduct(Produit produit) {
                produit.setStatutValidation(StatutValidation.EN_ATTENTE);
                Produit saved = repository.save(produit);

                // Notifier les administrateurs
                List<Utilisateur> admins = utilisateurRepository.findAll().stream()
                                .filter(u -> u.getRoles().stream()
                                                .anyMatch(r -> r.getName().equals("ADJOINTADMIN")
                                                                || r.getName().equals("SUPERADMIN")))
                                .toList();

                for (Utilisateur admin : admins) {
                        notificationService.createNotification(
                                        admin,
                                        "Nouvelle annonce à valider",
                                        "L'annonce '" + saved.getTitreProduit() + "' a été soumise par "
                                                        + saved.getAnnonceur().getNomComplet(),
                                        "NOUVELLE_ANNONCE",
                                        saved);
                }

                return saved;
        }

        @Transactional
        @SuppressWarnings("null")
        public Produit validateProduct(@NonNull Long id, int durationMonths, Utilisateur admin) {

                Produit produit = repository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

                StatutValidation ancienStatut = produit.getStatutValidation();
                produit.publier(durationMonths);
                Produit saved = repository.save(produit);

                // Historique
                historiqueValidationRepository.save(java.util.Objects.requireNonNull(HistoriqueValidation.builder()
                                .actionEffectuee("VALIDATION")
                                .ancienStatut(ancienStatut)
                                .nouveauStatut(StatutValidation.VALIDE)
                                .adminResponsable(admin)
                                .produitConcerne(saved)
                                .build()));

                // Notifier l'annonceur pour le paiement
                notificationService.createNotification(
                                saved.getAnnonceur(),
                                "Annonce Validée - Paiement requis",
                                "Votre annonce '" + saved.getTitreProduit()
                                                + "' est validée. Veuillez procéder au paiement pour l'activer.",
                                "VALIDATION_PAIEMENT",
                                saved);

                return saved;
        }

        @Transactional
        public Produit activateProduct(@NonNull Long id) {
                Produit produit = repository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
                produit.setStatutValidation(StatutValidation.ACTIVEE);
                Produit saved = repository.save(produit);

                notificationService.createNotification(
                                saved.getAnnonceur(),
                                "Annonce Activée",
                                "Félicitations ! Votre annonce '" + saved.getTitreProduit()
                                                + "' est maintenant en ligne.",
                                "ACTIVATION",
                                saved);

                return saved;
        }

        @Transactional
        @SuppressWarnings("null")
        public Produit rejectProduct(@NonNull Long id, String reason, Utilisateur admin) {

                Produit produit = repository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

                StatutValidation ancienStatut = produit.getStatutValidation();
                produit.setStatutValidation(StatutValidation.REFUSE);
                produit.setMotifRefusAdmin(reason);
                Produit saved = repository.save(produit);

                // Historique
                historiqueValidationRepository.save(java.util.Objects.requireNonNull(HistoriqueValidation.builder()
                                .actionEffectuee("REFUS")
                                .commentaireAdmin(reason)
                                .ancienStatut(ancienStatut)
                                .nouveauStatut(StatutValidation.REFUSE)
                                .adminResponsable(admin)
                                .produitConcerne(saved)
                                .build()));

                notificationService.createNotification(
                                saved.getAnnonceur(),
                                "Annonce Refusée",
                                "Votre annonce '" + saved.getTitreProduit() + "' a été refusée. Motif : " + reason,
                                "REFUS",
                                saved);

                return saved;
        }

        @Transactional(readOnly = true)
        public void archiveProduct(@NonNull Long id, Utilisateur admin) {
                Produit produit = repository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
                StatutValidation ancienStatut = produit.getStatutValidation();
                produit.archiver();
                Produit saved = repository.save(produit);

                historiqueValidationRepository.save(HistoriqueValidation.builder()
                                .actionEffectuee("ARCHIVAGE")
                                .adminResponsable(admin)
                                .produitConcerne(saved)
                                .ancienStatut(ancienStatut)
                                .nouveauStatut(StatutValidation.ARCHIVE)
                                .build());
        }

        @Transactional
        public ProduitDto submitProductDto(Produit produit) {
                return ProduitDto.fromEntity(submitProduct(produit));
        }

        @Transactional(readOnly = true)
        public ProduitDto getProductDtoById(@NonNull Long id) {
                return ProduitDto.fromEntity(getProductById(id));
        }

        @Transactional
        public ProduitDto activateProductDto(@NonNull Long id) {
                return ProduitDto.fromEntity(activateProduct(id));
        }

        @Transactional
        public ProduitDto validateProductDto(@NonNull Long id, int durationMonths,
                        Utilisateur admin) {
                return ProduitDto
                                .fromEntity(validateProduct(id, durationMonths, admin));
        }

        @Transactional
        public ProduitDto rejectProductDto(@NonNull Long id, String reason,
                        Utilisateur admin) {
                return ProduitDto.fromEntity(rejectProduct(id, reason, admin));
        }

        @Transactional
        public ProduitDto updateProduct(@NonNull Long id, Produit produit) {
                Produit existing = getProductById(id);
                existing.setTitreProduit(produit.getTitreProduit());
                existing.setDescriptionDetaillee(produit.getDescriptionDetaillee());
                existing.setPrixAfiche(produit.getPrixAfiche());
                existing.setTypePrix(produit.getTypePrix());
                existing.setVilleLocalisation(produit.getVilleLocalisation());
                existing.setCategorie(produit.getCategorie());
                existing.setDisponibilite(produit.getDisponibilite());
                existing.setTypeAnnonce(produit.getTypeAnnonce());
                if (produit.getImageUrl() != null) {
                        existing.setImageUrl(produit.getImageUrl());
                }
                existing.setStatutValidation(StatutValidation.EN_ATTENTE);
                Produit saved = repository.save(existing);
                return ProduitDto.fromEntity(saved);
        }

        public Produit saveProduct(Produit p) {
                return repository.save(p);
        }

        public void deleteProduct(@NonNull Long id) {
                repository.deleteById(id);
        }

        public Produit getProductById(@NonNull Long id) {
                return repository.findById(id).orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        }
}

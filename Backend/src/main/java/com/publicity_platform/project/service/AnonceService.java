package com.publicity_platform.project.service;

import com.publicity_platform.project.entity.HistoriqueValidation;
import com.publicity_platform.project.entity.Anonce;
import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.dto.AnonceDto;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.enumm.StatutValidation;
import com.publicity_platform.project.repository.HistoriqueValidationRepository;
import com.publicity_platform.project.repository.AnonceRepository;
import com.publicity_platform.project.repository.UtilisateurRepository;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AnonceService {

        private final AnonceRepository repository;
        private final NotificationService notificationService;
        private final UtilisateurRepository utilisateurRepository;
        private final HistoriqueValidationRepository historiqueValidationRepository;

        public AnonceService(AnonceRepository repository,
                        NotificationService notificationService,
                        UtilisateurRepository utilisateurRepository,
                        HistoriqueValidationRepository historiqueValidationRepository) {
                this.repository = repository;
                this.notificationService = notificationService;
                this.utilisateurRepository = utilisateurRepository;
                this.historiqueValidationRepository = historiqueValidationRepository;
        }

        @Transactional(readOnly = true)
        public List<AnonceDto> getAllValidatedAnonces() {
                return repository.findByStatutValidation(StatutValidation.VALIDE).stream()
                                .map(AnonceDto::fromEntity)
                                .toList();
        }

        /** Returns all public anonces (ACTIVEE only) for the marketplace. */
        public List<AnonceDto> getAllActiveAnonces() {
                return repository.findByStatutValidation(StatutValidation.ACTIVEE).stream()
                                .map(AnonceDto::fromEntity)
                                .toList();
        }

        @Transactional(readOnly = true)
        public List<AnonceDto> getPendingAnonces() {
                return repository.findByStatutValidation(StatutValidation.EN_ATTENTE).stream()
                                .map(AnonceDto::fromEntity)
                                .toList();
        }

        @Transactional(readOnly = true)
        public List<AnonceDto> getAnoncesByAnnonceur(@NonNull Long annonceurId) {
                return repository.findByAnnonceurId(annonceurId).stream()
                                .map(AnonceDto::fromEntity)
                                .toList();
        }

        @Transactional(readOnly = true)
        public List<AnonceDto> getAllAnonces() {
                return repository.findAll().stream()
                                .map(AnonceDto::fromEntity)
                                .toList();
        }

        @Transactional(readOnly = true)
        public List<AnonceDto> getAnoncesByStatus(StatutValidation status) {
                return repository.findByStatutValidation(status).stream()
                                .map(AnonceDto::fromEntity)
                                .toList();
        }

        @Transactional
        public Anonce submitAnonce(Anonce anonce) {
                anonce.setStatutValidation(StatutValidation.EN_ATTENTE);
                anonce.setDatePublication(null);
                Anonce saved = repository.save(anonce);

                // Notifier les administrateurs
                List<Utilisateur> admins = utilisateurRepository.findAll().stream()
                                .filter(u -> u.getRoles().stream()
                                                .anyMatch(r -> r.getName().equals("ADJOINTADMIN")
                                                                || r.getName().equals("SUPERADMIN")))
                                .toList();

                for (Utilisateur admin : admins) {
                        notificationService.createNotification(
                                        admin,
                                        "Nouvelle anonce publiée",
                                        "L'anonce '" + saved.getTitreAnonce() + "' a été publiée par "
                                                        + saved.getAnnonceur().getNomComplet(),
                                        "NOUVELLE_ANNONCE",
                                        saved);
                }

                return saved;
        }

        @Transactional
        public Anonce createAnonceFromProduct(Produit produit) {
            Anonce anonce = new Anonce();
            anonce.setTitreAnonce(produit.getTitreProduit());
            anonce.setDescriptionDetaillee(produit.getDescriptionDetaillee());
            anonce.setTypeAnnonce(produit.getTypeAnnonce());
            anonce.setPrixAfiche(produit.getPrixAfiche());
            anonce.setTypePrix(produit.getTypePrix());
            anonce.setDisponibilite(produit.getDisponibilite());
            anonce.setVilleLocalisation(produit.getVilleLocalisation());
            anonce.setImageUrl(produit.getImageUrl());
            anonce.setAnnonceur(produit.getAnnonceur());
            anonce.setCategorie(produit.getCategorie());
            anonce.setProduit(produit);
            return submitAnonce(anonce);
        }

        @Transactional
        @SuppressWarnings("null")
        public Anonce validateAnonce(@NonNull Long id, int durationMonths, Utilisateur admin) {

                Anonce anonce = repository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Anonce non trouvée"));

                StatutValidation ancienStatut = anonce.getStatutValidation();
                anonce.publier(durationMonths);
                Anonce saved = repository.save(anonce);

                // Historique
                historiqueValidationRepository.save(java.util.Objects.requireNonNull(HistoriqueValidation.builder()
                                .actionEffectuee("VALIDATION")
                                .ancienStatut(ancienStatut)
                                .nouveauStatut(StatutValidation.VALIDE)
                                .adminResponsable(admin)
                                .anonceConcerne(saved)
                                .build()));

                // Notifier l'annonceur pour le paiement
                notificationService.createNotification(
                                saved.getAnnonceur(),
                                "Annonce Validée - Paiement requis",
                                "Votre annonce '" + saved.getTitreAnonce()
                                                + "' est validée. Veuillez procéder au paiement pour l'activer.",
                                "VALIDATION_PAIEMENT",
                                saved);

                return saved;
        }

        @Transactional
        public Anonce activateAnonce(@NonNull Long id) {
                Anonce anonce = repository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Anonce non trouvée"));
                anonce.setStatutValidation(StatutValidation.ACTIVEE);
                Anonce saved = repository.save(anonce);

                notificationService.createNotification(
                                saved.getAnnonceur(),
                                "Annonce Activée",
                                "Félicitations ! Votre annonce '" + saved.getTitreAnonce()
                                                + "' est maintenant en ligne.",
                                "ACTIVATION",
                                saved);

                return saved;
        }

        @Transactional
        @SuppressWarnings("null")
        public Anonce rejectAnonce(@NonNull Long id, String reason, Utilisateur admin) {

                Anonce anonce = repository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Anonce non trouvée"));

                StatutValidation ancienStatut = anonce.getStatutValidation();
                anonce.setStatutValidation(StatutValidation.REFUSE);
                anonce.setMotifRefusAdmin(reason);
                Anonce saved = repository.save(anonce);

                // Historique
                historiqueValidationRepository.save(java.util.Objects.requireNonNull(HistoriqueValidation.builder()
                                .actionEffectuee("REFUS")
                                .commentaireAdmin(reason)
                                .ancienStatut(ancienStatut)
                                .nouveauStatut(StatutValidation.REFUSE)
                                .adminResponsable(admin)
                                .anonceConcerne(saved)
                                .build()));

                notificationService.createNotification(
                                saved.getAnnonceur(),
                                "Annonce Refusée",
                                "Votre annonce '" + saved.getTitreAnonce() + "' a été refusée. Motif : " + reason,
                                "REFUS",
                                saved);

                return saved;
        }

        @Transactional(readOnly = true)
        public void archiveAnonce(@NonNull Long id, Utilisateur admin) {
                Anonce anonce = repository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Anonce non trouvée"));
                StatutValidation ancienStatut = anonce.getStatutValidation();
                anonce.archiver();
                Anonce saved = repository.save(anonce);

                historiqueValidationRepository.save(HistoriqueValidation.builder()
                                .actionEffectuee("ARCHIVAGE")
                                .adminResponsable(admin)
                                .anonceConcerne(saved)
                                .ancienStatut(ancienStatut)
                                .nouveauStatut(StatutValidation.ARCHIVE)
                                .build());
        }

        @Transactional
        public AnonceDto submitAnonceDto(Anonce anonce) {
                return AnonceDto.fromEntity(submitAnonce(anonce));
        }

        @Transactional(readOnly = true)
        public AnonceDto getAnonceDtoById(@NonNull Long id) {
                return AnonceDto.fromEntity(getAnonceById(id));
        }

        @Transactional
        public AnonceDto activateAnonceDto(@NonNull Long id) {
                return AnonceDto.fromEntity(activateAnonce(id));
        }

        @Transactional
        public AnonceDto validateAnonceDto(@NonNull Long id, int durationMonths,
                        Utilisateur admin) {
                return AnonceDto
                                .fromEntity(validateAnonce(id, durationMonths, admin));
        }

        @Transactional
        public AnonceDto rejectAnonceDto(@NonNull Long id, String reason,
                        Utilisateur admin) {
                return AnonceDto.fromEntity(rejectAnonce(id, reason, admin));
        }

        @Transactional
        public AnonceDto updateAnonce(@NonNull Long id, Anonce anonce) {
                Anonce existing = getAnonceById(id);
                existing.setTitreAnonce(anonce.getTitreAnonce());
                existing.setDescriptionDetaillee(anonce.getDescriptionDetaillee());
                existing.setPrixAfiche(anonce.getPrixAfiche());
                existing.setTypePrix(anonce.getTypePrix());
                existing.setVilleLocalisation(anonce.getVilleLocalisation());
                existing.setCategorie(anonce.getCategorie());
                existing.setDisponibilite(anonce.getDisponibilite());
                existing.setTypeAnnonce(anonce.getTypeAnnonce());
                if (anonce.getImageUrl() != null) {
                        existing.setImageUrl(anonce.getImageUrl());
                }
                existing.setStatutValidation(StatutValidation.EN_ATTENTE);
                Anonce saved = repository.save(existing);
                return AnonceDto.fromEntity(saved);
        }

        public Anonce saveAnonce(Anonce p) {
                return repository.save(p);
        }

        public void deleteAnonce(@NonNull Long id) {
                repository.deleteById(id);
        }

        public Anonce getAnonceById(@NonNull Long id) {
                return repository.findById(id).orElseThrow(() -> new RuntimeException("Anonce non trouvée"));
        }
}
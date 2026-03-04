package com.publicity_platform.project.service;

import com.publicity_platform.project.entity.ServiceOffre;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.enumm.StatutPaiementService;
import com.publicity_platform.project.enumm.StatutService;
import com.publicity_platform.project.repository.ServiceOffreRepository;
import com.publicity_platform.project.repository.UtilisateurRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ServiceOffreService {

    private final ServiceOffreRepository repository;
    private final NotificationService notificationService;
    private final UtilisateurRepository utilisateurRepository;

    public ServiceOffreService(ServiceOffreRepository repository,
            NotificationService notificationService,
            UtilisateurRepository utilisateurRepository) {
        this.repository = repository;
        this.notificationService = notificationService;
        this.utilisateurRepository = utilisateurRepository;
    }

    @Transactional
    public ServiceOffre submit(ServiceOffre s) {
        if (s.getDemandeur() != null && s.getDemandeur().getId() != null) {
            Utilisateur u = utilisateurRepository.findById(s.getDemandeur().getId()).orElse(s.getDemandeur());
            s.setDemandeur(u);
        }
        s.setStatutService(StatutService.EN_ATTENTE);
        s.setStatutPaiement(StatutPaiementService.NON_INITIE);
        ServiceOffre saved = repository.save(s);
        notifyAdminsNewService(saved);
        return saved;
    }

    @Transactional(readOnly = true)
    public ServiceOffre getById(@NonNull Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Service non trouvé"));
    }

    @Transactional(readOnly = true)
    public List<ServiceOffre> searchActiveByVilleAndDate(String ville, LocalDateTime from, LocalDateTime to) {
        return repository.searchByVilleAndDate(ville, StatutService.ACTIVEE, from, to);
    }

    @Transactional(readOnly = true)
    public List<ServiceOffre> getPending() {
        return repository.findByStatutService(StatutService.EN_ATTENTE);
    }

    @Transactional(readOnly = true)
    public List<ServiceOffre> getAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<ServiceOffre> getByDemandeur(@NonNull Long userId) {
        return repository.findByDemandeurId(userId);
    }

    @Transactional
    public ServiceOffre validateService(@NonNull Long id, int durationMonths, Utilisateur admin) {
        ServiceOffre s = getById(id);
        s.valider(durationMonths);
        ServiceOffre saved = repository.save(s);
        notificationService.createNotification(
                saved.getDemandeur(),
                "Service validé - Paiement requis",
                "Votre service '" + saved.getTitreService() + "' est validé. Merci de procéder au paiement.",
                "SERVICE_VALIDATION",
                null);
        return saved;
    }

    @Transactional
    public ServiceOffre proceedToPayment(@NonNull Long id, Utilisateur admin) {
        ServiceOffre s = getById(id);
        s.setStatutPaiement(StatutPaiementService.EN_ATTENTE);
        ServiceOffre saved = repository.save(s);
        notificationService.createNotification(
                saved.getDemandeur(),
                "Paiement requis",
                "Veuillez procéder au paiement pour le service '" + saved.getTitreService() + "'.",
                "SERVICE_PAIEMENT_DEMANDE",
                null);
        return saved;
    }

    @Transactional
    public ServiceOffre validatePayment(@NonNull Long id, Utilisateur admin) {
        ServiceOffre s = getById(id);
        s.setStatutPaiement(StatutPaiementService.PAYE);
        s.activer();
        if (s.getDatePublication() == null) {
            s.setDatePublication(LocalDateTime.now());
        }
        ServiceOffre saved = repository.save(s);
        notificationService.createNotification(
                saved.getDemandeur(),
                "Service activé",
                "Votre service '" + saved.getTitreService() + "' est maintenant en ligne.",
                "SERVICE_ACTIVATION",
                null);
        return saved;
    }

    @Transactional
    public ServiceOffre activateWithoutPayment(@NonNull Long id, Utilisateur admin) {
        ServiceOffre s = getById(id);
        s.setStatutPaiement(StatutPaiementService.PAYE);
        s.activer();
        if (s.getDatePublication() == null) {
            s.setDatePublication(LocalDateTime.now());
        }
        ServiceOffre saved = repository.save(s);
        notificationService.createNotification(
                saved.getDemandeur(),
                "Service validé",
                "Votre service '" + saved.getTitreService() + "' a été validé et activé.",
                "SERVICE_ACTIVATION",
                null);
        return saved;
    }

    @Transactional
    public ServiceOffre rejectService(@NonNull Long id, String reason, Utilisateur admin) {
        ServiceOffre s = getById(id);
        s.setStatutService(StatutService.REFUSE);
        s.setMotifRefusAdmin(reason);
        ServiceOffre saved = repository.save(s);
        notificationService.createNotification(
                saved.getDemandeur(),
                "Service refusé",
                "Votre service '" + saved.getTitreService() + "' a été refusé. Motif: " + reason,
                "SERVICE_REFUS",
                null);
        return saved;
    }

    @Transactional
    public ServiceOffre updateService(@NonNull Long id, ServiceOffre payload, Utilisateur admin) {
        ServiceOffre s = getById(id);
        s.setTitreService(payload.getTitreService());
        s.setDescriptionDetaillee(payload.getDescriptionDetaillee());
        s.setPrixAfiche(payload.getPrixAfiche());
        s.setTypePrix(payload.getTypePrix());
        s.setVilleLocalisation(payload.getVilleLocalisation());
        s.setModeTravail(payload.getModeTravail());
        s.setTypeContrat(payload.getTypeContrat());
        s.setImageUrl(payload.getImageUrl());
        s.setCategorie(payload.getCategorie());
        ServiceOffre saved = repository.save(s);
        notificationService.createNotification(
                saved.getDemandeur(),
                "Service modifié",
                "Votre service '" + saved.getTitreService() + "' a été mis à jour par l'administration.",
                "SERVICE_MODIFIE",
                null);
        return saved;
    }

    @Transactional
    public void deleteService(@NonNull Long id, Utilisateur admin) {
        ServiceOffre s = getById(id);
        repository.deleteById(id);
        notificationService.createNotification(
                s.getDemandeur(),
                "Service supprimé",
                "Votre service '" + s.getTitreService() + "' a été supprimé par l'administration.",
                "SERVICE_SUPPRIME",
                null);
    }

    @Transactional
    public ServiceOffre featureService(@NonNull Long id, boolean premium, Utilisateur admin) {
        ServiceOffre s = getById(id);
        s.setAnnoncePremium(premium);
        return repository.save(s);
    }

    @Transactional
    public ServiceOffre archiveService(@NonNull Long id, Utilisateur admin) {
        ServiceOffre s = getById(id);
        s.archiver();
        return repository.save(s);
    }

    private void notifyAdminsNewService(ServiceOffre saved) {
        List<Utilisateur> admins = utilisateurRepository.findAll().stream()
                .filter(u -> u.getRoles().stream()
                        .anyMatch(r -> r.getName().equals("ROLE_ADJOINTADMIN")
                                || r.getName().equals("ROLE_SUPERADMIN")
                                || r.getName().equals("ADJOINTADMIN")
                                || r.getName().equals("SUPERADMIN")))
                .toList();
        for (Utilisateur admin : admins) {
            notificationService.createNotification(
                    admin,
                    "Nouveau service à évaluer",
                    "Le service '" + saved.getTitreService() + "' est en attente de validation.",
                    "SERVICE_NOUVEAU",
                    null);
        }
    }
}

package com.publicity_platform.project.service;

import com.publicity_platform.project.entity.Boutique;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.enumm.StatutBoutique;
import com.publicity_platform.project.enumm.TypeActivite;
import com.publicity_platform.project.repository.BoutiqueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BoutiqueService {

    private final BoutiqueRepository repository;

    public BoutiqueService(BoutiqueRepository repository) {
        this.repository = repository;
    }

    public List<Boutique> getBoutiquesActives() {
        return repository.findByStatutBoutique(StatutBoutique.ACTIVE);
    }

    public List<Boutique> getBoutiquesEnAttente() {
        return repository.findByStatutBoutique(StatutBoutique.EN_ATTENTE);
    }

    public List<Boutique> getBoutiquesByType(TypeActivite type) {
        return repository.findByTypeActivite(type);
    }

    public Boutique getBoutiqueById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Boutique non trouvée"));
    }

    public Boutique getBoutiqueByProprietaire(Long proprietaireId) {
        return repository.findByProprietaireId(proprietaireId)
                .orElse(null);
    }

    @Transactional
    public Boutique creerBoutique(Boutique boutique, Utilisateur proprietaire) {
        // Vérifier qu'il n'a pas déjà une boutique
        if (repository.findByProprietaireId(proprietaire.getId()).isPresent()) {
            throw new RuntimeException("Cet utilisateur possède déjà une boutique");
        }
        boutique.setProprietaire(proprietaire);
        boutique.setStatutBoutique(StatutBoutique.EN_ATTENTE);
        return repository.save(boutique);
    }

    @Transactional
    public Boutique modifierBoutique(Long id, Boutique modifications, Utilisateur demandeur) {
        Boutique existante = getBoutiqueById(id);
        // Seul le propriétaire peut modifier sa boutique
        if (!existante.getProprietaire().getId().equals(demandeur.getId())) {
            throw new RuntimeException("Accès refusé : vous n'êtes pas le propriétaire de cette boutique");
        }
        if (modifications.getNomBoutique() != null) {
            existante.setNomBoutique(modifications.getNomBoutique());
        }
        if (modifications.getDescriptionBoutique() != null) {
            existante.setDescriptionBoutique(modifications.getDescriptionBoutique());
        }
        if (modifications.getLogoUrl() != null) {
            existante.setLogoUrl(modifications.getLogoUrl());
        }
        if (modifications.getBanniereUrl() != null) {
            existante.setBanniereUrl(modifications.getBanniereUrl());
        }
        if (modifications.getTelephoneBoutique() != null) {
            existante.setTelephoneBoutique(modifications.getTelephoneBoutique());
        }
        if (modifications.getAdresseComplete() != null) {
            existante.setAdresseComplete(modifications.getAdresseComplete());
        }
        return repository.save(existante);
    }

    /** Activer une boutique (admin uniquement) */
    @Transactional
    public Boutique activerBoutique(Long id) {
        Boutique boutique = getBoutiqueById(id);
        boutique.setStatutBoutique(StatutBoutique.ACTIVE);
        return repository.save(boutique);
    }

    /** Suspendre une boutique (admin uniquement) */
    @Transactional
    public Boutique suspendreBoutique(Long id) {
        Boutique boutique = getBoutiqueById(id);
        boutique.setStatutBoutique(StatutBoutique.SUSPENDUE);
        return repository.save(boutique);
    }

    public List<Boutique> getTopBoutiques() {
        return repository.findTop10ByStatutBoutiqueOrderByNoteMoyenneDesc(StatutBoutique.ACTIVE);
    }
}

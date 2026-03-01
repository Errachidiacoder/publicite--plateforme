package com.publicity_platform.project.service;

import com.publicity_platform.project.entity.Avis;
import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.repository.AvisRepository;
import com.publicity_platform.project.repository.ProduitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AvisService {

    private final AvisRepository avisRepository;
    private final ProduitRepository produitRepository;

    public AvisService(AvisRepository avisRepository, ProduitRepository produitRepository) {
        this.avisRepository = avisRepository;
        this.produitRepository = produitRepository;
    }

    public List<Avis> getAvisProduit(Long produitId) {
        return avisRepository.findByProduitIdOrderByDateAvisDesc(produitId);
    }

    public List<Avis> getAvisUtilisateur(Long utilisateurId) {
        return avisRepository.findByUtilisateurId(utilisateurId);
    }

    /**
     * Crée un avis et met à jour la note moyenne du produit.
     */
    @Transactional
    public Avis creerAvis(Long produitId, Utilisateur utilisateur, int note, String commentaire) {
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        Avis avis = new Avis();
        avis.setProduit(produit);
        avis.setUtilisateur(utilisateur);
        avis.setNote(note);
        avis.setCommentaire(commentaire);
        Avis saved = avisRepository.save(avis);

        // Mettre à jour la note moyenne et le nombre d'avis du produit
        mettreAJourStatsProduit(produit);

        return saved;
    }

    /**
     * Recalcule la note moyenne et le compteur d'avis.
     */
    private void mettreAJourStatsProduit(Produit produit) {
        Double moyenne = avisRepository.findAverageNoteByProduitId(produit.getId());
        long total = avisRepository.countByProduitId(produit.getId());

        produit.setNoteMoyenne(moyenne != null ? moyenne : 0.0);
        produit.setNombreAvis((int) total);
        produitRepository.save(produit);
    }
}

package com.publicity_platform.project.service;

import com.publicity_platform.project.dto.UtilisateurDto;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.repository.UtilisateurRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UtilisateurService {

    private final UtilisateurRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UtilisateurService(UtilisateurRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public UtilisateurDto getUserProfile(Long id) {
        Utilisateur user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return UtilisateurDto.fromEntity(user);
    }

    @Transactional
    public UtilisateurDto updateProfile(Long id, UtilisateurDto dto) {
        Utilisateur user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        user.setNomComplet(dto.getNomComplet());
        user.setNumeroDeTelephone(dto.getNumeroDeTelephone());
        // L'email est généralement l'identifiant, on évite de le changer ici pour plus
        // de simplicité

        Utilisateur saved = repository.save(user);
        return UtilisateurDto.fromEntity(saved);
    }

    @Transactional
    public void changePassword(Long id, String oldPassword, String newPassword) {
        Utilisateur user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("L'ancien mot de passe est incorrect");
        }

        user.setMotDePasseHache(passwordEncoder.encode(newPassword));
        repository.save(user);
    }
}

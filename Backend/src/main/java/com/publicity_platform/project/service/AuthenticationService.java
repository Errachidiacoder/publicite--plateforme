package com.publicity_platform.project.service;

import com.publicity_platform.project.dto.AuthenticationRequest;
import com.publicity_platform.project.dto.AuthenticationResponse;
import com.publicity_platform.project.dto.RegisterRequest;
import com.publicity_platform.project.entity.Role;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.repository.RoleRepository;
import com.publicity_platform.project.repository.UtilisateurRepository;
import com.publicity_platform.project.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class AuthenticationService {

        private final UtilisateurRepository repository;
        private final RoleRepository roleRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        public AuthenticationService(UtilisateurRepository repository,
                        RoleRepository roleRepository,
                        PasswordEncoder passwordEncoder,
                        JwtService jwtService,
                        AuthenticationManager authenticationManager) {
                this.repository = repository;
                this.roleRepository = roleRepository;
                this.passwordEncoder = passwordEncoder;
                this.jwtService = jwtService;
                this.authenticationManager = authenticationManager;
        }

        public AuthenticationResponse register(RegisterRequest request) {
                // Déterminer le rôle selon le type d'activité
                final String roleName;
                if (request.getTypeActivite() != null && !request.getTypeActivite().isBlank()) {
                        roleName = request.getTypeActivite();
                } else {
                        roleName = "CLIENT";
                }

                Role assignedRole = roleRepository.findByName(roleName)
                                .orElseGet(() -> roleRepository.save(new Role(roleName)));

                Utilisateur user = Utilisateur.builder()
                                .nomComplet(request.getNomComplet())
                                .adresseEmail(request.getEmail())
                                .motDePasseHache(passwordEncoder.encode(request.getPassword()))
                                .numeroDeTelephone(request.getTelephone())
                                .roles(Set.of(assignedRole))
                                .compteActif(true)
                                .emailVerifie(false)
                                .build();

                // Ajouter la ville si fournie
                if (request.getVille() != null && !request.getVille().isBlank()) {
                        user.setVille(request.getVille());
                }

                @SuppressWarnings("null")
                Utilisateur savedUser = repository.save(user);
                String jwtToken = jwtService.generateToken(savedUser);
                String primaryRole = getPrimaryRole(savedUser);

                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .role(primaryRole)
                                .nomComplet(savedUser.getNomComplet())
                                .email(savedUser.getAdresseEmail())
                                .id(savedUser.getId())
                                .build();
        }

        public AuthenticationResponse authenticate(AuthenticationRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

                Utilisateur user = repository.findByAdresseEmail(request.getEmail())
                                .orElseThrow();
                String jwtToken = jwtService.generateToken(user);
                String primaryRole = getPrimaryRole(user);

                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .role(primaryRole)
                                .nomComplet(user.getNomComplet())
                                .email(user.getAdresseEmail())
                                .id(user.getId())
                                .build();
        }

        /**
         * Retourne le rôle le plus privilégié.
         * Priorité : SUPERADMIN > ADJOINTADMIN > SARL > MAGASIN > COOPERATIVE >
         * AUTO_ENTREPRENEUR > LIVREUR > STOCKEUR > ANNONCEUR > CLIENT > VISITEUR
         */
        private String getPrimaryRole(Utilisateur user) {
                Set<Role> roles = user.getRoles();
                if (roles.stream().anyMatch(r -> r.getName().equals("SUPERADMIN")))
                        return "SUPERADMIN";
                if (roles.stream().anyMatch(r -> r.getName().equals("ADJOINTADMIN")))
                        return "ADJOINTADMIN";
                if (roles.stream().anyMatch(r -> r.getName().equals("SARL")))
                        return "SARL";
                if (roles.stream().anyMatch(r -> r.getName().equals("MAGASIN")))
                        return "MAGASIN";
                if (roles.stream().anyMatch(r -> r.getName().equals("COOPERATIVE")))
                        return "COOPERATIVE";
                if (roles.stream().anyMatch(r -> r.getName().equals("AUTO_ENTREPRENEUR")))
                        return "AUTO_ENTREPRENEUR";
                if (roles.stream().anyMatch(r -> r.getName().equals("LIVREUR")))
                        return "LIVREUR";
                if (roles.stream().anyMatch(r -> r.getName().equals("STOCKEUR")))
                        return "STOCKEUR";
                if (roles.stream().anyMatch(r -> r.getName().equals("ANNONCEUR")))
                        return "ANNONCEUR";
                if (roles.stream().anyMatch(r -> r.getName().equals("CLIENT")))
                        return "CLIENT";
                return "VISITEUR";
        }
}

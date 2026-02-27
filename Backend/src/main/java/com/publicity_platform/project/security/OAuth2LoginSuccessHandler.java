package com.publicity_platform.project.security;

import com.publicity_platform.project.entity.Role;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.repository.RoleRepository;
import com.publicity_platform.project.repository.UtilisateurRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.Set;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;

    public OAuth2LoginSuccessHandler(JwtService jwtService,
            UtilisateurRepository utilisateurRepository,
            RoleRepository roleRepository) {
        this.jwtService = jwtService;
        this.utilisateurRepository = utilisateurRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");

        // Handle Facebook differences if needed
        if (email == null) {
            email = (String) attributes.get("id") + "@facebook.com";
        }

        Utilisateur user = utilisateurRepository.findByAdresseEmail(email)
                .orElseGet(() -> {
                    Role visitorRole = roleRepository.findByName("VISITEUR")
                            .orElseGet(() -> roleRepository.save(new Role("VISITEUR")));

                    Utilisateur newUser = Utilisateur.builder()
                            .adresseEmail((String) attributes.get("email"))
                            .nomComplet((String) attributes.get("name"))
                            .motDePasseHache("SOCIAL_AUTH_NO_PASSWORD") // Placeholder
                            .roles(Set.of(visitorRole))
                            .compteActif(true)
                            .emailVerifie(true)
                            .build();
                    return utilisateurRepository.save(newUser);
                });

        String token = jwtService.generateToken(user);

        // Redirect to frontend with token info
        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:4200/login")
                .queryParam("token", token)
                .queryParam("email", user.getAdresseEmail())
                .queryParam("name", user.getNomComplet())
                .queryParam("role", getPrimaryRole(user))
                .queryParam("id", user.getId())
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private String getPrimaryRole(Utilisateur user) {
        Set<Role> roles = user.getRoles();
        if (roles.stream().anyMatch(r -> r.getName().equals("SUPERADMIN")))
            return "SUPERADMIN";
        if (roles.stream().anyMatch(r -> r.getName().equals("ADJOINTADMIN")))
            return "ADJOINTADMIN";
        if (roles.stream().anyMatch(r -> r.getName().equals("ANNONCEUR")))
            return "ANNONCEUR";
        if (roles.stream().anyMatch(r -> r.getName().equals("CLIENT")))
            return "CLIENT";
        return "VISITEUR";
    }
}

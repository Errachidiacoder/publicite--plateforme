package com.publicity_platform.project.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        log.info("JWT Filter: {} {} | Auth header present: {}", request.getMethod(), request.getRequestURI(),
                authHeader != null);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.info("JWT Filter: No Bearer token, continuing without auth");
            filterChain.doFilter(request, response);
            return;
        }
        try {
            final String jwt = authHeader.substring(7);
            final String userEmail = jwtService.extractUsername(jwt);
            log.info("JWT Filter: Extracted email={} from token", userEmail);
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                log.info("JWT Filter: Loaded user={}, authorities={}", userDetails.getUsername(),
                        userDetails.getAuthorities());
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.info("JWT Filter: Authentication SET for user={}", userEmail);
                } else {
                    log.warn("JWT Filter: Token INVALID for user={}", userEmail);
                }
            } else {
                log.info("JWT Filter: Skipped - email={}, existingAuth={}", userEmail,
                        SecurityContextHolder.getContext().getAuthentication() != null);
            }
        } catch (Exception e) {
            log.error("JWT Filter: Authentication FAILED: {}", e.getMessage(), e);
        }
        filterChain.doFilter(request, response);
    }
}

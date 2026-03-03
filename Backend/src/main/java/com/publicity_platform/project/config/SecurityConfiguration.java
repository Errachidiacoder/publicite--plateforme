package com.publicity_platform.project.config;

import com.publicity_platform.project.security.JwtAuthenticationFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfiguration {

        private final JwtAuthenticationFilter jwtAuthFilter;
        private final AuthenticationProvider authenticationProvider;
        private final com.publicity_platform.project.security.OAuth2LoginSuccessHandler oauth2SuccessHandler;
        private static final Logger log = LoggerFactory.getLogger(SecurityConfiguration.class);

        public SecurityConfiguration(JwtAuthenticationFilter jwtAuthFilter,
                        AuthenticationProvider authenticationProvider,
                        com.publicity_platform.project.security.OAuth2LoginSuccessHandler oauth2SuccessHandler) {
                this.jwtAuthFilter = jwtAuthFilter;
                this.authenticationProvider = authenticationProvider;
                this.oauth2SuccessHandler = oauth2SuccessHandler;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http,
                        ObjectProvider<ClientRegistrationRepository> clientRegistrationRepositoryProvider)
                        throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(AbstractHttpConfigurer::disable)
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**")
                                                .permitAll()
                                                .requestMatchers("/api/v1/auth/**").permitAll()
                                                .requestMatchers("/h2-console/**").permitAll()
                                                .requestMatchers("/error").permitAll()
                                                // Public GET access to catalogs
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/v1/categories/**",
                                                                "/api/v1/boutiques/**",
                                                                "/api/v1/avis/**")

                                                .permitAll()

                                                // Services security mapping
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/v1/services/search",
                                                                "/api/v1/services/*")
                                                .permitAll()
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/v1/services/submit")
                                                .authenticated()
                                                .requestMatchers("/api/v1/admin/services/**")
                                                .hasAnyRole("ADJOINTADMIN", "SUPERADMIN")

                                                // Anonces security mapping
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/v1/anonces/active")
                                                .authenticated()
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/v1/anonces", "/api/v1/anonces/**")
                                                .permitAll()
                                                // TEMP: permitAll to debug 401 – set back to .authenticated() after fix
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/v1/anonces/submit")
                                                .permitAll()
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/v1/anonces/*/activate-mock")
                                                .authenticated()
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/v1/anonces/**")
                                                .authenticated()

                                                // Messages security mapping
                                                .requestMatchers("/api/v1/conversations/**", "/api/v1/messages/**").authenticated()

                                                // Notifications security mapping
                                                .requestMatchers("/api/v1/notifications/**").authenticated()

                                                // Media access
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/v1/media/files/**")
                                                .permitAll()
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/v1/media/**")
                                                .authenticated()

                                                // Users & Admin
                                                .requestMatchers("/api/v1/users/**").authenticated()
                                                .requestMatchers("/api/v1/admin/**")
                                                .hasAnyRole("ADJOINTADMIN", "SUPERADMIN")

                                                // Product marketplace (public GET)
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/v1/produits",
                                                                "/api/v1/produits/**",
                                                                "/api/v1/files/**")
                                                .permitAll()

                                                // Merchant endpoints (authenticated)
                                                .requestMatchers("/api/v1/merchant/**").authenticated()

                                                .anyRequest().authenticated())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authenticationProvider(authenticationProvider)
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint((request, response, authException) -> {
                                                        String ah = request.getHeader("Authorization");
                                                        System.out.println("DEBUG 401: at " + request.getRequestURI());
                                                        System.out.println("DEBUG 401: Exception: "
                                                                        + authException.getMessage());
                                                        System.out.println("DEBUG 401: Header: " + (ah != null
                                                                        ? ah.substring(0, Math.min(ah.length(), 15))
                                                                                        + "..."
                                                                        : "MISSING"));

                                                        response.setHeader("Access-Control-Allow-Origin",
                                                                        "http://localhost:4200");
                                                        response.setHeader("Access-Control-Allow-Methods",
                                                                        "POST, GET, OPTIONS, DELETE, PUT");
                                                        response.setHeader("Access-Control-Allow-Headers", "*");
                                                        response.setHeader("Access-Control-Allow-Credentials", "true");
                                                        response.setStatus(401);
                                                        response.setContentType("application/json");
                                                        response.getWriter().write(
                                                                        "{\"error\":\"Non authentifié\",\"message\":\""
                                                                                        + authException.getMessage()
                                                                                        + "\"}");
                                                })
                                                .accessDeniedHandler((request, response, accessDeniedException) -> {
                                                        log.error("Access Denied error at {} {}: {}. Auth header: {}",
                                                                        request.getMethod(), request.getRequestURI(),
                                                                        accessDeniedException.getMessage(),
                                                                        request.getHeader("Authorization"));
                                                        response.setStatus(403);
                                                        response.setContentType("application/json");
                                                        response.getWriter().write(
                                                                        "{\"error\":\"Accès refusé\",\"message\":\""
                                                                                        + accessDeniedException
                                                                                                        .getMessage()
                                                                                        + "\"}");
                                                }));

                if (clientRegistrationRepositoryProvider.getIfAvailable() != null) {
                        http.oauth2Login(oauth2 -> oauth2.successHandler(oauth2SuccessHandler));
                }

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOriginPatterns(List.of("http://localhost:*"));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(true);
                config.setExposedHeaders(List.of("Authorization"));

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }

        /**
         * Prevent the JwtAuthenticationFilter from being registered as a Servlet
         * filter.
         * It should ONLY run as part of the Spring Security filter chain.
         */
        @Bean
        public FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration(JwtAuthenticationFilter filter) {
                FilterRegistrationBean<JwtAuthenticationFilter> registration = new FilterRegistrationBean<>(filter);
                registration.setEnabled(false);
                return registration;
        }
}

package com.publicity_platform.project.config;

import com.publicity_platform.project.security.JwtAuthenticationFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
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

        public SecurityConfiguration(JwtAuthenticationFilter jwtAuthFilter,
                        AuthenticationProvider authenticationProvider,
                        com.publicity_platform.project.security.OAuth2LoginSuccessHandler oauth2SuccessHandler) {
                this.jwtAuthFilter = jwtAuthFilter;
                this.authenticationProvider = authenticationProvider;
                this.oauth2SuccessHandler = oauth2SuccessHandler;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(AbstractHttpConfigurer::disable)
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**")
                                                .permitAll()
                                                .requestMatchers("/api/v1/auth/**").permitAll()
                                                .requestMatchers("/h2-console/**").permitAll()
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/v1/categories", "/api/v1/categories/**")
                                                .permitAll()
                                                // /active is user-specific, must be authenticated BEFORE the wildcard
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/v1/produits/active")
                                                .authenticated()
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/v1/produits", "/api/v1/produits/**")
                                                .permitAll()
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/v1/media/upload")
                                                .authenticated()
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/v1/media/files/**")
                                                .permitAll()
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/v1/produits/submit")
                                                .authenticated()
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/v1/boutiques", "/api/v1/boutiques/**")
                                                .permitAll()
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/v1/avis", "/api/v1/avis/**")
                                                .permitAll()
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/v1/produits/*/activate-mock")
                                                .authenticated()
                                                .requestMatchers("/api/v1/users/**").authenticated()
                                                .requestMatchers("/api/v1/admin/**")
                                                .hasAnyRole("ADJOINTADMIN", "SUPERADMIN")
                                                // Authenticated endpoints for product operations
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/v1/produits/**")
                                                .authenticated()
                                                // Media upload: permit all since produitId is already scoped to an
                                                // authenticated product
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/v1/media/**")
                                                .permitAll()
                                                .anyRequest().authenticated())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authenticationProvider(authenticationProvider)
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                                .oauth2Login(oauth2 -> oauth2
                                                .successHandler(oauth2SuccessHandler))
                                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint((request, response, authException) -> {
                                                        response.setStatus(401);
                                                        response.setContentType("application/json");
                                                        response.getWriter().write(
                                                                        "{\"error\":\"Non authentifié\",\"message\":\""
                                                                                        + authException.getMessage()
                                                                                        + "\"}");
                                                })
                                                .accessDeniedHandler((request, response, accessDeniedException) -> {
                                                        response.setStatus(403);
                                                        response.setContentType("application/json");
                                                        response.getWriter().write(
                                                                        "{\"error\":\"Accès refusé\",\"message\":\""
                                                                                        + accessDeniedException
                                                                                                        .getMessage()
                                                                                        + "\"}");
                                                }));

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

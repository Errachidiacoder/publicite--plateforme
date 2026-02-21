package com.publicity_platform.project.dto;

public class AuthenticationResponse {
    private String token;
    private String role;
    private String nomComplet;
    private String email;

    public AuthenticationResponse() {
    }

    public AuthenticationResponse(String token, String role, String nomComplet, String email) {
        this.token = token;
        this.role = role;
        this.nomComplet = nomComplet;
        this.email = email;
    }

    public static AuthenticationResponseBuilder builder() {
        return new AuthenticationResponseBuilder();
    }

    public static class AuthenticationResponseBuilder {
        private String token;
        private String role;
        private String nomComplet;
        private String email;

        public AuthenticationResponseBuilder token(String token) {
            this.token = token;
            return this;
        }

        public AuthenticationResponseBuilder role(String role) {
            this.role = role;
            return this;
        }

        public AuthenticationResponseBuilder nomComplet(String nomComplet) {
            this.nomComplet = nomComplet;
            return this;
        }

        public AuthenticationResponseBuilder email(String email) {
            this.email = email;
            return this;
        }

        public AuthenticationResponse build() {
            return new AuthenticationResponse(token, role, nomComplet, email);
        }
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getNomComplet() {
        return nomComplet;
    }

    public void setNomComplet(String nomComplet) {
        this.nomComplet = nomComplet;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}

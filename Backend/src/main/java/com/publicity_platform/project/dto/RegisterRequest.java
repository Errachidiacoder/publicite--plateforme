package com.publicity_platform.project.dto;

public class RegisterRequest {
    private String nomComplet;
    private String email;
    private String password;
    private String telephone;

    public RegisterRequest() {
    }

    public RegisterRequest(String nomComplet, String email, String password, String telephone) {
        this.nomComplet = nomComplet;
        this.email = email;
        this.password = password;
        this.telephone = telephone;
    }

    public static RegisterRequestBuilder builder() {
        return new RegisterRequestBuilder();
    }

    public static class RegisterRequestBuilder {
        private String nomComplet;
        private String email;
        private String password;
        private String telephone;

        public RegisterRequestBuilder nomComplet(String nomComplet) {
            this.nomComplet = nomComplet;
            return this;
        }

        public RegisterRequestBuilder email(String email) {
            this.email = email;
            return this;
        }

        public RegisterRequestBuilder password(String password) {
            this.password = password;
            return this;
        }

        public RegisterRequestBuilder telephone(String telephone) {
            this.telephone = telephone;
            return this;
        }

        public RegisterRequest build() {
            return new RegisterRequest(nomComplet, email, password, telephone);
        }
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }
}

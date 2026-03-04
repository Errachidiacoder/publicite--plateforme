package com.publicity_platform.project.dto;

import java.util.List;

public class PanierDto {
    private Long id;
    private List<LignePanierDto> lignes;
    private int totalItems;
    private Double totalAmount;

    public PanierDto() {
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<LignePanierDto> getLignes() {
        return lignes;
    }

    public void setLignes(List<LignePanierDto> lignes) {
        this.lignes = lignes;
    }

    public int getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }
}

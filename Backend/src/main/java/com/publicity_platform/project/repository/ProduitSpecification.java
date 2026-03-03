package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.enumm.StatutProduit;
import com.publicity_platform.project.enumm.TypeActivite;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Spécifications JPA pour le filtrage dynamique des produits.
 */
public class ProduitSpecification {

    private ProduitSpecification() {
    }

    public static Specification<Produit> withFilters(
            String keyword,
            List<Long> categorieIds,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            TypeActivite merchantType,
            StatutProduit statut) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always filter by status (default ACTIVE for public)
            if (statut != null) {
                predicates.add(cb.equal(root.get("statutProduit"), statut));
            }

            // Keyword search (nom + descriptionCourte + tags)
            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                Predicate nomMatch = cb.like(cb.lower(root.get("titreProduit")), pattern);
                Predicate descMatch = cb.like(cb.lower(root.get("descriptionCourte")), pattern);
                Predicate tagMatch = cb.like(cb.lower(root.get("tags")), pattern);
                predicates.add(cb.or(nomMatch, descMatch, tagMatch));
            }

            // Category filter (including subcategories)
            if (categorieIds != null && !categorieIds.isEmpty()) {
                predicates.add(root.get("categorie").get("id").in(categorieIds));
            }

            // Price range filter
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("prix"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("prix"), maxPrice));
            }

            // Merchant type filter
            if (merchantType != null) {
                predicates.add(cb.equal(root.get("boutique").get("typeActivite"), merchantType));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

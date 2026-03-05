package com.publicity_platform.project.enumm;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Converter(autoApply = true)
public class StatutProduitConverter implements AttributeConverter<StatutProduit, String> {

    private static final Logger log = LoggerFactory.getLogger(StatutProduitConverter.class);

    @Override
    public String convertToDatabaseColumn(StatutProduit attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }

    @Override
    public StatutProduit convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        try {
            return StatutProduit.valueOf(dbData.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown StatutProduit value in database: '{}'. Defaulting to DRAFT.", dbData);
            return StatutProduit.DRAFT;
        }
    }
}

package com.publicity_platform.project.enumm;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Converter(autoApply = true)
public class TypeAnnonceConverter implements AttributeConverter<TypeAnnonce, String> {

    private static final Logger log = LoggerFactory.getLogger(TypeAnnonceConverter.class);

    @Override
    public String convertToDatabaseColumn(TypeAnnonce attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }

    @Override
    public TypeAnnonce convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        try {
            return TypeAnnonce.valueOf(dbData.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown TypeAnnonce value in database: '{}'. Defaulting to PRODUIT_PHYSIQUE.", dbData);
            return TypeAnnonce.PRODUIT_PHYSIQUE;
        }
    }
}

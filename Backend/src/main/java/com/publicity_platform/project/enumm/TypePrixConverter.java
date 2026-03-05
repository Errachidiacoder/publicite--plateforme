package com.publicity_platform.project.enumm;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Converter(autoApply = true)
public class TypePrixConverter implements AttributeConverter<TypePrix, String> {

    private static final Logger log = LoggerFactory.getLogger(TypePrixConverter.class);

    @Override
    public String convertToDatabaseColumn(TypePrix attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }

    @Override
    public TypePrix convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        try {
            return TypePrix.valueOf(dbData.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown TypePrix value in database: '{}'. Defaulting to PRIX_FIXE.", dbData);
            return TypePrix.PRIX_FIXE;
        }
    }
}

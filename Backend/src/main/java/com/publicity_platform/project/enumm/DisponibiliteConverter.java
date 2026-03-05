package com.publicity_platform.project.enumm;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Converter(autoApply = true)
public class DisponibiliteConverter implements AttributeConverter<Disponibilite, String> {

    private static final Logger log = LoggerFactory.getLogger(DisponibiliteConverter.class);

    @Override
    public String convertToDatabaseColumn(Disponibilite attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }

    @Override
    public Disponibilite convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        try {
            return Disponibilite.valueOf(dbData.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown Disponibilite value in database: '{}'. Defaulting to DISPONIBLE_IMMEDIATEMENT.", dbData);
            return Disponibilite.DISPONIBLE_IMMEDIATEMENT;
        }
    }
}

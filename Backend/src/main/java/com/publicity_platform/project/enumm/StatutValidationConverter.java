package com.publicity_platform.project.enumm;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Converter(autoApply = true)
public class StatutValidationConverter implements AttributeConverter<StatutValidation, String> {

    private static final Logger log = LoggerFactory.getLogger(StatutValidationConverter.class);

    @Override
    public String convertToDatabaseColumn(StatutValidation attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }

    @Override
    public StatutValidation convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        try {
            return StatutValidation.valueOf(dbData.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown StatutValidation value in database: '{}'. Defaulting to EN_ATTENTE.", dbData);
            return StatutValidation.EN_ATTENTE;
        }
    }
}

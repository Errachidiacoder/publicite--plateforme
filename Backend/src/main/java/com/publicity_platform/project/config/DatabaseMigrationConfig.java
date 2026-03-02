package com.publicity_platform.project.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

/**
 * Runs one-off database migrations that Hibernate's ddl-auto=update cannot
 * handle
 * (e.g., removing NOT NULL constraints from existing columns).
 */
@Configuration
public class DatabaseMigrationConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseMigrationConfig.class);

    @Bean
    public CommandLineRunner fixProduitIdNullable(DataSource dataSource) {
        return args -> {
            try (Connection conn = dataSource.getConnection();
                    Statement stmt = conn.createStatement()) {
                // Make produit_id nullable so that an annonce can be submitted without a
                // product
                stmt.execute("ALTER TABLE anonces MODIFY COLUMN produit_id BIGINT NULL");
                log.info("Migration OK: produit_id is now nullable in anonces table.");
            } catch (Exception e) {
                // Ignore if column is already nullable or table doesn't exist yet
                log.debug("Migration note (can be ignored): {}", e.getMessage());
            }
        };
    }
}

-- Fix: make produit_id nullable so anonces can be created without a product
ALTER TABLE anonces MODIFY COLUMN produit_id BIGINT NULL;

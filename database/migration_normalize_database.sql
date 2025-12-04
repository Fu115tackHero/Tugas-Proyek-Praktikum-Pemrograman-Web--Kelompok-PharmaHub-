-- ============================================
-- PHARMAHUB DATABASE NORMALIZATION MIGRATION
-- PostgreSQL Migration Script
-- Created: December 4, 2025
-- Purpose: Normalize database to 1NF-3NF standards
-- ============================================

-- This migration script performs the following:
-- 1. Normalizes product_details (removes array columns, creates separate tables)
-- 2. Normalizes product_reviews (removes review_images array)
-- 3. Removes redundant address column from users table
-- 4. Removes main_image_url from products table (use product_images exclusively)

BEGIN;

-- ============================================
-- STEP 1: NORMALIZE PRODUCT_DETAILS (1NF)
-- Remove multi-valued attributes (arrays)
-- ============================================

-- 1.1: Create normalized tables for product_details attributes

-- Table for product ingredients
CREATE TABLE IF NOT EXISTS product_ingredients (
    ingredient_id SERIAL PRIMARY KEY,
    detail_id INTEGER NOT NULL REFERENCES product_details(detail_id) ON DELETE CASCADE,
    ingredient TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_detail_ingredient UNIQUE (detail_id, ingredient)
);

CREATE INDEX idx_product_ingredients_detail ON product_ingredients(detail_id);

-- Table for important information
CREATE TABLE IF NOT EXISTS product_important_info (
    info_id SERIAL PRIMARY KEY,
    detail_id INTEGER NOT NULL REFERENCES product_details(detail_id) ON DELETE CASCADE,
    info_text TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_important_info_detail ON product_important_info(detail_id);

-- Table for precautions
CREATE TABLE IF NOT EXISTS product_precautions (
    precaution_id SERIAL PRIMARY KEY,
    detail_id INTEGER NOT NULL REFERENCES product_details(detail_id) ON DELETE CASCADE,
    precaution_text TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_precautions_detail ON product_precautions(detail_id);

-- Table for side effects
CREATE TABLE IF NOT EXISTS product_side_effects (
    side_effect_id SERIAL PRIMARY KEY,
    detail_id INTEGER NOT NULL REFERENCES product_details(detail_id) ON DELETE CASCADE,
    side_effect_text TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_side_effects_detail ON product_side_effects(detail_id);

-- Table for drug interactions
CREATE TABLE IF NOT EXISTS product_interactions (
    interaction_id SERIAL PRIMARY KEY,
    detail_id INTEGER NOT NULL REFERENCES product_details(detail_id) ON DELETE CASCADE,
    interaction_text TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_interactions_detail ON product_interactions(detail_id);

-- Table for indications
CREATE TABLE IF NOT EXISTS product_indications (
    indication_id SERIAL PRIMARY KEY,
    detail_id INTEGER NOT NULL REFERENCES product_details(detail_id) ON DELETE CASCADE,
    indication_text TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_indications_detail ON product_indications(detail_id);

-- 1.2: Migrate existing array data to new normalized tables

-- Migrate ingredients
INSERT INTO product_ingredients (detail_id, ingredient, display_order)
SELECT 
    detail_id, 
    unnest(ingredients) as ingredient,
    ROW_NUMBER() OVER (PARTITION BY detail_id ORDER BY ordinality) - 1 as display_order
FROM product_details
CROSS JOIN LATERAL unnest(ingredients) WITH ORDINALITY
WHERE ingredients IS NOT NULL AND array_length(ingredients, 1) > 0
ON CONFLICT (detail_id, ingredient) DO NOTHING;

-- Migrate important_info
INSERT INTO product_important_info (detail_id, info_text, display_order)
SELECT 
    detail_id, 
    unnest(important_info) as info_text,
    ROW_NUMBER() OVER (PARTITION BY detail_id ORDER BY ordinality) - 1 as display_order
FROM product_details
CROSS JOIN LATERAL unnest(important_info) WITH ORDINALITY
WHERE important_info IS NOT NULL AND array_length(important_info, 1) > 0;

-- Migrate precautions
INSERT INTO product_precautions (detail_id, precaution_text, display_order)
SELECT 
    detail_id, 
    unnest(precaution) as precaution_text,
    ROW_NUMBER() OVER (PARTITION BY detail_id ORDER BY ordinality) - 1 as display_order
FROM product_details
CROSS JOIN LATERAL unnest(precaution) WITH ORDINALITY
WHERE precaution IS NOT NULL AND array_length(precaution, 1) > 0;

-- Migrate side_effects
INSERT INTO product_side_effects (detail_id, side_effect_text, display_order)
SELECT 
    detail_id, 
    unnest(side_effects) as side_effect_text,
    ROW_NUMBER() OVER (PARTITION BY detail_id ORDER BY ordinality) - 1 as display_order
FROM product_details
CROSS JOIN LATERAL unnest(side_effects) WITH ORDINALITY
WHERE side_effects IS NOT NULL AND array_length(side_effects, 1) > 0;

-- Migrate interactions
INSERT INTO product_interactions (detail_id, interaction_text, display_order)
SELECT 
    detail_id, 
    unnest(interactions) as interaction_text,
    ROW_NUMBER() OVER (PARTITION BY detail_id ORDER BY ordinality) - 1 as display_order
FROM product_details
CROSS JOIN LATERAL unnest(interactions) WITH ORDINALITY
WHERE interactions IS NOT NULL AND array_length(interactions, 1) > 0;

-- Migrate indications
INSERT INTO product_indications (detail_id, indication_text, display_order)
SELECT 
    detail_id, 
    unnest(indication) as indication_text,
    ROW_NUMBER() OVER (PARTITION BY detail_id ORDER BY ordinality) - 1 as display_order
FROM product_details
CROSS JOIN LATERAL unnest(indication) WITH ORDINALITY
WHERE indication IS NOT NULL AND array_length(indication, 1) > 0;

-- 1.3: Drop array columns from product_details
ALTER TABLE product_details 
    DROP COLUMN IF EXISTS important_info,
    DROP COLUMN IF EXISTS ingredients,
    DROP COLUMN IF EXISTS precaution,
    DROP COLUMN IF EXISTS side_effects,
    DROP COLUMN IF EXISTS interactions,
    DROP COLUMN IF EXISTS indication;

-- ============================================
-- STEP 2: NORMALIZE PRODUCT_REVIEWS (1NF)
-- Remove review_images array column
-- ============================================

-- 2.1: Create review_images table
CREATE TABLE IF NOT EXISTS review_images (
    review_image_id SERIAL PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES product_reviews(review_id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_review_images_review ON review_images(review_id);

-- 2.2: Migrate existing review_images array data
INSERT INTO review_images (review_id, image_url, display_order)
SELECT 
    review_id,
    unnest(review_images) as image_url,
    ROW_NUMBER() OVER (PARTITION BY review_id ORDER BY ordinality) - 1 as display_order
FROM product_reviews
CROSS JOIN LATERAL unnest(review_images) WITH ORDINALITY
WHERE review_images IS NOT NULL AND array_length(review_images, 1) > 0;

-- 2.3: Drop review_images array column
ALTER TABLE product_reviews 
    DROP COLUMN IF EXISTS review_images;

-- ============================================
-- STEP 3: REMOVE REDUNDANT ADDRESS FROM USERS
-- We already have user_addresses table
-- ============================================

-- 3.1: Add is_default column to user_addresses if not exists
ALTER TABLE user_addresses 
    ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

-- 3.2: Migrate existing address data from users to user_addresses
-- Set is_default = TRUE for migrated addresses
INSERT INTO user_addresses (user_id, full_address, is_default)
SELECT 
    user_id,
    address as full_address,
    TRUE as is_default
FROM users
WHERE address IS NOT NULL 
    AND address != ''
    AND NOT EXISTS (
        SELECT 1 FROM user_addresses ua 
        WHERE ua.user_id = users.user_id 
        AND ua.full_address = users.address
    );

-- 3.3: Drop address column from users table
ALTER TABLE users 
    DROP COLUMN IF EXISTS address;

-- ============================================
-- STEP 4: REMOVE MAIN_IMAGE_URL FROM PRODUCTS
-- Use product_images table exclusively
-- ============================================

-- 4.1: Migrate main_image_url to product_images table
-- Set is_primary = TRUE for migrated images
INSERT INTO product_images (product_id, image_url, is_primary, image_order)
SELECT 
    product_id,
    main_image_url as image_url,
    TRUE as is_primary,
    0 as image_order
FROM products
WHERE main_image_url IS NOT NULL 
    AND main_image_url != ''
    AND NOT EXISTS (
        SELECT 1 FROM product_images pi 
        WHERE pi.product_id = products.product_id 
        AND pi.is_primary = TRUE
    );

-- 4.2: Drop main_image_url column from products
ALTER TABLE products 
    DROP COLUMN IF EXISTS main_image_url;

-- ============================================
-- STEP 5: CREATE HELPFUL VIEWS FOR QUERYING
-- Make it easier to query normalized data
-- ============================================

-- View to get product details with all related information
CREATE OR REPLACE VIEW product_details_complete AS
SELECT 
    pd.detail_id,
    pd.product_id,
    pd.generic_name,
    pd.uses,
    pd.how_it_works,
    pd.created_at,
    pd.updated_at,
    -- Aggregate arrays for compatibility with old queries
    COALESCE(array_agg(DISTINCT pi.ingredient ORDER BY pi.ingredient) FILTER (WHERE pi.ingredient IS NOT NULL), ARRAY[]::TEXT[]) as ingredients,
    COALESCE(array_agg(DISTINCT pii.info_text ORDER BY pii.display_order) FILTER (WHERE pii.info_text IS NOT NULL), ARRAY[]::TEXT[]) as important_info,
    COALESCE(array_agg(DISTINCT pp.precaution_text ORDER BY pp.display_order) FILTER (WHERE pp.precaution_text IS NOT NULL), ARRAY[]::TEXT[]) as precautions,
    COALESCE(array_agg(DISTINCT pse.side_effect_text ORDER BY pse.display_order) FILTER (WHERE pse.side_effect_text IS NOT NULL), ARRAY[]::TEXT[]) as side_effects,
    COALESCE(array_agg(DISTINCT pin.interaction_text ORDER BY pin.display_order) FILTER (WHERE pin.interaction_text IS NOT NULL), ARRAY[]::TEXT[]) as interactions,
    COALESCE(array_agg(DISTINCT pind.indication_text ORDER BY pind.display_order) FILTER (WHERE pind.indication_text IS NOT NULL), ARRAY[]::TEXT[]) as indications
FROM product_details pd
LEFT JOIN product_ingredients pi ON pd.detail_id = pi.detail_id
LEFT JOIN product_important_info pii ON pd.detail_id = pii.detail_id
LEFT JOIN product_precautions pp ON pd.detail_id = pp.detail_id
LEFT JOIN product_side_effects pse ON pd.detail_id = pse.detail_id
LEFT JOIN product_interactions pin ON pd.detail_id = pin.detail_id
LEFT JOIN product_indications pind ON pd.detail_id = pind.detail_id
GROUP BY pd.detail_id, pd.product_id, pd.generic_name, pd.uses, pd.how_it_works, pd.created_at, pd.updated_at;

-- View to get reviews with images
CREATE OR REPLACE VIEW product_reviews_with_images AS
SELECT 
    pr.review_id,
    pr.product_id,
    pr.user_id,
    pr.rating,
    pr.comment,
    pr.is_verified_purchase,
    pr.helpful_count,
    pr.created_at,
    pr.updated_at,
    COALESCE(array_agg(ri.image_url ORDER BY ri.display_order) FILTER (WHERE ri.image_url IS NOT NULL), ARRAY[]::VARCHAR[]) as review_images
FROM product_reviews pr
LEFT JOIN review_images ri ON pr.review_id = ri.review_id
GROUP BY pr.review_id, pr.product_id, pr.user_id, pr.rating, pr.comment, 
         pr.is_verified_purchase, pr.helpful_count, pr.created_at, pr.updated_at;

-- View to get products with primary image
CREATE OR REPLACE VIEW products_with_primary_image AS
SELECT 
    p.*,
    pi.image_url as main_image_url
FROM products p
LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = TRUE;

-- View to get user with default address
CREATE OR REPLACE VIEW users_with_default_address AS
SELECT 
    u.*,
    ua.full_address as default_address,
    ua.latitude as default_latitude,
    ua.longitude as default_longitude
FROM users u
LEFT JOIN user_addresses ua ON u.user_id = ua.user_id AND ua.is_default = TRUE;

COMMIT;

-- ============================================
-- MIGRATION SUMMARY
-- ============================================
-- Tables Created:
--   - product_ingredients
--   - product_important_info
--   - product_precautions
--   - product_side_effects
--   - product_interactions
--   - product_indications
--   - review_images
--
-- Columns Removed:
--   - product_details: important_info, ingredients, precaution, side_effects, interactions, indication
--   - product_reviews: review_images
--   - users: address
--   - products: main_image_url
--
-- Columns Added:
--   - user_addresses: is_default
--
-- Views Created:
--   - product_details_complete (for backward compatibility)
--   - product_reviews_with_images (for backward compatibility)
--   - products_with_primary_image (for easy querying)
--   - users_with_default_address (for easy querying)
--
-- All existing data has been migrated to the new normalized structure.
-- The database now conforms to 1NF-3NF normalization standards.
-- ============================================

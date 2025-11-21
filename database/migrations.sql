-- ============================================
-- PHARMAHUB - MIGRATION SCRIPTS
-- Database Migration untuk Update/Upgrade
-- ============================================

-- ============================================
-- MIGRATION 001: Initial Schema (Already in schema.sql)
-- ============================================
-- Version: 1.0.0
-- Date: 2025-01-21
-- Description: Initial database schema creation
-- File: schema.sql

-- ============================================
-- MIGRATION 002: Add Social Login Support
-- ============================================
-- Version: 1.1.0
-- Date: 2025-XX-XX (Future)
-- Description: Add OAuth support for Google, Facebook login

-- Add columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_profile_picture_url VARCHAR(500);

-- Add constraint for oauth
ALTER TABLE users ADD CONSTRAINT check_oauth_provider 
CHECK (oauth_provider IS NULL OR oauth_provider IN ('google', 'facebook', 'apple'));

-- Create index for oauth lookup
CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_id);

-- ============================================
-- MIGRATION 003: Add Product Variants
-- ============================================
-- Version: 1.2.0
-- Date: 2025-XX-XX (Future)
-- Description: Support product variants (size, dosage)

-- Create product variants table
CREATE TABLE IF NOT EXISTS product_variants (
    variant_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    variant_name VARCHAR(100) NOT NULL, -- '500mg', '1000mg', etc
    variant_price DECIMAL(12, 2),
    variant_stock INTEGER DEFAULT 0,
    variant_sku VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(variant_sku);

-- ============================================
-- MIGRATION 004: Add Shipping Integration
-- ============================================
-- Version: 1.3.0
-- Date: 2025-XX-XX (Future)
-- Description: Add shipping provider integration

-- Add shipping columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_provider VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS actual_delivery TIMESTAMP;

-- Add shipping cost breakdown
ALTER TABLE orders ADD COLUMN IF NOT EXISTS base_shipping_cost DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS insurance_cost DECIMAL(12, 2) DEFAULT 0;

-- Create shipping history table
CREATE TABLE IF NOT EXISTS shipping_history (
    shipping_history_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    status VARCHAR(100) NOT NULL,
    location TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shipping_history_order ON shipping_history(order_id);

-- ============================================
-- MIGRATION 005: Add Product Stock History
-- ============================================
-- Version: 1.4.0
-- Date: 2025-XX-XX (Future)
-- Description: Track stock changes for inventory management

CREATE TABLE IF NOT EXISTS product_stock_history (
    stock_history_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    change_type VARCHAR(50) NOT NULL, -- 'purchase', 'sale', 'adjustment', 'return'
    quantity_change INTEGER NOT NULL,
    stock_before INTEGER NOT NULL,
    stock_after INTEGER NOT NULL,
    reference_type VARCHAR(50), -- 'order', 'manual', 'supplier'
    reference_id INTEGER,
    notes TEXT,
    changed_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_change_type CHECK (change_type IN ('purchase', 'sale', 'adjustment', 'return', 'damage', 'expired'))
);

CREATE INDEX idx_stock_history_product ON product_stock_history(product_id);
CREATE INDEX idx_stock_history_created ON product_stock_history(created_at DESC);

-- ============================================
-- MIGRATION 006: Add Wishlist Feature
-- ============================================
-- Version: 1.5.0
-- Date: 2025-XX-XX (Future)
-- Description: Allow users to save favorite products

CREATE TABLE IF NOT EXISTS wishlist (
    wishlist_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_wishlist_user_product UNIQUE (user_id, product_id)
);

CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE INDEX idx_wishlist_product ON wishlist(product_id);

-- ============================================
-- MIGRATION 007: Add Product Bundles
-- ============================================
-- Version: 1.6.0
-- Date: 2025-XX-XX (Future)
-- Description: Support product bundles/packages

CREATE TABLE IF NOT EXISTS product_bundles (
    bundle_id SERIAL PRIMARY KEY,
    bundle_name VARCHAR(255) NOT NULL,
    description TEXT,
    bundle_price DECIMAL(12, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2),
    bundle_image BYTEA,
    bundle_image_mime_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bundle_items (
    bundle_item_id SERIAL PRIMARY KEY,
    bundle_id INTEGER NOT NULL REFERENCES product_bundles(bundle_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    
    CONSTRAINT check_bundle_quantity CHECK (quantity > 0)
);

CREATE INDEX idx_bundle_items_bundle ON bundle_items(bundle_id);
CREATE INDEX idx_bundle_items_product ON bundle_items(product_id);

-- ============================================
-- MIGRATION 008: Add Prescription Management
-- ============================================
-- Version: 1.7.0
-- Date: 2025-XX-XX (Future)
-- Description: Better prescription handling and verification

CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    prescription_image BYTEA NOT NULL,
    prescription_mime_type VARCHAR(50) NOT NULL,
    doctor_name VARCHAR(255),
    hospital_name VARCHAR(255),
    prescription_date DATE,
    verification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    verified_by INTEGER REFERENCES users(user_id),
    verification_notes TEXT,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_verification_status CHECK (verification_status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX idx_prescriptions_user ON prescriptions(user_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(verification_status);

-- Link prescriptions to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS prescription_id INTEGER REFERENCES prescriptions(prescription_id);

-- ============================================
-- MIGRATION 009: Add Customer Loyalty Program
-- ============================================
-- Version: 1.8.0
-- Date: 2025-XX-XX (Future)
-- Description: Points and rewards system

CREATE TABLE IF NOT EXISTS loyalty_points (
    points_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 0,
    lifetime_points INTEGER NOT NULL DEFAULT 0,
    tier VARCHAR(50) DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
    tier_updated_at TIMESTAMP,
    
    CONSTRAINT check_tier CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum'))
);

CREATE TABLE IF NOT EXISTS points_history (
    points_history_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    points_change INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'earn', 'redeem', 'expire', 'adjustment'
    reference_type VARCHAR(50), -- 'order', 'review', 'referral'
    reference_id INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_transaction_type CHECK (transaction_type IN ('earn', 'redeem', 'expire', 'adjustment'))
);

CREATE INDEX idx_points_history_user ON points_history(user_id);
CREATE INDEX idx_points_history_created ON points_history(created_at DESC);

-- ============================================
-- MIGRATION 010: Add Chat/Consultation Feature
-- ============================================
-- Version: 1.9.0
-- Date: 2025-XX-XX (Future)
-- Description: Live chat with pharmacist

CREATE TABLE IF NOT EXISTS chat_sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    pharmacist_id INTEGER REFERENCES users(user_id),
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'active', 'closed'
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    
    CONSTRAINT check_chat_status CHECK (status IN ('open', 'active', 'closed'))
);

CREATE TABLE IF NOT EXISTS chat_messages (
    message_id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(user_id),
    message_text TEXT,
    message_image BYTEA,
    message_image_mime_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_pharmacist ON chat_sessions(pharmacist_id);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);

-- ============================================
-- ROLLBACK SCRIPTS (Reverse Migrations)
-- ============================================

-- ROLLBACK MIGRATION 002
/*
ALTER TABLE users DROP COLUMN IF EXISTS oauth_provider;
ALTER TABLE users DROP COLUMN IF EXISTS oauth_id;
ALTER TABLE users DROP COLUMN IF EXISTS oauth_profile_picture_url;
DROP INDEX IF EXISTS idx_users_oauth;
*/

-- ROLLBACK MIGRATION 003
/*
DROP TABLE IF EXISTS product_variants CASCADE;
*/

-- ROLLBACK MIGRATION 004
/*
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_provider;
ALTER TABLE orders DROP COLUMN IF EXISTS tracking_number;
ALTER TABLE orders DROP COLUMN IF EXISTS estimated_delivery;
ALTER TABLE orders DROP COLUMN IF EXISTS actual_delivery;
ALTER TABLE orders DROP COLUMN IF EXISTS base_shipping_cost;
ALTER TABLE orders DROP COLUMN IF EXISTS insurance_cost;
DROP TABLE IF EXISTS shipping_history CASCADE;
*/

-- ROLLBACK MIGRATION 005
/*
DROP TABLE IF EXISTS product_stock_history CASCADE;
*/

-- ROLLBACK MIGRATION 006
/*
DROP TABLE IF EXISTS wishlist CASCADE;
*/

-- ROLLBACK MIGRATION 007
/*
DROP TABLE IF EXISTS bundle_items CASCADE;
DROP TABLE IF EXISTS product_bundles CASCADE;
*/

-- ROLLBACK MIGRATION 008
/*
ALTER TABLE orders DROP COLUMN IF EXISTS prescription_id;
DROP TABLE IF EXISTS prescriptions CASCADE;
*/

-- ROLLBACK MIGRATION 009
/*
DROP TABLE IF EXISTS points_history CASCADE;
DROP TABLE IF EXISTS loyalty_points CASCADE;
*/

-- ROLLBACK MIGRATION 010
/*
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
*/

-- ============================================
-- MIGRATION TRACKING TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS schema_migrations (
    migration_id SERIAL PRIMARY KEY,
    version VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT TRUE
);

-- Insert initial migration
INSERT INTO schema_migrations (version, description, success) 
VALUES ('1.0.0', 'Initial schema creation', TRUE)
ON CONFLICT (version) DO NOTHING;

-- ============================================
-- UTILITY FUNCTIONS FOR MIGRATIONS
-- ============================================

-- Function to check if migration exists
CREATE OR REPLACE FUNCTION migration_exists(migration_version VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM schema_migrations 
        WHERE version = migration_version AND success = TRUE
    );
END;
$$ LANGUAGE plpgsql;

-- Function to record migration
CREATE OR REPLACE FUNCTION record_migration(
    migration_version VARCHAR,
    migration_description TEXT,
    exec_time INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO schema_migrations (version, description, execution_time_ms, success)
    VALUES (migration_version, migration_description, exec_time, TRUE)
    ON CONFLICT (version) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- HOW TO USE MIGRATIONS
-- ============================================

/*
1. Check current version:
   SELECT * FROM schema_migrations ORDER BY executed_at DESC LIMIT 1;

2. Check if specific migration applied:
   SELECT migration_exists('1.1.0');

3. Apply new migration:
   -- Run migration SQL here
   -- Then record it:
   SELECT record_migration('1.1.0', 'Add social login support', 1500);

4. Rollback (if needed):
   -- Run rollback SQL
   -- Delete from migrations:
   DELETE FROM schema_migrations WHERE version = '1.1.0';

5. View all migrations:
   SELECT * FROM schema_migrations ORDER BY executed_at;
*/

-- ============================================
-- END OF MIGRATION SCRIPTS
-- ============================================

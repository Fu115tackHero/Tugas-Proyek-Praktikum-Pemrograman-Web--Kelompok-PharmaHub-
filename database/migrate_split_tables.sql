-- ============================================
-- MIGRATION: Split Products & Product Details
-- ============================================

-- Step 1: Create product_details table
CREATE TABLE product_details (
    detail_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL UNIQUE REFERENCES products(product_id) ON DELETE CASCADE,
    
    -- Medical Information
    generic_name VARCHAR(255),
    uses TEXT,
    how_it_works TEXT,
    
    -- Informasi Penting (Array)
    important_info TEXT[],
    ingredients TEXT[],
    precaution TEXT[],
    side_effects TEXT[],
    interactions TEXT[],
    indication TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_details_product ON product_details(product_id);

-- Step 2: Backup & Migrate data dari products ke product_details
INSERT INTO product_details (
    product_id, 
    generic_name, 
    uses, 
    how_it_works,
    important_info, 
    ingredients, 
    precaution, 
    side_effects, 
    interactions, 
    indication
)
SELECT 
    product_id,
    generic_name,
    uses,
    how_it_works,
    important_info,
    ingredients,
    precaution,
    side_effects,
    interactions,
    indication
FROM products;

-- Step 3: Verify migration
SELECT 'Products Table' as table_name, COUNT(*) as total
FROM products
UNION ALL
SELECT 'Product Details Table', COUNT(*) 
FROM product_details;

-- Step 4: Drop detail columns from products table
ALTER TABLE products 
DROP COLUMN generic_name,
DROP COLUMN uses,
DROP COLUMN how_it_works,
DROP COLUMN important_info,
DROP COLUMN ingredients,
DROP COLUMN precaution,
DROP COLUMN side_effects,
DROP COLUMN interactions,
DROP COLUMN indication;

-- Step 5: Verify final structure
SELECT 'Products columns' as info
UNION ALL
SELECT column_name 
FROM information_schema.columns 
WHERE table_name='products'
ORDER BY ordinal_position;

SELECT COUNT(*) as remaining_products FROM products;
SELECT COUNT(*) as product_details FROM product_details;

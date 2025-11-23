-- ============================================
-- RESET PRODUCTS TABLE
-- ============================================

-- 1. Hapus semua produk lama
TRUNCATE TABLE products RESTART IDENTITY CASCADE;

-- 2. Reset sequence product_id ke 1
ALTER SEQUENCE products_product_id_seq RESTART WITH 1;

-- 3. Verify semua produk terhapus
SELECT COUNT(*) as total_products FROM products;

-- Output: Jika berhasil, total_products = 0

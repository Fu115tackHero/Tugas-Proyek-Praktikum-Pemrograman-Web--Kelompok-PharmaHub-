-- ============================================
-- INSERT PRODUCT CATEGORIES
-- ============================================

INSERT INTO product_categories (category_name, description) VALUES
('Obat Nyeri & Demam', 'Obat untuk meredakan nyeri dan menurunkan demam'),
('Obat Pencernaan', 'Obat untuk masalah pencernaan dan saluran cerna'),
('Obat Alergi', 'Obat untuk mengatasi alergi dan reaksi alergi'),
('Obat Pernapasan', 'Obat untuk masalah pernapasan dan asma'),
('Antiseptik', 'Produk antiseptik dan desinfektan'),
('Vitamin & Suplemen', 'Vitamin dan suplemen untuk kesehatan'),
('Antibiotik', 'Obat antibiotik untuk infeksi bakteri'),
('Obat Jantung & Hipertensi', 'Obat untuk penyakit jantung dan hipertensi')
ON CONFLICT (category_name) DO NOTHING;

-- ============================================
-- INSERT PRODUCTS (15 produk dari products.js)
-- ============================================

INSERT INTO products (name, brand, price, description, category_id, stock, prescription_required, created_at) VALUES
-- 1. Paracetamol 500mg
('Paracetamol 500mg', 'Sanbe Farma', 12000, 
 'Untuk menurunkan demam dan meredakan sakit kepala atau nyeri ringan.',
 (SELECT category_id FROM product_categories WHERE category_name = 'Obat Nyeri & Demam'),
 100, FALSE, CURRENT_TIMESTAMP),

-- 2. Ibuprofen 400mg
('Ibuprofen 400mg', 'Kimia Farma', 15000,
 'Obat antiinflamasi non-steroid untuk nyeri otot, sendi, atau sakit gigi.',
 (SELECT category_id FROM product_categories WHERE category_name = 'Obat Nyeri & Demam'),
 75, FALSE, CURRENT_TIMESTAMP),

-- 3. Promag
('Promag', 'Kalbe Farma', 8000,
 'Meredakan sakit maag, nyeri ulu hati, dan gangguan asam lambung.',
 (SELECT category_id FROM product_categories WHERE category_name = 'Obat Pencernaan'),
 120, FALSE, CURRENT_TIMESTAMP),

-- 4. Loperamide (Imodium)
('Loperamide (Imodium)', 'Johnson & Johnson', 20000,
 'Untuk mengatasi diare akut.',
 (SELECT category_id FROM product_categories WHERE category_name = 'Obat Pencernaan'),
 60, FALSE, CURRENT_TIMESTAMP),

-- 5. Cetirizine
('Cetirizine', 'Dexa Medica', 25000,
 'Antihistamin untuk alergi, bersin, atau gatal-gatal.',
 (SELECT category_id FROM product_categories WHERE category_name = 'Obat Alergi'),
 90, FALSE, CURRENT_TIMESTAMP),

-- 6. Salbutamol Inhaler
('Salbutamol Inhaler', 'Glaxo Smith Kline', 45000,
 'Membantu meredakan sesak napas akibat asma atau bronkitis.',
 (SELECT category_id FROM product_categories WHERE category_name = 'Obat Pernapasan'),
 45, FALSE, CURRENT_TIMESTAMP),

-- 7. Betadine
('Betadine', 'Mahakam Beta Farma', 18000,
 'Antiseptik luar untuk membersihkan luka ringan atau goresan.',
 (SELECT category_id FROM product_categories WHERE category_name = 'Antiseptik'),
 150, FALSE, CURRENT_TIMESTAMP),

-- 8. Oralit
('Oralit', 'Pharos Indonesia', 5000,
 'Larutan rehidrasi untuk mencegah dehidrasi akibat diare atau muntah.',
 (SELECT category_id FROM product_categories WHERE category_name = 'Obat Pencernaan'),
 200, FALSE, CURRENT_TIMESTAMP),

-- 9. Vitamin C 500mg
('Vitamin C 500mg', 'Blackmores', 25000,
 'Meningkatkan daya tahan tubuh dan membantu penyembuhan.',
 (SELECT category_id FROM product_categories WHERE category_name = 'Vitamin & Suplemen'),
 95, FALSE, CURRENT_TIMESTAMP),

-- 10. Amoxicillin 500mg (WAJIB RESEP DOKTER)
('Amoxicillin 500mg', 'Sanbe Farma', 40000,
 'Untuk infeksi bakteri ringan, seperti infeksi tenggorokan atau kulit.',
 (SELECT category_id FROM product_categories WHERE category_name = 'Antibiotik'),
 50, TRUE, CURRENT_TIMESTAMP),

-- 11. Omeprazole 20mg (WAJIB RESEP DOKTER)
('Omeprazole 20mg', 'Dexa Medica', 35000,
 'Untuk mengatasi asam lambung berlebih dan maag kronis.',
 (SELECT category_id FROM product_categories WHERE category_name = 'Obat Pencernaan'),
 40, TRUE, CURRENT_TIMESTAMP),

-- 12. Vitamin D3 1000 IU
('Vitamin D3 1000 IU', 'Nature Made', 45000,
 'Membantu penyerapan kalsium dan kesehatan tulang.',
 (SELECT category_id FROM product_categories WHERE category_name = 'Vitamin & Suplemen'),
 110, FALSE, CURRENT_TIMESTAMP),

-- 13. Multivitamin Complete
('Multivitamin Complete', 'Centrum', 55000,
 'Kombinasi lengkap vitamin dan mineral untuk kesehatan optimal.',
 (SELECT category_id FROM product_categories WHERE category_name = 'Vitamin & Suplemen'),
 130, FALSE, CURRENT_TIMESTAMP),

-- 14. Alcohol 70%
('Alcohol 70%', 'OneMed', 15000,
 'Antiseptik untuk membersihkan tangan dan permukaan.',
 (SELECT category_id FROM product_categories WHERE category_name = 'Antiseptik'),
 300, FALSE, CURRENT_TIMESTAMP),

-- 15. Captopril 25mg (WAJIB RESEP DOKTER)
('Captopril 25mg', 'Indofarma', 30000,
 'Obat untuk menurunkan tekanan darah tinggi.',
 (SELECT category_id FROM product_categories WHERE category_name = 'Obat Jantung & Hipertensi'),
 40, TRUE, CURRENT_TIMESTAMP);

-- ============================================
-- VERIFY DATA
-- ============================================

SELECT 'Total Categories' as info, COUNT(*) as count FROM product_categories
UNION ALL
SELECT 'Total Products', COUNT(*) FROM products;

SELECT category_name, COUNT(*) as product_count 
FROM products p
LEFT JOIN product_categories pc ON p.category_id = pc.category_id
GROUP BY category_name
ORDER BY category_name;

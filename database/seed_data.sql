-- ============================================
-- PHARMAHUB - SEED DATA
-- Data Awal untuk Testing dan Development
-- ============================================

-- ============================================
-- 1. CLEAR EXISTING DATA (Optional)
-- ============================================
-- Uncomment jika ingin clear data sebelum insert seed data
/*
TRUNCATE TABLE admin_activity_logs CASCADE;
TRUNCATE TABLE order_status_history CASCADE;
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE coupon_usage CASCADE;
TRUNCATE TABLE cart_items CASCADE;
TRUNCATE TABLE saved_for_later CASCADE;
TRUNCATE TABLE product_reviews CASCADE;
TRUNCATE TABLE product_images CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE notification_preferences CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE product_categories CASCADE;
TRUNCATE TABLE coupons CASCADE;
TRUNCATE TABLE user_addresses CASCADE;
TRUNCATE TABLE password_reset_tokens CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE sales_reports CASCADE;

-- Reset sequences
ALTER SEQUENCE users_user_id_seq RESTART WITH 1;
ALTER SEQUENCE product_categories_category_id_seq RESTART WITH 1;
ALTER SEQUENCE products_product_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_order_id_seq RESTART WITH 1;
*/

-- ============================================
-- 2. INSERT USERS
-- ============================================
-- Password untuk semua user: "password123" (harus di-hash dengan bcrypt di aplikasi)
-- Hash example: $2b$10$K7Z.xyz... (generated dari bcrypt)

INSERT INTO users (name, email, password_hash, phone, role, is_active, email_verified, created_at, last_login) VALUES
('Admin PharmaHub', 'admin@pharmahub.com', '$2b$10$rT7yDZYKhv5XiZYDx9bvTOQfY8jqO1vPZ4WXzB3JlKZrXvHmYx.2K', '081234567891', 'admin', TRUE, TRUE, CURRENT_TIMESTAMP - INTERVAL '180 days', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('Apoteker Budi', 'pharmacist@pharmahub.com', '$2b$10$rT7yDZYKhv5XiZYDx9bvTOQfY8jqO1vPZ4WXzB3JlKZrXvHmYx.2K', '081234567892', 'pharmacist', TRUE, TRUE, CURRENT_TIMESTAMP - INTERVAL '150 days', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('John Doe', 'john.doe@example.com', '$2b$10$rT7yDZYKhv5XiZYDx9bvTOQfY8jqO1vPZ4WXzB3JlKZrXvHmYx.2K', '081234567890', 'customer', TRUE, TRUE, CURRENT_TIMESTAMP - INTERVAL '90 days', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
('Jane Smith', 'jane.smith@example.com', '$2b$10$rT7yDZYKhv5XiZYDx9bvTOQfY8jqO1vPZ4WXzB3JlKZrXvHmYx.2K', '081234567893', 'customer', TRUE, TRUE, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('Ahmad Wijaya', 'ahmad.wijaya@example.com', '$2b$10$rT7yDZYKhv5XiZYDx9bvTOQfY8jqO1vPZ4WXzB3JlKZrXvHmYx.2K', '081234567894', 'customer', TRUE, TRUE, CURRENT_TIMESTAMP - INTERVAL '45 days', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
('Siti Nurhaliza', 'siti.nur@example.com', '$2b$10$rT7yDZYKhv5XiZYDx9bvTOQfY8jqO1vPZ4WXzB3JlKZrXvHmYx.2K', '081234567895', 'customer', TRUE, TRUE, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('Budi Santoso', 'budi.santoso@example.com', '$2b$10$rT7yDZYKhv5XiZYDx9bvTOQfY8jqO1vPZ4WXzB3JlKZrXvHmYx.2K', '081234567896', 'customer', TRUE, FALSE, CURRENT_TIMESTAMP - INTERVAL '7 days', NULL),
('Lisa Wong', 'lisa.wong@example.com', '$2b$10$rT7yDZYKhv5XiZYDx9bvTOQfY8jqO1vPZ4WXzB3JlKZrXvHmYx.2K', '081234567897', 'customer', TRUE, TRUE, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP);

-- ============================================
-- 3. INSERT USER ADDRESSES
-- ============================================
INSERT INTO user_addresses (user_id, address_label, recipient_name, phone, full_address, city, province, postal_code, is_default) VALUES
(3, 'Rumah', 'John Doe', '081234567890', 'Jl. Merdeka No. 123, RT 01/RW 05', 'Jakarta Pusat', 'DKI Jakarta', '10110', TRUE),
(3, 'Kantor', 'John Doe', '081234567890', 'Gedung Plaza Indonesia, Lantai 5', 'Jakarta Pusat', 'DKI Jakarta', '10350', FALSE),
(4, 'Rumah', 'Jane Smith', '081234567893', 'Jl. Sudirman No. 456, Perumahan Griya Asri Blok A-10', 'Bandung', 'Jawa Barat', '40123', TRUE),
(5, 'Rumah', 'Ahmad Wijaya', '081234567894', 'Jl. Gatot Subroto No. 789, Komplek Permata Hijau', 'Surabaya', 'Jawa Timur', '60119', TRUE),
(6, 'Rumah', 'Siti Nurhaliza', '081234567895', 'Jl. Ahmad Yani No. 321, Perumahan Bumi Asri', 'Yogyakarta', 'DI Yogyakarta', '55281', TRUE);

-- ============================================
-- 4. INSERT PRODUCT CATEGORIES
-- ============================================
INSERT INTO product_categories (category_name, description, is_active) VALUES
('Obat Nyeri & Demam', 'Obat untuk meredakan nyeri dan menurunkan demam seperti paracetamol, ibuprofen', TRUE),
('Antibiotik', 'Obat untuk mengobati infeksi bakteri (memerlukan resep dokter)', TRUE),
('Vitamin & Suplemen', 'Vitamin dan suplemen untuk kesehatan tubuh', TRUE),
('Obat Lambung', 'Obat untuk mengatasi masalah pencernaan, maag, dan gangguan lambung', TRUE),
('Obat Alergi', 'Obat untuk mengatasi reaksi alergi seperti gatal, bersin, ruam', TRUE),
('Obat Batuk & Flu', 'Obat untuk meredakan batuk, pilek, dan gejala flu', TRUE),
('Obat Diabetes', 'Obat untuk mengontrol kadar gula darah pada penderita diabetes', TRUE),
('Obat Jantung', 'Obat untuk kesehatan jantung dan pembuluh darah', TRUE),
('Obat Mata', 'Obat tetes mata dan perawatan mata', TRUE),
('Obat Kulit', 'Obat untuk mengatasi masalah kulit seperti jerawat, eksim, jamur', TRUE);

-- ============================================
-- 5. INSERT PRODUCTS
-- ============================================
INSERT INTO products (name, brand, category_id, generic_name, price, description, uses, how_it_works, 
    important_info, ingredients, precaution, side_effects, interactions, indication,
    stock, min_stock, prescription_required, is_active, featured, view_count, sold_count) VALUES

-- Obat Nyeri & Demam
('Paracetamol 500mg', 'Sanbe Farma', 1, 'Paracetamol', 12000, 
    'Obat untuk menurunkan demam dan meredakan nyeri ringan hingga sedang',
    'Menurunkan demam, meredakan sakit kepala, sakit gigi, nyeri otot',
    'Paracetamol bekerja dengan menghambat produksi prostaglandin di otak yang menyebabkan demam dan nyeri',
    ARRAY['Jangan melebihi dosis 4 gram per hari', 'Tidak untuk anak di bawah 2 tahun tanpa anjuran dokter'],
    ARRAY['Paracetamol 500 mg', 'Mikrokristalin selulosa', 'Natrium starch glikolat', 'Magnesium stearat'],
    ARRAY['Hindari konsumsi alkohol selama pengobatan', 'Konsultasikan dengan dokter jika memiliki penyakit hati'],
    ARRAY['Reaksi alergi kulit', 'Gangguan hati jika dikonsumsi berlebihan'],
    ARRAY['Warfarin: meningkatkan risiko perdarahan', 'Alkohol: meningkatkan risiko kerusakan hati'],
    ARRAY['Demam pada anak dan dewasa', 'Sakit kepala ringan hingga sedang', 'Nyeri otot dan sendi', 'Sakit gigi'],
    150, 20, FALSE, TRUE, TRUE, 1234, 456),

('Ibuprofen 400mg', 'Konimex', 1, 'Ibuprofen', 18500,
    'Obat anti-inflamasi untuk meredakan nyeri dan peradangan',
    'Meredakan nyeri sedang hingga berat, menurunkan demam, mengurangi peradangan',
    'Ibuprofen bekerja dengan menghambat enzim COX yang memproduksi prostaglandin penyebab nyeri dan peradangan',
    ARRAY['Sebaiknya diminum setelah makan', 'Tidak untuk ibu hamil trimester 3'],
    ARRAY['Ibuprofen 400 mg', 'Croscarmellose sodium', 'Silica colloidal anhydrous'],
    ARRAY['Hindari jika memiliki riwayat maag atau tukak lambung', 'Tidak untuk penderita gangguan ginjal berat'],
    ARRAY['Mual, muntah', 'Sakit perut', 'Pusing', 'Reaksi alergi'],
    ARRAY['Aspirin: meningkatkan risiko perdarahan', 'Warfarin: meningkatkan efek antikoagulan'],
    ARRAY['Nyeri kepala', 'Nyeri gigi', 'Nyeri menstruasi', 'Nyeri otot', 'Arthritis ringan'],
    120, 15, FALSE, TRUE, TRUE, 856, 298),

-- Antibiotik
('Amoxicillin 500mg', 'Kimia Farma', 2, 'Amoxicillin', 35000,
    'Antibiotik untuk mengobati infeksi bakteri',
    'Mengobati infeksi saluran pernapasan, telinga, kulit, dan saluran kemih',
    'Amoxicillin membunuh bakteri dengan menghambat pembentukan dinding sel bakteri',
    ARRAY['HARUS DIHABISKAN sesuai resep dokter', 'Tidak boleh dibagikan ke orang lain'],
    ARRAY['Amoxicillin trihydrate 500 mg', 'Magnesium stearate', 'Sodium starch glycolate'],
    ARRAY['Beritahu dokter jika alergi penisilin', 'Tidak efektif untuk infeksi virus seperti flu'],
    ARRAY['Diare', 'Mual', 'Ruam kulit', 'Reaksi alergi serius (jarang)'],
    ARRAY['Allopurinol: meningkatkan risiko ruam kulit', 'Kontrasepsi oral: menurunkan efektivitas'],
    ARRAY['Infeksi saluran pernapasan', 'Infeksi telinga', 'Infeksi kulit', 'Infeksi saluran kemih'],
    80, 20, TRUE, TRUE, FALSE, 567, 123),

-- Vitamin & Suplemen
('Vitamin C 1000mg', 'Enervon-C', 3, 'Ascorbic Acid', 45000,
    'Suplemen vitamin C untuk meningkatkan daya tahan tubuh',
    'Meningkatkan sistem kekebalan tubuh, antioksidan, membantu penyerapan zat besi',
    'Vitamin C berperan dalam berbagai fungsi tubuh termasuk pembentukan kolagen dan fungsi imun',
    ARRAY['Dapat diminum sebelum atau sesudah makan', 'Simpan di tempat sejuk dan kering'],
    ARRAY['Ascorbic Acid 1000 mg', 'Sodium Ascorbate', 'Microcrystalline Cellulose'],
    ARRAY['Konsultasi dokter jika memiliki riwayat batu ginjal', 'Dosis tinggi dapat menyebabkan diare'],
    ARRAY['Diare (jika dosis tinggi)', 'Sakit perut', 'Mual'],
    ARRAY['Aspirin: mengurangi kadar vitamin C', 'Warfarin: dapat mengurangi efek antikoagulan'],
    ARRAY['Defisiensi vitamin C', 'Meningkatkan daya tahan tubuh', 'Pemulihan setelah sakit'],
    200, 30, FALSE, TRUE, TRUE, 2341, 876),

('Multivitamin', 'Blackmores', 3, 'Multivitamin & Mineral', 125000,
    'Suplemen multivitamin dan mineral lengkap untuk kesehatan optimal',
    'Memenuhi kebutuhan vitamin dan mineral harian, meningkatkan energi dan stamina',
    'Kombinasi berbagai vitamin dan mineral penting untuk fungsi tubuh optimal',
    ARRAY['Diminum 1 kali sehari setelah makan', 'Tidak menggantikan pola makan seimbang'],
    ARRAY['Vitamin A, B complex, C, D, E', 'Zinc, Selenium, Magnesium', 'Kalsium, Zat Besi'],
    ARRAY['Jangan melebihi dosis yang dianjurkan', 'Simpan jauh dari jangkauan anak-anak'],
    ARRAY['Efek samping jarang terjadi', 'Mual jika diminum saat perut kosong'],
    ARRAY['Dapat berinteraksi dengan obat tertentu', 'Konsultasi dokter jika sedang minum obat rutin'],
    ARRAY['Suplemen nutrisi harian', 'Meningkatkan stamina', 'Menjaga kesehatan'],
    150, 25, FALSE, TRUE, TRUE, 1567, 543),

-- Obat Lambung
('Antasida Tablet', 'Promag', 4, 'Magnesium Hydroxide + Aluminum Hydroxide', 22000,
    'Obat untuk meredakan gejala maag dan kelebihan asam lambung',
    'Meredakan nyeri lambung, heartburn, begah, mual akibat asam lambung',
    'Menetralkan asam lambung berlebih dan melindungi dinding lambung',
    ARRAY['Sebaiknya diminum 1-2 jam setelah makan', 'Kunyah tablet sebelum ditelan'],
    ARRAY['Magnesium Hydroxide 200 mg', 'Aluminum Hydroxide 200 mg', 'Simethicone 50 mg'],
    ARRAY['Tidak untuk penggunaan jangka panjang tanpa konsultasi dokter', 'Hindari jika ada gangguan ginjal'],
    ARRAY['Konstipasi atau diare', 'Perubahan warna feses'],
    ARRAY['Antibiotik tertentu: mengurangi penyerapan', 'Sebaiknya beri jarak 2 jam dengan obat lain'],
    ARRAY['Maag', 'Heartburn', 'Perut kembung', 'Mual karena asam lambung'],
    180, 30, FALSE, TRUE, TRUE, 1876, 654),

('Omeprazole 20mg', 'Omepros', 4, 'Omeprazole', 48000,
    'Obat untuk mengurangi produksi asam lambung',
    'Mengobati tukak lambung, GERD, dan kondisi kelebihan asam lambung',
    'Menghambat pompa proton di lambung sehingga mengurangi produksi asam',
    ARRAY['Diminum 30 menit sebelum makan', 'Telan utuh, jangan digerus'],
    ARRAY['Omeprazole 20 mg', 'Mannitol', 'Crospovidone', 'Magnesium stearate'],
    ARRAY['Tidak untuk pengobatan gejala akut (butuh waktu bekerja)', 'Konsultasi jika gejala berlanjut'],
    ARRAY['Sakit kepala', 'Diare', 'Mual', 'Sakit perut'],
    ARRAY['Clopidogrel: mengurangi efektivitas', 'Warfarin: meningkatkan risiko perdarahan'],
    ARRAY['GERD', 'Tukak lambung', 'Esofagitis erosif', 'Sindrom Zollinger-Ellison'],
    100, 20, FALSE, TRUE, FALSE, 745, 234),

-- Obat Alergi
('Cetirizine 10mg', 'OGB Dexa', 5, 'Cetirizine HCl', 25000,
    'Antihistamin untuk mengatasi gejala alergi',
    'Meredakan bersin, hidung berair, gatal-gatal, ruam kulit akibat alergi',
    'Memblokir histamin yang menyebabkan gejala alergi',
    ARRAY['Dapat menyebabkan kantuk pada sebagian orang', 'Hindari mengemudi jika merasa mengantuk'],
    ARRAY['Cetirizine HCl 10 mg', 'Lactose monohydrate', 'Microcrystalline cellulose'],
    ARRAY['Tidak untuk anak di bawah 6 tahun tanpa resep dokter', 'Hindari alkohol'],
    ARRAY['Kantuk', 'Sakit kepala', 'Mulut kering', 'Lelah'],
    ARRAY['Alkohol: meningkatkan efek sedasi', 'Obat penenang: meningkatkan kantuk'],
    ARRAY['Rhinitis alergi', 'Urtikaria (biduran)', 'Gatal-gatal', 'Alergi makanan ringan'],
    160, 25, FALSE, TRUE, TRUE, 934, 412),

-- Obat Batuk & Flu
('OBH Sirup', 'OBH', 6, 'Dextromethorphan', 28000,
    'Sirup obat batuk untuk meredakan batuk tidak berdahak',
    'Meredakan batuk kering dan batuk yang mengganggu',
    'Menekan refleks batuk di pusat batuk otak',
    ARRAY['Kocok dahulu sebelum diminum', 'Gunakan sendok takar yang tersedia'],
    ARRAY['Dextromethorphan HBr', 'Glyceryl guaiacolate', 'Sukrosa', 'Sorbitol'],
    ARRAY['Tidak untuk batuk berdahak berlebihan', 'Jangan gunakan lebih dari 7 hari tanpa konsultasi'],
    ARRAY['Mengantuk', 'Pusing', 'Mual ringan'],
    ARRAY['Obat penenang: meningkatkan kantuk', 'MAOI: interaksi berbahaya'],
    ARRAY['Batuk kering', 'Batuk tidak berdahak', 'Batuk karena iritasi'],
    140, 25, FALSE, TRUE, FALSE, 1234, 567),

-- Obat Diabetes
('Metformin 500mg', 'Dexa Medica', 7, 'Metformin HCl', 42000,
    'Obat untuk mengontrol kadar gula darah pada diabetes tipe 2',
    'Menurunkan kadar gula darah, meningkatkan sensitivitas insulin',
    'Mengurangi produksi glukosa di hati dan meningkatkan penggunaan glukosa oleh sel',
    ARRAY['Harus sesuai resep dokter', 'Kontrol gula darah secara teratur'],
    ARRAY['Metformin HCl 500 mg', 'Povidone', 'Magnesium stearate'],
    ARRAY['Diminum bersama atau setelah makan', 'Tidak untuk diabetes tipe 1'],
    ARRAY['Diare', 'Mual', 'Sakit perut', 'Metallic taste'],
    ARRAY['Kontras media iodine: hentikan sementara', 'Alkohol: meningkatkan risiko asidosis laktat'],
    ARRAY['Diabetes mellitus tipe 2', 'Prediabetes', 'PCOS (off-label)'],
    90, 20, TRUE, TRUE, FALSE, 456, 189),

-- Obat Jantung
('Amlodipine 5mg', 'Hexpharm', 8, 'Amlodipine Besylate', 38000,
    'Obat untuk menurunkan tekanan darah tinggi',
    'Mengobati hipertensi dan angina pektoris',
    'Menghambat kanal kalsium sehingga pembuluh darah melebar',
    ARRAY['Diminum pada waktu yang sama setiap hari', 'Jangan berhenti tiba-tiba'],
    ARRAY['Amlodipine Besylate 5 mg', 'Microcrystalline cellulose', 'Calcium phosphate'],
    ARRAY['Hindari jus grapefruit', 'Bangun perlahan dari posisi tidur (risiko pusing)'],
    ARRAY['Pusing', 'Pembengkakan pergelangan kaki', 'Sakit kepala', 'Lelah'],
    ARRAY['Simvastatin dosis tinggi: meningkatkan risiko miopati'],
    ARRAY['Hipertensi', 'Angina pektoris stabil', 'Angina vasospastik'],
    85, 20, TRUE, TRUE, FALSE, 345, 167);

-- ============================================
-- 6. INSERT COUPONS
-- ============================================
INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase, max_discount, usage_limit, usage_per_user, start_date, end_date, is_active) VALUES
('SEHAT10', 'Diskon 10% untuk semua produk', 'percentage', 10, 50000, 100000, 100, 1, 
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE),
('SEHAT50K', 'Diskon Rp 50.000 untuk pembelian minimal Rp 200.000', 'fixed', 50000, 200000, NULL, 50, 1, 
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE),
('NEWUSER', 'Diskon 15% untuk pengguna baru', 'percentage', 15, 0, 150000, 1000, 1, 
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '90 days', TRUE),
('GRATIS20K', 'Gratis Rp 20.000 untuk pembelian minimal Rp 100.000', 'fixed', 20000, 100000, NULL, 200, 1, 
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '14 days', TRUE),
('VITAMIN25', 'Diskon 25% khusus produk vitamin', 'percentage', 25, 100000, 200000, 75, 2, 
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '60 days', TRUE);

-- ============================================
-- 7. INSERT SAMPLE ORDERS
-- ============================================
-- Order 1 - Completed
INSERT INTO orders (order_number, user_id, customer_name, customer_email, customer_phone,
    subtotal, tax_amount, discount_amount, total_amount, coupon_code,
    payment_method, payment_status, order_status, notes, created_at, completed_at) 
VALUES 
('PHARMAHUB-20250115-00001', 3, 'John Doe', 'john.doe@example.com', '081234567890',
    97000, 9700, 9700, 97000, 'SEHAT10',
    'bayar_ditempat', 'paid', 'completed', 'Terima kasih!',
    CURRENT_TIMESTAMP - INTERVAL '6 days', CURRENT_TIMESTAMP - INTERVAL '5 days');

INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal) VALUES
(1, 1, 'Paracetamol 500mg', 12000, 2, 24000),
(1, 4, 'Vitamin C 1000mg', 45000, 1, 45000),
(1, 8, 'Cetirizine 10mg', 25000, 1, 25000);

-- Order 2 - Preparing
INSERT INTO orders (order_number, user_id, customer_name, customer_email, customer_phone,
    subtotal, tax_amount, discount_amount, total_amount,
    payment_method, payment_status, order_status, created_at) 
VALUES 
('PHARMAHUB-20250120-00001', 4, 'Jane Smith', 'jane.smith@example.com', '081234567893',
    160000, 16000, 0, 176000,
    'midtrans_online', 'paid', 'preparing',
    CURRENT_TIMESTAMP - INTERVAL '1 day');

INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal) VALUES
(2, 2, 'Ibuprofen 400mg', 18500, 2, 37000),
(2, 5, 'Multivitamin', 125000, 1, 125000);

-- Order 3 - Pending
INSERT INTO orders (order_number, user_id, customer_name, customer_email, customer_phone,
    subtotal, tax_amount, discount_amount, total_amount,
    payment_method, payment_status, order_status, created_at) 
VALUES 
('PHARMAHUB-20250121-00001', 5, 'Ahmad Wijaya', 'ahmad.wijaya@example.com', '081234567894',
    70000, 7000, 0, 77000,
    'bayar_ditempat', 'unpaid', 'pending',
    CURRENT_TIMESTAMP - INTERVAL '3 hours');

INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal) VALUES
(3, 1, 'Paracetamol 500mg', 12000, 3, 36000),
(3, 6, 'Antasida Tablet', 22000, 1, 22000);

-- ============================================
-- 8. INSERT NOTIFICATION PREFERENCES
-- ============================================
INSERT INTO notification_preferences (user_id, email_order_updates, email_promotions, email_newsletters, push_order_updates, push_promotions)
SELECT user_id, TRUE, TRUE, FALSE, TRUE, TRUE 
FROM users
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 9. INSERT SAMPLE NOTIFICATIONS
-- ============================================
INSERT INTO notifications (user_id, type, title, message, icon_type, is_read, related_order_id, created_at) VALUES
(3, 'order', 'Pesanan Selesai', 'Pesanan PHARMAHUB-20250115-00001 telah selesai. Terima kasih!', 'success', TRUE, 1, CURRENT_TIMESTAMP - INTERVAL '5 days'),
(4, 'order', 'Pesanan Sedang Disiapkan', 'Pesanan PHARMAHUB-20250120-00001 sedang disiapkan oleh apoteker kami.', 'info', FALSE, 2, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(5, 'order', 'Pesanan Dikonfirmasi', 'Pesanan PHARMAHUB-20250121-00001 telah dikonfirmasi.', 'info', FALSE, 3, CURRENT_TIMESTAMP - INTERVAL '3 hours'),
(3, 'promotion', 'Promo Spesial Vitamin!', 'Dapatkan diskon 25% untuk semua produk vitamin dengan kode VITAMIN25', 'info', FALSE, NULL, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(4, 'promotion', 'Gratis Ongkir!', 'Nikmati gratis ongkir untuk pembelian minimal Rp 100.000', 'info', FALSE, NULL, CURRENT_TIMESTAMP - INTERVAL '1 day');

-- ============================================
-- 10. INSERT PRODUCT REVIEWS
-- ============================================
INSERT INTO product_reviews (product_id, user_id, rating, comment, is_verified_purchase, created_at) VALUES
(1, 3, 5, 'Paracetamol yang ampuh, cepat meredakan demam anak saya. Harga terjangkau!', TRUE, CURRENT_TIMESTAMP - INTERVAL '4 days'),
(1, 4, 4, 'Bagus dan efektif, tapi rasa pahit saat ditelan.', FALSE, CURRENT_TIMESTAMP - INTERVAL '10 days'),
(4, 3, 5, 'Vitamin C terbaik! Sejak rutin minum ini, jarang sakit.', TRUE, CURRENT_TIMESTAMP - INTERVAL '4 days'),
(2, 5, 5, 'Ibuprofen ini cocok banget buat nyeri sendi saya. Recommended!', FALSE, CURRENT_TIMESTAMP - INTERVAL '15 days'),
(8, 6, 4, 'Cetirizine efektif untuk alergi saya, tapi bikin sedikit ngantuk.', FALSE, CURRENT_TIMESTAMP - INTERVAL '7 days');

-- ============================================
-- 11. INSERT ADMIN ACTIVITY LOGS
-- ============================================
INSERT INTO admin_activity_logs (admin_id, action_type, target_type, target_id, description, old_values, new_values, created_at) VALUES
(1, 'update_order_status', 'order', 1, 'Updated order status from preparing to ready', 
    '{"status": "preparing"}'::jsonb, '{"status": "ready"}'::jsonb, CURRENT_TIMESTAMP - INTERVAL '5 days'),
(1, 'update_product', 'product', 1, 'Updated product stock', 
    '{"stock": 150}'::jsonb, '{"stock": 144}'::jsonb, CURRENT_TIMESTAMP - INTERVAL '6 days'),
(2, 'update_order_status', 'order', 2, 'Updated order status from confirmed to preparing', 
    '{"status": "confirmed"}'::jsonb, '{"status": "preparing"}'::jsonb, CURRENT_TIMESTAMP - INTERVAL '1 day');

-- ============================================
-- 12. INSERT SAMPLE CART ITEMS
-- ============================================
INSERT INTO cart_items (user_id, product_id, quantity, added_at) VALUES
(6, 1, 2, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(6, 8, 1, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(7, 4, 3, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(7, 9, 1, CURRENT_TIMESTAMP - INTERVAL '1 day');

-- ============================================
-- 13. INSERT SAVED FOR LATER
-- ============================================
INSERT INTO saved_for_later (user_id, product_id, saved_at) VALUES
(6, 5, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(7, 6, CURRENT_TIMESTAMP - INTERVAL '2 days');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
SELECT 'Seed data berhasil diinput!' as status;

SELECT 'Total Users: ' || COUNT(*) FROM users;
SELECT 'Total Products: ' || COUNT(*) FROM products;
SELECT 'Total Orders: ' || COUNT(*) FROM orders;
SELECT 'Total Order Items: ' || COUNT(*) FROM order_items;
SELECT 'Total Notifications: ' || COUNT(*) FROM notifications;
SELECT 'Total Reviews: ' || COUNT(*) FROM product_reviews;
SELECT 'Total Coupons: ' || COUNT(*) FROM coupons;
SELECT 'Total Cart Items: ' || COUNT(*) FROM cart_items;

-- ============================================
-- END OF SEED DATA
-- ============================================

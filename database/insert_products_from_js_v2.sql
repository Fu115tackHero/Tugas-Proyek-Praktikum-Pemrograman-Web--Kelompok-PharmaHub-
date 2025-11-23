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
-- INSERT PRODUCT DETAILS (Detail info untuk setiap produk)
-- ============================================

INSERT INTO product_details (product_id, generic_name, uses, ingredients, precaution, side_effects, interactions, indication) VALUES
-- 1. Paracetamol 500mg
(1, 'Paracetamol',
 'Menurunkan demam, meredakan nyeri ringan hingga sedang seperti sakit kepala, sakit gigi, nyeri otot.',
 ARRAY['Paracetamol 500 mg', 'Mikrokristalin selulosa', 'Natrium starch glikolat', 'Polivinilpirolidon', 'Magnesium stearat', 'Talk'],
 ARRAY['Jangan melebihi dosis yang dianjurkan (maksimal 4 gram per hari untuk dewasa)', 'Konsultasikan dengan dokter jika memiliki riwayat penyakit hati', 'Hindari konsumsi alkohol selama pengobatan'],
 ARRAY['Jarang terjadi efek samping jika digunakan sesuai dosis', 'Reaksi alergi kulit (ruam, gatal) pada beberapa orang', 'Gangguan hati jika dikonsumsi berlebihan'],
 ARRAY['Warfarin: dapat meningkatkan risiko perdarahan', 'Obat epilepsi: dapat mengurangi efektivitas paracetamol', 'Alkohol: meningkatkan risiko kerusakan hati'],
 ARRAY['Demam pada anak dan dewasa', 'Sakit kepala ringan hingga sedang', 'Nyeri otot dan sendi ringan', 'Sakit gigi']),

-- 2. Ibuprofen 400mg
(2, 'Ibuprofen',
 'Mengurangi peradangan, menurunkan demam, meredakan nyeri otot dan sendi.',
 ARRAY['Ibuprofen 400 mg', 'Laktosa monohidrat', 'Pati jagung', 'Natrium kroskarmelosa', 'Silika koloid anhidrat', 'Magnesium stearat', 'Hypromellose'],
 ARRAY['Konsumsi bersama makanan untuk mengurangi iritasi lambung', 'Hindari jika memiliki riwayat tukak lambung', 'Hati-hati pada penderita hipertensi dan penyakit jantung'],
 ARRAY['Gangguan pencernaan (mual, nyeri perut)', 'Pusing dan sakit kepala', 'Ruam kulit pada beberapa kasus'],
 ARRAY['Aspirin: meningkatkan risiko perdarahan', 'ACE inhibitor: dapat mengurangi efek penurun tekanan darah', 'Lithium: dapat meningkatkan kadar lithium dalam darah'],
 ARRAY['Nyeri dan peradangan pada arthritis', 'Nyeri otot dan keseleo', 'Sakit gigi dan nyeri pascaoperasi', 'Demam']),

-- 3. Promag
(3, 'Antasida',
 'Meredakan sakit maag, nyeri ulu hati, kembung, dan mual akibat asam lambung berlebih.',
 ARRAY['Aluminum hydroxide 200 mg', 'Magnesium hydroxide 200 mg', 'Simethicone 25 mg', 'Sorbitol', 'Sukrosa', 'Natrium siklamat', 'Peppermint oil'],
 ARRAY['Konsumsi 1-2 jam setelah makan atau saat gejala muncul', 'Hindari konsumsi bersamaan dengan obat lain (jarak minimal 2 jam)', 'Konsultasikan dengan dokter jika gejala berlanjut lebih dari 2 minggu'],
 ARRAY['Konstipasi atau diare ringan', 'Mual pada beberapa kasus', 'Perubahan warna feses menjadi kehitaman (normal)'],
 ARRAY['Antibiotik: dapat mengurangi penyerapan antibiotik', 'Digoxin: dapat mengurangi efektivitas digoxin', 'Obat tiroid: dapat mengganggu penyerapan hormon tiroid'],
 ARRAY['Gastritis dan sakit maag', 'Nyeri ulu hati (heartburn)', 'Kembung dan begah', 'Gangguan pencernaan akibat asam lambung']),

-- 4. Loperamide (Imodium)
(4, 'Loperamide',
 'Mengatasi diare akut dengan mengurangi pergerakan usus dan meningkatkan penyerapan air.',
 ARRAY['Loperamide hydrochloride 2 mg', 'Laktosa monohidrat', 'Pati jagung', 'Polivinilpirolidon', 'Magnesium stearat', 'Silika koloid'],
 ARRAY['Jangan gunakan jika diare disertai demam tinggi atau darah', 'Hentikan penggunaan jika gejala memburuk setelah 2 hari', 'Perbanyak minum air untuk mencegah dehidrasi'],
 ARRAY['Konstipasi jika digunakan berlebihan', 'Pusing dan mengantuk', 'Mual dan kembung ringan'],
 ARRAY['Antibiotik: hindari penggunaan bersamaan tanpa konsultasi dokter', 'Opioid: dapat meningkatkan efek sedasi', 'Quinidine: dapat meningkatkan konsentrasi loperamide'],
 ARRAY['Diare akut non-spesifik', 'Diare wisatawan', 'Diare kronik (dengan pengawasan dokter)', 'Mengurangi output ileostomi']),

-- 5. Cetirizine
(5, 'Cetirizine',
 'Meredakan gejala alergi seperti bersin, hidung tersumbat, mata berair, dan gatal-gatal.',
 ARRAY['Cetirizine dihydrochloride 10 mg', 'Mikrokristalin selulosa', 'Laktosa monohidrat', 'Natrium starch glikolat', 'Magnesium stearat', 'Hypromellose', 'Titanium dioxide'],
 ARRAY['Dapat menyebabkan kantuk pada beberapa orang', 'Hindari mengemudi atau mengoperasikan mesin berat', 'Kurangi dosis pada penderita gangguan ginjal'],
 ARRAY['Kantuk ringan (lebih jarang daripada antihistamin generasi pertama)', 'Mulut kering', 'Sakit kepala ringan'],
 ARRAY['Alkohol: dapat meningkatkan efek sedasi', 'Teofilin: dapat mengurangi clearance cetirizine', 'Ritonavir: dapat meningkatkan konsentrasi cetirizine'],
 ARRAY['Rhinitis alergi musiman dan tahunan', 'Urtikaria kronik', 'Dermatitis atopik', 'Alergi makanan ringan']),

-- 6. Salbutamol Inhaler
(6, 'Salbutamol',
 'Meredakan sesak napas, bronkospasme, dan gejala asma akut.',
 ARRAY['Salbutamol sulfate 100 mcg per actuation', 'HFA-134a propellant', 'Ethanol', 'Oleic acid'],
 ARRAY['Kocok inhaler sebelum digunakan', 'Bilas mulut setelah penggunaan', 'Jangan melebihi dosis yang dianjurkan'],
 ARRAY['Tremor ringan pada tangan', 'Jantung berdebar', 'Sakit kepala ringan'],
 ARRAY['Beta-blocker: dapat mengurangi efektivitas salbutamol', 'Diuretik: dapat meningkatkan risiko hipokalemia', 'Antidepresan trisiklik: dapat meningkatkan efek kardiovaskular'],
 ARRAY['Asma bronkial', 'Penyakit paru obstruktif kronik (PPOK)', 'Bronkospasme akut', 'Pencegahan asma akibat aktivitas']),

-- 7. Betadine
(7, 'Povidone Iodine',
 'Antiseptik untuk luka kecil, goresan, dan pencegahan infeksi pada luka luar.',
 ARRAY['Povidone iodine 10%', 'Nonoxynol-9', 'Sodium phosphate', 'Citric acid', 'Sodium hydroxide', 'Purified water'],
 ARRAY['Hanya untuk penggunaan luar', 'Hindari kontak dengan mata', 'Jangan gunakan pada luka yang luas atau dalam'],
 ARRAY['Iritasi kulit ringan pada penggunaan pertama', 'Reaksi alergi pada orang sensitif terhadap iodine', 'Perubahan warna kulit sementara'],
 ARRAY['Hidrogen peroksida: dapat mengurangi efektivitas', 'Obat topikal lain: hindari penggunaan bersamaan', 'Silver sulfadiazine: dapat bereaksi dan mengurangi efektivitas'],
 ARRAY['Luka kecil dan goresan', 'Antiseptik sebelum injeksi', 'Pembersihan kulit sebelum operasi kecil', 'Pencegahan infeksi pada luka minor']),

-- 8. Oralit
(8, 'Oralit',
 'Mengganti cairan dan elektrolit yang hilang akibat diare, muntah, atau berkeringat berlebihan.',
 ARRAY['Sodium chloride 2.6 g', 'Potassium chloride 1.5 g', 'Glucose anhydrous 13.5 g', 'Trisodium citrate dihydrate 2.9 g', 'Zinc sulfate 0.03 g (per sachet)'],
 ARRAY['Larutkan dalam air matang dingin', 'Habiskan dalam 24 jam setelah dilarutkan', 'Konsultasikan dokter jika dehidrasi berat'],
 ARRAY['Mual jika diminum terlalu cepat', 'Muntah pada kasus dehidrasi berat', 'Rasa tidak enak di mulut (normal)'],
 ARRAY['Tidak ada interaksi obat yang signifikan', 'Aman dikombinasikan dengan obat diare', 'Dapat diberikan bersama antibiotik jika diperlukan'],
 ARRAY['Dehidrasi ringan hingga sedang', 'Diare akut pada anak dan dewasa', 'Muntah-muntah', 'Kehilangan cairan akibat berkeringat berlebihan']),

-- 9. Vitamin C 500mg
(9, 'Vitamin C',
 'Meningkatkan sistem imun, membantu penyembuhan luka, dan melindungi dari radikal bebas.',
 ARRAY['Cholecalciferol (Vitamin D3) 1000 IU', 'Mikrokristalin selulosa', 'Laktosa monohidrat', 'Croscarmellose sodium', 'Magnesium stearat', 'Gelatin (kapsul)', 'Minyak kelapa sawit'],
 ARRAY['Konsumsi setelah makan untuk mengurangi iritasi lambung', 'Jangan melebihi dosis yang dianjurkan', 'Konsultasikan dengan dokter jika sedang hamil atau menyusui'],
 ARRAY['Gangguan pencernaan ringan pada dosis tinggi', 'Diare jika dikonsumsi berlebihan', 'Batu ginjal pada konsumsi jangka panjang dosis tinggi'],
 ARRAY['Warfarin: dapat meningkatkan efek antikoagulan', 'Aspirin: dapat mengurangi penyerapan vitamin C', 'Suplemen zat besi: dapat meningkatkan penyerapan zat besi'],
 ARRAY['Defisiensi vitamin C', 'Meningkatkan daya tahan tubuh', 'Membantu penyembuhan luka', 'Pencegahan sariawan']),

-- 10. Amoxicillin 500mg
(10, 'Amoxicillin',
 'Mengobati infeksi bakteri pada saluran pernapasan, kulit, dan saluran kemih.',
 ARRAY['Amoxicillin trihydrate 500 mg', 'Mikrokristalin selulosa', 'Natrium starch glikolat', 'Polivinilpirolidon', 'Magnesium stearat', 'Silika koloid', 'Hypromellose'],
 ARRAY['WAJIB dengan resep dokter', 'Habiskan antibiotik sesuai durasi yang diresepkan', 'Jangan gunakan jika alergi penisilin'],
 ARRAY['Diare ringan', 'Mual dan muntah', 'Ruam kulit (reaksi alergi)'],
 ARRAY['Probenecid: dapat meningkatkan kadar amoxicillin', 'Warfarin: dapat meningkatkan efek antikoagulan', 'Pil KB: dapat mengurangi efektivitas kontrasepsi'],
 ARRAY['Infeksi saluran pernapasan', 'Infeksi kulit dan jaringan lunak', 'Infeksi saluran kemih', 'Otitis media']),

-- 11. Omeprazole 20mg
(11, 'Omeprazole',
 'Mengurangi produksi asam lambung, mengobati tukak lambung dan GERD.',
 ARRAY['Omeprazole 20 mg', 'Laktosa monohidrat', 'Natrium bikarbonat', 'Natrium lauril sulfat', 'Krospovidon', 'Hypromellose', 'Magnesium stearat'],
 ARRAY['WAJIB dengan resep dokter', 'Konsumsi 30 menit sebelum makan', 'Hindari penggunaan jangka panjang tanpa pengawasan dokter'],
 ARRAY['Sakit kepala', 'Diare atau konstipasi', 'Mual ringan'],
 ARRAY['Warfarin: dapat meningkatkan risiko perdarahan', 'Clopidogrel: dapat mengurangi efektivitas clopidogrel', 'Ketoconazole: dapat mengurangi penyerapan ketoconazole'],
 ARRAY['Tukak lambung dan duodenum', 'GERD (Gastroesophageal Reflux Disease)', 'Sindrom Zollinger-Ellison', 'Eradikasi H. pylori']),

-- 12. Vitamin D3 1000 IU
(12, 'Vitamin D3',
 'Mendukung kesehatan tulang, gigi, dan sistem imun.',
 ARRAY['Vitamin C (Ascorbic acid) 500 mg', 'Mikrokristalin selulosa', 'Croscarmellose sodium', 'Hypromellose', 'Magnesium stearat', 'Silika koloid', 'Titanium dioxide'],
 ARRAY['Konsumsi bersama makanan berlemak untuk penyerapan optimal', 'Pantau kadar vitamin D dalam darah secara berkala', 'Hindari overdosis vitamin D'],
 ARRAY['Mual jika overdosis', 'Konstipasi pada dosis tinggi', 'Hiperkalsemia jika dikonsumsi berlebihan'],
 ARRAY['Thiazide diuretics: dapat meningkatkan risiko hiperkalsemia', 'Digoxin: peningkatan kalsium dapat meningkatkan toksisitas digoxin', 'Suplemen kalsium: dapat meningkatkan penyerapan kalsium'],
 ARRAY['Defisiensi vitamin D', 'Osteoporosis dan osteomalacia', 'Rakhitis pada anak', 'Hipoparatiroidisme']),

-- 13. Multivitamin Complete
(13, 'Multivitamin',
 'Memenuhi kebutuhan vitamin dan mineral harian untuk menjaga kesehatan tubuh.',
 ARRAY['Vitamin A 5000 IU', 'Vitamin C 60 mg', 'Vitamin D3 400 IU', 'Vitamin E 30 IU', 'Vitamin B1 1.5 mg', 'Vitamin B2 1.7 mg', 'Vitamin B6 2 mg', 'Vitamin B12 6 mcg', 'Niacin 20 mg', 'Folic acid 400 mcg', 'Biotin 30 mcg', 'Pantothenic acid 10 mg', 'Calcium 162 mg', 'Iron 18 mg', 'Magnesium 100 mg', 'Zinc 15 mg', 'Selenium 20 mcg'],
 ARRAY['Konsumsi setelah makan', 'Jangan melebihi dosis yang dianjurkan', 'Simpan di tempat sejuk dan kering'],
 ARRAY['Mual jika dikonsumsi saat perut kosong', 'Perubahan warna urin (normal)', 'Gangguan pencernaan ringan'],
 ARRAY['Antibiotik: dapat mengurangi penyerapan beberapa antibiotik', 'Warfarin: vitamin K dapat mempengaruhi efek antikoagulan', 'Levothyroxine: dapat mengurangi penyerapan hormon tiroid'],
 ARRAY['Defisiensi vitamin dan mineral', 'Malnutrisi', 'Periode pemulihan setelah sakit', 'Kebutuhan nutrisi meningkat']),

-- 14. Alcohol 70%
(14, 'Alcohol',
 'Membersihkan tangan, sterilisasi alat, dan desinfeksi permukaan.',
 ARRAY['Ethyl alcohol 70%', 'Carbomer 940', 'Triethanolamine', 'Tocopheryl acetate (Vitamin E)', 'Aloe vera extract', 'Purified water'],
 ARRAY['Hanya untuk penggunaan luar', 'Hindari kontak dengan mata', 'Jauhkan dari api dan sumber panas'],
 ARRAY['Kulit kering dengan penggunaan berlebihan', 'Iritasi pada kulit sensitif', 'Dermatitis kontak pada penggunaan berulang'],
 ARRAY['Tidak ada interaksi obat yang signifikan', 'Dapat merusak beberapa jenis plastik', 'Dapat mengurangi efektivitas hand sanitizer berbasis alkohol lain'],
 ARRAY['Antiseptik tangan', 'Sterilisasi alat medis', 'Desinfeksi permukaan', 'Pembersihan sebelum injeksi']),

-- 15. Captopril 25mg
(15, 'Captopril',
 'Mengontrol tekanan darah tinggi dan mencegah komplikasi jantung.',
 ARRAY['Captopril 25 mg', 'Mikrokristalin selulosa', 'Laktosa monohidrat', 'Croscarmellose sodium', 'Magnesium stearat', 'Hypromellose'],
 ARRAY['WAJIB dengan resep dokter', 'Monitor tekanan darah secara teratur', 'Konsumsi 1 jam sebelum makan'],
 ARRAY['Batuk kering', 'Hipotensi (tekanan darah rendah)', 'Peningkatan kadar kalium'],
 ARRAY['Diuretik: dapat meningkatkan efek penurun tekanan darah', 'Suplemen kalium: dapat menyebabkan hiperkalemia', 'NSAIDs: dapat mengurangi efek antihipertensi'],
 ARRAY['Hipertensi (tekanan darah tinggi)', 'Gagal jantung', 'Nefropati diabetik', 'Pasca infark miokard']);

-- ============================================
-- VERIFY DATA
-- ============================================

SELECT 'Total Categories' as info, COUNT(*) as count FROM product_categories
UNION ALL
SELECT 'Total Products', COUNT(*) FROM products
UNION ALL
SELECT 'Total Product Details', COUNT(*) FROM product_details;

SELECT 'Data Migration Complete' as status, 
       (SELECT COUNT(*) FROM products) as products_count,
       (SELECT COUNT(*) FROM product_details) as details_count;

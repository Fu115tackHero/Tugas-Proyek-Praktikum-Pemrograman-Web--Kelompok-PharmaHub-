-- ============================================
-- SCRIPT CEK GAMBAR PRODUK
-- ============================================

-- 1. Cek berapa produk yang punya gambar
SELECT 
    COUNT(*) FILTER (WHERE main_image IS NOT NULL) as produk_dengan_gambar,
    COUNT(*) FILTER (WHERE main_image IS NULL) as produk_tanpa_gambar,
    COUNT(*) as total_produk
FROM products;

-- 2. Lihat detail produk dan status gambar
SELECT 
    product_id,
    name,
    brand,
    CASE 
        WHEN main_image IS NOT NULL THEN '✅ Ada Gambar'
        ELSE '❌ Tidak Ada Gambar'
    END as status_gambar,
    main_image_mime_type as tipe_mime,
    main_image_filename as nama_file,
    CASE 
        WHEN main_image IS NOT NULL THEN 
            ROUND(octet_length(main_image) / 1024.0, 2) || ' KB'
        ELSE 'N/A'
    END as ukuran_gambar,
    stock,
    price,
    is_active
FROM products
ORDER BY product_id;

-- 3. Lihat hanya produk yang TIDAK PUNYA gambar
SELECT 
    product_id,
    name,
    brand,
    category_id,
    price
FROM products
WHERE main_image IS NULL
ORDER BY product_id;

-- 4. Lihat hanya produk yang PUNYA gambar
SELECT 
    product_id,
    name,
    brand,
    main_image_filename,
    ROUND(octet_length(main_image) / 1024.0, 2) as ukuran_kb
FROM products
WHERE main_image IS NOT NULL
ORDER BY product_id;

-- 5. Cek ukuran total semua gambar di database
SELECT 
    ROUND(SUM(octet_length(main_image)) / 1024.0 / 1024.0, 2) as total_mb
FROM products
WHERE main_image IS NOT NULL;

-- 6. Cek produk dengan gambar terbesar
SELECT 
    product_id,
    name,
    ROUND(octet_length(main_image) / 1024.0, 2) as ukuran_kb
FROM products
WHERE main_image IS NOT NULL
ORDER BY octet_length(main_image) DESC
LIMIT 10;

-- 7. Test ambil sample gambar (untuk validasi)
-- Uncomment line di bawah dan ganti product_id sesuai kebutuhan
-- SELECT 
--     product_id,
--     name,
--     encode(main_image, 'base64') as base64_image,
--     main_image_mime_type
-- FROM products
-- WHERE product_id = 1;

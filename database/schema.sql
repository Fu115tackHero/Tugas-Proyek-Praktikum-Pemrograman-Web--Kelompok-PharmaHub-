-- ============================================
-- PHARMAHUB DATABASE SCHEMA - PostgreSQL
-- Sistem Manajemen Apotek Online
-- ============================================

-- Menghapus tabel jika sudah ada (untuk development)
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS saved_for_later CASCADE;
DROP TABLE IF EXISTS product_reviews CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS coupon_usage CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS admin_activity_logs CASCADE;
DROP TABLE IF EXISTS sales_reports CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;

-- ============================================
-- TABEL USERS (Pengguna & Admin)
-- ============================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'customer', -- 'customer', 'admin', 'pharmacist'
    profile_photo BYTEA, -- Menyimpan foto profil dalam format binary
    photo_mime_type VARCHAR(50), -- Tipe MIME foto (image/jpeg, image/png, dll)
    photo_filename VARCHAR(255), -- Nama file asli foto
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    CONSTRAINT check_role CHECK (role IN ('customer', 'admin', 'pharmacist'))
);

-- Index untuk pencarian cepat
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_phone ON users(phone);

-- ============================================
-- TABEL USER ADDRESSES (Alamat Pengiriman)
-- ============================================
CREATE TABLE user_addresses (
    address_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    address_label VARCHAR(50), -- 'Rumah', 'Kantor', dll
    recipient_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    full_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10),
    is_default BOOLEAN DEFAULT FALSE,
    latitude DECIMAL(10, 8), -- Untuk map integration
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_user ON user_addresses(user_id);
CREATE INDEX idx_addresses_default ON user_addresses(user_id, is_default);

-- ============================================
-- TABEL PASSWORD RESET TOKENS
-- ============================================
CREATE TABLE password_reset_tokens (
    token_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_reset_tokens_user ON password_reset_tokens(user_id);

-- ============================================
-- TABEL PRODUCT CATEGORIES (Kategori Produk)
-- ============================================
CREATE TABLE product_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_image BYTEA, -- Icon kategori
    icon_mime_type VARCHAR(50),
    parent_category_id INTEGER REFERENCES product_categories(category_id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_parent ON product_categories(parent_category_id);

-- ============================================
-- TABEL PRODUCTS (Produk/Obat)
-- ============================================
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    category_id INTEGER REFERENCES product_categories(category_id),
    generic_name VARCHAR(255), -- Nama generik obat
    price DECIMAL(12, 2) NOT NULL,
    description TEXT,
    uses TEXT, -- Kegunaan obat
    how_it_works TEXT, -- Cara kerja obat
    
    -- Informasi Penting (Array)
    important_info TEXT[], -- Array informasi penting
    ingredients TEXT[], -- Array komposisi/bahan
    precaution TEXT[], -- Array peringatan/kehati-hatian
    side_effects TEXT[], -- Array efek samping
    interactions TEXT[], -- Array interaksi obat
    indication TEXT[], -- Array indikasi penggunaan
    
    -- Stock & Prescription
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 10, -- Minimum stok untuk alert
    prescription_required BOOLEAN DEFAULT FALSE,
    
    -- Gambar Utama Produk
    main_image BYTEA, -- Gambar utama produk
    main_image_mime_type VARCHAR(50),
    main_image_filename VARCHAR(255),
    
    -- Status & Metadata
    is_active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE, -- Produk unggulan
    view_count INTEGER DEFAULT 0,
    sold_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_price CHECK (price >= 0),
    CONSTRAINT check_stock CHECK (stock >= 0)
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_generic ON products(generic_name);
CREATE INDEX idx_products_prescription ON products(prescription_required);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(featured);

-- ============================================
-- TABEL PRODUCT IMAGES (Gambar Produk Tambahan)
-- ============================================
CREATE TABLE product_images (
    image_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    image_data BYTEA NOT NULL, -- Data gambar dalam binary
    image_mime_type VARCHAR(50) NOT NULL,
    image_filename VARCHAR(255),
    image_order INTEGER DEFAULT 0, -- Urutan tampilan gambar
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(product_id, is_primary);

-- ============================================
-- TABEL PRODUCT REVIEWS (Review Produk)
-- ============================================
CREATE TABLE product_reviews (
    review_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    review_images BYTEA[], -- Array gambar review
    review_images_mime_types TEXT[], -- Array tipe MIME gambar
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_reviews_user ON product_reviews(user_id);
CREATE INDEX idx_reviews_rating ON product_reviews(rating);

-- ============================================
-- TABEL COUPONS (Kupon Diskon)
-- ============================================
CREATE TABLE coupons (
    coupon_id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
    discount_value DECIMAL(12, 2) NOT NULL,
    min_purchase DECIMAL(12, 2) DEFAULT 0,
    max_discount DECIMAL(12, 2), -- Maksimal diskon untuk percentage
    usage_limit INTEGER, -- Batas total penggunaan
    usage_per_user INTEGER DEFAULT 1, -- Batas penggunaan per user
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_discount_type CHECK (discount_type IN ('percentage', 'fixed')),
    CONSTRAINT check_discount_value CHECK (discount_value > 0)
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);
CREATE INDEX idx_coupons_dates ON coupons(start_date, end_date);

-- ============================================
-- TABEL COUPON USAGE (Penggunaan Kupon)
-- ============================================
CREATE TABLE coupon_usage (
    usage_id SERIAL PRIMARY KEY,
    coupon_id INTEGER NOT NULL REFERENCES coupons(coupon_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    order_id INTEGER, -- Will be linked after orders table is created
    discount_amount DECIMAL(12, 2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user ON coupon_usage(user_id);
CREATE INDEX idx_coupon_usage_order ON coupon_usage(order_id);

-- ============================================
-- TABEL CART ITEMS (Item di Keranjang)
-- ============================================
CREATE TABLE cart_items (
    cart_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_quantity CHECK (quantity > 0),
    CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_cart_product ON cart_items(product_id);

-- ============================================
-- TABEL SAVED FOR LATER (Simpan untuk Nanti)
-- ============================================
CREATE TABLE saved_for_later (
    saved_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_saved_user_product UNIQUE (user_id, product_id)
);

CREATE INDEX idx_saved_user ON saved_for_later(user_id);
CREATE INDEX idx_saved_product ON saved_for_later(product_id);

-- ============================================
-- TABEL ORDERS (Pesanan)
-- ============================================
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE, -- Format: PHARMAHUB-YYYYMMDD-XXXXX
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    
    -- Informasi Pelanggan
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20) NOT NULL,
    
    -- Alamat Pengiriman (jika ada)
    shipping_address TEXT,
    shipping_city VARCHAR(100),
    shipping_province VARCHAR(100),
    shipping_postal_code VARCHAR(10),
    
    -- Biaya & Pembayaran
    subtotal DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    shipping_cost DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    
    -- Kupon yang digunakan
    coupon_code VARCHAR(50),
    
    -- Metode Pembayaran & Status
    payment_method VARCHAR(50) NOT NULL, -- 'midtrans_online', 'bayar_ditempat', 'transfer_bank'
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    payment_proof BYTEA, -- Bukti pembayaran (untuk transfer manual)
    payment_proof_mime_type VARCHAR(50),
    
    -- Status Pesanan
    order_status VARCHAR(50) NOT NULL DEFAULT 'pending', 
    -- 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'
    
    -- Catatan & Metadata
    notes TEXT,
    cancellation_reason TEXT,
    prescription_image BYTEA, -- Resep dokter (jika diperlukan)
    prescription_mime_type VARCHAR(50),
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    CONSTRAINT check_totals CHECK (total_amount >= 0),
    CONSTRAINT check_payment_method CHECK (payment_method IN ('midtrans_online', 'bayar_ditempat', 'transfer_bank', 'ewallet')),
    CONSTRAINT check_payment_status CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'unpaid')),
    CONSTRAINT check_order_status CHECK (order_status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled', 'delivered'))
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);

-- ============================================
-- TABEL ORDER ITEMS (Item dalam Pesanan)
-- ============================================
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    product_name VARCHAR(255) NOT NULL, -- Simpan nama untuk history
    product_price DECIMAL(12, 2) NOT NULL, -- Simpan harga saat order
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    
    CONSTRAINT check_quantity_positive CHECK (quantity > 0),
    CONSTRAINT check_price_positive CHECK (product_price >= 0)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Link coupon_usage to orders table
ALTER TABLE coupon_usage 
ADD CONSTRAINT fk_coupon_usage_order 
FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL;

-- ============================================
-- TABEL ORDER STATUS HISTORY (Riwayat Status Pesanan)
-- ============================================
CREATE TABLE order_status_history (
    history_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    notes TEXT,
    changed_by INTEGER REFERENCES users(user_id), -- Admin yang mengubah
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_status_history_order ON order_status_history(order_id);
CREATE INDEX idx_status_history_changed_at ON order_status_history(changed_at DESC);

-- ============================================
-- TABEL NOTIFICATIONS (Notifikasi)
-- ============================================
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'order', 'promotion', 'system', 'stock_alert'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Metadata
    related_order_id INTEGER REFERENCES orders(order_id) ON DELETE SET NULL,
    related_product_id INTEGER REFERENCES products(product_id) ON DELETE SET NULL,
    
    -- Icon & Image
    icon_type VARCHAR(50), -- 'success', 'info', 'warning', 'error'
    notification_image BYTEA,
    notification_image_mime_type VARCHAR(50),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    -- Link action
    action_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    CONSTRAINT check_notification_type CHECK (type IN ('order', 'promotion', 'system', 'stock_alert', 'review', 'payment'))
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- TABEL NOTIFICATION PREFERENCES (Preferensi Notifikasi)
-- ============================================
CREATE TABLE notification_preferences (
    preference_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE UNIQUE,
    email_order_updates BOOLEAN DEFAULT TRUE,
    email_promotions BOOLEAN DEFAULT TRUE,
    email_newsletters BOOLEAN DEFAULT FALSE,
    push_order_updates BOOLEAN DEFAULT TRUE,
    push_promotions BOOLEAN DEFAULT TRUE,
    sms_order_updates BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notif_pref_user ON notification_preferences(user_id);

-- ============================================
-- TABEL ADMIN ACTIVITY LOGS (Log Aktivitas Admin)
-- ============================================
CREATE TABLE admin_activity_logs (
    log_id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL, -- 'create_product', 'update_order', 'delete_user', dll
    target_type VARCHAR(50), -- 'product', 'order', 'user', dll
    target_id INTEGER,
    description TEXT,
    old_values JSONB, -- Data lama (format JSON)
    new_values JSONB, -- Data baru (format JSON)
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_logs_admin ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON admin_activity_logs(action_type);
CREATE INDEX idx_admin_logs_created ON admin_activity_logs(created_at DESC);

-- ============================================
-- TABEL SALES REPORTS (Laporan Penjualan)
-- ============================================
CREATE TABLE sales_reports (
    report_id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL UNIQUE,
    total_orders INTEGER DEFAULT 0,
    completed_orders INTEGER DEFAULT 0,
    cancelled_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(15, 2) DEFAULT 0,
    total_tax DECIMAL(15, 2) DEFAULT 0,
    total_discount DECIMAL(15, 2) DEFAULT 0,
    net_revenue DECIMAL(15, 2) DEFAULT 0,
    top_selling_product_id INTEGER REFERENCES products(product_id),
    top_selling_quantity INTEGER DEFAULT 0,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_reports_date ON sales_reports(report_date DESC);

-- ============================================
-- VIEWS (Tampilan untuk Query yang Sering Digunakan)
-- ============================================

-- View untuk Dashboard Admin
CREATE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM products WHERE is_active = TRUE) as total_active_products,
    (SELECT COUNT(*) FROM products WHERE stock < min_stock) as low_stock_products,
    (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE) as today_orders,
    (SELECT COUNT(*) FROM orders WHERE order_status IN ('pending', 'confirmed', 'preparing')) as pending_orders,
    (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE DATE(created_at) = CURRENT_DATE AND order_status = 'completed') as today_revenue,
    (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) AND order_status = 'completed') as monthly_revenue,
    (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
    (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE) as new_customers_today;

-- View untuk Produk Terlaris
CREATE VIEW top_selling_products AS
SELECT 
    p.product_id,
    p.name,
    p.brand,
    p.price,
    p.stock,
    p.sold_count,
    COUNT(DISTINCT oi.order_id) as total_orders,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.subtotal) as total_revenue
FROM products p
LEFT JOIN order_items oi ON p.product_id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.order_id AND o.order_status = 'completed'
WHERE p.is_active = TRUE
GROUP BY p.product_id, p.name, p.brand, p.price, p.stock, p.sold_count
ORDER BY total_quantity_sold DESC NULLS LAST;

-- View untuk Riwayat Pesanan User dengan Detail
CREATE VIEW user_order_history AS
SELECT 
    o.order_id,
    o.order_number,
    o.user_id,
    o.customer_name,
    o.customer_phone,
    o.total_amount,
    o.order_status,
    o.payment_status,
    o.payment_method,
    o.created_at,
    o.completed_at,
    COUNT(oi.order_item_id) as total_items,
    SUM(oi.quantity) as total_quantity
FROM orders o
LEFT JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY o.order_id, o.order_number, o.user_id, o.customer_name, 
         o.customer_phone, o.total_amount, o.order_status, o.payment_status,
         o.payment_method, o.created_at, o.completed_at
ORDER BY o.created_at DESC;

-- ============================================
-- FUNCTIONS (Fungsi untuk Automasi)
-- ============================================

-- Function untuk update timestamp otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON user_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function untuk generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_order_number TEXT;
    counter INTEGER;
BEGIN
    counter := (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE) + 1;
    new_order_number := 'PHARMAHUB-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 5, '0');
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Function untuk update stock produk setelah order
CREATE OR REPLACE FUNCTION update_product_stock_after_order()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE products 
        SET stock = stock - NEW.quantity,
            sold_count = sold_count + NEW.quantity
        WHERE product_id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock AFTER INSERT ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_product_stock_after_order();

-- Function untuk create notification saat order status berubah
CREATE OR REPLACE FUNCTION create_order_notification()
RETURNS TRIGGER AS $$
DECLARE
    notif_title TEXT;
    notif_message TEXT;
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.order_status != NEW.order_status) THEN
        CASE NEW.order_status
            WHEN 'confirmed' THEN
                notif_title := 'Pesanan Dikonfirmasi';
                notif_message := 'Pesanan ' || NEW.order_number || ' telah dikonfirmasi dan sedang disiapkan.';
            WHEN 'preparing' THEN
                notif_title := 'Pesanan Sedang Disiapkan';
                notif_message := 'Pesanan ' || NEW.order_number || ' sedang disiapkan oleh apoteker kami.';
            WHEN 'ready' THEN
                notif_title := 'Pesanan Siap Diambil';
                notif_message := 'Pesanan ' || NEW.order_number || ' sudah siap untuk diambil.';
            WHEN 'completed' THEN
                notif_title := 'Pesanan Selesai';
                notif_message := 'Pesanan ' || NEW.order_number || ' telah selesai. Terima kasih!';
            WHEN 'cancelled' THEN
                notif_title := 'Pesanan Dibatalkan';
                notif_message := 'Pesanan ' || NEW.order_number || ' telah dibatalkan.';
            ELSE
                RETURN NEW;
        END CASE;
        
        INSERT INTO notifications (user_id, type, title, message, related_order_id, icon_type)
        VALUES (NEW.user_id, 'order', notif_title, notif_message, NEW.order_id, 
                CASE WHEN NEW.order_status = 'cancelled' THEN 'error' 
                     WHEN NEW.order_status = 'completed' THEN 'success' 
                     ELSE 'info' END);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_order_notification AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION create_order_notification();

-- Function untuk notifikasi stock rendah
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.stock < NEW.min_stock AND (OLD.stock IS NULL OR OLD.stock >= OLD.min_stock)) THEN
        -- Kirim notifikasi ke semua admin
        INSERT INTO notifications (user_id, type, title, message, related_product_id, icon_type)
        SELECT 
            user_id,
            'stock_alert',
            'Stok Produk Rendah',
            'Produk "' || NEW.name || '" stock tersisa ' || NEW.stock || ' unit.',
            NEW.product_id,
            'warning'
        FROM users 
        WHERE role IN ('admin', 'pharmacist');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_low_stock_alert AFTER INSERT OR UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION check_low_stock();

-- ============================================
-- DATA AWAL (Sample Data untuk Testing)
-- ============================================

-- Insert Admin dan Customer Demo
INSERT INTO users (name, email, password_hash, phone, role, is_active, email_verified) VALUES
('Admin PharmaHub', 'admin@pharmahub.com', '$2b$10$example_hash_admin123', '081234567891', 'admin', TRUE, TRUE),
('Demo Customer', 'customer@pharmahub.com', '$2b$10$example_hash_customer123', '081234567890', 'customer', TRUE, TRUE),
('Apoteker PharmaHub', 'pharmacist@pharmahub.com', '$2b$10$example_hash_pharmacist123', '081234567892', 'pharmacist', TRUE, TRUE);

-- Insert Kategori Produk
INSERT INTO product_categories (category_name, description) VALUES
('Obat Nyeri & Demam', 'Obat untuk meredakan nyeri dan menurunkan demam'),
('Antibiotik', 'Obat untuk mengobati infeksi bakteri'),
('Vitamin & Suplemen', 'Vitamin dan suplemen kesehatan'),
('Obat Lambung', 'Obat untuk mengatasi masalah pencernaan dan lambung'),
('Obat Alergi', 'Obat untuk mengatasi reaksi alergi'),
('Obat Batuk & Flu', 'Obat untuk meredakan batuk dan gejala flu'),
('Obat Diabetes', 'Obat untuk mengontrol gula darah'),
('Obat Jantung', 'Obat untuk kesehatan jantung dan pembuluh darah');

-- Insert Sample Kupon
INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase, max_discount, usage_limit, usage_per_user, start_date, end_date, is_active) VALUES
('SEHAT10', 'Diskon 10% untuk semua produk', 'percentage', 10, 50000, 100000, 100, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE),
('SEHAT50K', 'Diskon Rp 50.000 untuk pembelian minimal Rp 200.000', 'fixed', 50000, 200000, NULL, 50, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE),
('NEWUSER', 'Diskon 15% untuk pengguna baru', 'percentage', 15, 0, 150000, 1000, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '90 days', TRUE);

-- Insert Notification Preferences untuk users
INSERT INTO notification_preferences (user_id, email_order_updates, email_promotions, push_order_updates, push_promotions)
SELECT user_id, TRUE, TRUE, TRUE, TRUE FROM users;

-- ============================================
-- COMMENTS (Komentar untuk Dokumentasi)
-- ============================================

COMMENT ON TABLE users IS 'Tabel untuk menyimpan data pengguna (customer, admin, pharmacist)';
COMMENT ON TABLE products IS 'Tabel untuk menyimpan data produk/obat';
COMMENT ON TABLE orders IS 'Tabel untuk menyimpan data pesanan';
COMMENT ON TABLE order_items IS 'Tabel untuk menyimpan detail item dalam pesanan';
COMMENT ON TABLE cart_items IS 'Tabel untuk menyimpan item di keranjang belanja';
COMMENT ON TABLE notifications IS 'Tabel untuk menyimpan notifikasi pengguna';
COMMENT ON TABLE coupons IS 'Tabel untuk menyimpan data kupon diskon';
COMMENT ON TABLE admin_activity_logs IS 'Tabel untuk mencatat aktivitas admin';

COMMENT ON COLUMN users.profile_photo IS 'Foto profil pengguna dalam format BYTEA (binary)';
COMMENT ON COLUMN products.main_image IS 'Gambar utama produk dalam format BYTEA (binary)';
COMMENT ON COLUMN orders.prescription_image IS 'Foto resep dokter dalam format BYTEA (binary)';
COMMENT ON COLUMN orders.payment_proof IS 'Bukti pembayaran dalam format BYTEA (binary)';
COMMENT ON COLUMN product_images.image_data IS 'Data gambar produk tambahan dalam format BYTEA (binary)';

-- ============================================
-- GRANT PERMISSIONS (Opsional - untuk production)
-- ============================================
-- Uncomment jika ingin set permissions untuk user database tertentu
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO pharmahub_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO pharmahub_app_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO pharmahub_app_user;

-- ============================================
-- END OF SCHEMA
-- ============================================

-- Query untuk verifikasi schema
SELECT 'Schema PharmaHub berhasil dibuat!' as status;

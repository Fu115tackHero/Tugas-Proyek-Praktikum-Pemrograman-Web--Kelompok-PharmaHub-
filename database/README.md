# PharmaHub Database Documentation

## 📋 Deskripsi

Database PostgreSQL untuk aplikasi PharmaHub - Sistem Manajemen Apotek Online yang lengkap dengan fitur e-commerce, manajemen produk obat, sistem pemesanan, notifikasi, dan dashboard admin.

## 🗂️ Struktur Database

### File-file Database

- **`schema.sql`** - Schema database lengkap dengan semua tabel, indexes, triggers, dan functions
- **`sample_queries.sql`** - Kumpulan query yang sering digunakan untuk berbagai operasi
- **`README.md`** - Dokumentasi ini

## 📊 Tabel-tabel Utama

### 1. Users & Authentication

- **`users`** - Data pengguna (customer, admin, pharmacist)
- **`user_addresses`** - Alamat pengiriman pengguna
- **`password_reset_tokens`** - Token untuk reset password

### 2. Products & Categories

- **`products`** - Data produk/obat dengan detail lengkap
- **`product_categories`** - Kategori produk
- **`product_images`** - Gambar produk tambahan
- **`product_reviews`** - Review dan rating produk

### 3. Shopping & Orders

- **`cart_items`** - Item di keranjang belanja
- **`saved_for_later`** - Item yang disimpan untuk nanti
- **`orders`** - Data pesanan
- **`order_items`** - Detail item dalam pesanan
- **`order_status_history`** - Riwayat perubahan status pesanan

### 4. Promotions

- **`coupons`** - Data kupon diskon
- **`coupon_usage`** - Riwayat penggunaan kupon

### 5. Notifications & Logs

- **`notifications`** - Notifikasi pengguna
- **`notification_preferences`** - Preferensi notifikasi user
- **`admin_activity_logs`** - Log aktivitas admin
- **`sales_reports`** - Laporan penjualan harian

## 🖼️ Penyimpanan Gambar

Database menggunakan tipe data **BYTEA** untuk menyimpan gambar dalam format binary. Ini mencakup:

### Tabel dengan Kolom BYTEA:

1. **users.profile_photo** - Foto profil pengguna
2. **products.main_image** - Gambar utama produk
3. **product_images.image_data** - Gambar produk tambahan
4. **product_categories.icon_image** - Icon kategori
5. **orders.prescription_image** - Foto resep dokter
6. **orders.payment_proof** - Bukti pembayaran
7. **notifications.notification_image** - Gambar notifikasi
8. **product_reviews.review_images** - Array gambar review (BYTEA[])

### Format Penyimpanan:

```sql
-- Menyimpan gambar (dari base64)
UPDATE users
SET
    profile_photo = DECODE('base64_string', 'base64'),
    photo_mime_type = 'image/jpeg',
    photo_filename = 'profile.jpg'
WHERE user_id = 1;

-- Mengambil gambar (ke base64)
SELECT
    ENCODE(profile_photo, 'base64') as photo_base64,
    photo_mime_type
FROM users
WHERE user_id = 1;
```

### MIME Types yang Didukung:

- `image/jpeg` - JPEG/JPG
- `image/png` - PNG
- `image/gif` - GIF
- `image/webp` - WebP
- `image/svg+xml` - SVG

## 🚀 Instalasi Database

### Prerequisites:

- PostgreSQL 12 atau lebih baru
- pgAdmin 4 atau psql command line

### Langkah Instalasi:

#### 1. Buat Database Baru

```sql
CREATE DATABASE pharmahub_db;
```

#### 2. Connect ke Database

```bash
psql -U postgres -d pharmahub_db
```

Atau menggunakan pgAdmin:

- Klik kanan pada Databases → Create → Database
- Nama: `pharmahub_db`

#### 3. Jalankan Schema

```bash
psql -U postgres -d pharmahub_db -f schema.sql
```

Atau di pgAdmin:

- Buka Query Tool
- Load file `schema.sql`
- Execute (F5)

#### 4. Verifikasi Instalasi

```sql
-- Check semua tabel
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check sample data
SELECT * FROM users;
SELECT * FROM product_categories;
SELECT * FROM coupons;
```

## 📝 Penggunaan

### Contoh Query Dasar

#### 1. Register User Baru

```sql
INSERT INTO users (name, email, password_hash, phone, role)
VALUES (
    'John Doe',
    'john@example.com',
    '$2b$10$hashed_password_here',
    '081234567890',
    'customer'
);
```

#### 2. Tambah Produk

```sql
INSERT INTO products (
    name, brand, category_id, price, stock, description,
    prescription_required
) VALUES (
    'Paracetamol 500mg',
    'Sanbe Farma',
    1,
    12000,
    100,
    'Obat penurun demam',
    FALSE
);
```

#### 3. Buat Pesanan

```sql
INSERT INTO orders (
    order_number,
    user_id,
    customer_name,
    customer_phone,
    subtotal,
    total_amount,
    payment_method,
    order_status
) VALUES (
    generate_order_number(),
    1,
    'John Doe',
    '081234567890',
    100000,
    100000,
    'bayar_ditempat',
    'pending'
);
```

Lihat file **`sample_queries.sql`** untuk lebih banyak contoh query.

## 🔧 Features

### Automated Functions & Triggers

#### 1. Auto Update Timestamp

Otomatis update kolom `updated_at` saat data diubah:

- users
- products
- orders
- cart_items
- user_addresses
- product_categories

#### 2. Auto Generate Order Number

Function: `generate_order_number()`
Format: `PHARMAHUB-YYYYMMDD-00001`

```sql
SELECT generate_order_number();
-- Output: PHARMAHUB-20250121-00001
```

#### 3. Auto Update Stock

Trigger otomatis mengurangi stock produk saat order dibuat:

```sql
-- Saat insert order_items, stock produk otomatis berkurang
INSERT INTO order_items (order_id, product_id, quantity, ...)
VALUES (1, 5, 3, ...);
-- Stock product_id=5 berkurang 3 unit otomatis
```

#### 4. Auto Create Notifications

Trigger otomatis membuat notifikasi saat status order berubah:

- Order confirmed → "Pesanan Dikonfirmasi"
- Order preparing → "Pesanan Sedang Disiapkan"
- Order ready → "Pesanan Siap Diambil"
- Order completed → "Pesanan Selesai"
- Order cancelled → "Pesanan Dibatalkan"

#### 5. Low Stock Alert

Trigger otomatis mengirim notifikasi ke admin saat stock produk di bawah minimum:

```sql
-- Saat stock < min_stock, admin dapat notifikasi otomatis
UPDATE products SET stock = 5 WHERE product_id = 1;
-- Jika min_stock = 10, admin akan dapat notifikasi
```

### Views untuk Reporting

#### 1. admin_dashboard_stats

Statistik untuk dashboard admin:

```sql
SELECT * FROM admin_dashboard_stats;
```

Returns: total products, low stock, today orders, pending orders, revenue, customers

#### 2. top_selling_products

Produk terlaris:

```sql
SELECT * FROM top_selling_products LIMIT 10;
```

#### 3. user_order_history

Riwayat pesanan user dengan detail:

```sql
SELECT * FROM user_order_history WHERE user_id = 1;
```

## 🔐 Security & Best Practices

### 1. Password Hashing

Selalu gunakan bcrypt atau algoritma hashing yang kuat:

```javascript
// Node.js example
const bcrypt = require("bcrypt");
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

### 2. SQL Injection Prevention

Gunakan prepared statements:

```javascript
// Node.js with pg
const result = await pool.query("SELECT * FROM users WHERE email = $1", [
  email,
]);
```

### 3. Image Upload Validation

Validasi sebelum menyimpan gambar:

- Check MIME type
- Limit file size (max 5MB recommended)
- Sanitize filename
- Consider using external storage (S3, Cloudinary) untuk production

### 4. Indexes

Database sudah dilengkapi indexes untuk performa optimal:

- Primary Keys (auto-indexed)
- Foreign Keys
- Frequently queried columns (email, phone, order_number, etc.)

## 📊 Database Size Considerations

### Storage untuk Gambar BYTEA

**Keuntungan BYTEA:**

- ✅ Transactional consistency
- ✅ Backup bersama data
- ✅ Tidak perlu manage file system
- ✅ ACID compliance

**Kekurangan BYTEA:**

- ❌ Database size besar
- ❌ Slower untuk gambar besar
- ❌ Bandwidth overhead

**Rekomendasi:**

- **Development/Small Scale**: BYTEA OK
- **Production/Large Scale**: Gunakan external storage (AWS S3, Cloudinary, etc.) dan simpan URL di database

### Alternative: External Storage

```sql
-- Alih-alih BYTEA, simpan URL
ALTER TABLE products
ADD COLUMN main_image_url VARCHAR(500);

-- Store URL instead
UPDATE products
SET main_image_url = 'https://cdn.pharmahub.com/products/paracetamol.jpg'
WHERE product_id = 1;
```

## 🧪 Testing

### Sample Data

Schema sudah include sample data:

- 3 demo users (admin, customer, pharmacist)
- 8 product categories
- 3 sample coupons

### Run Test Queries

```sql
-- Test user login
SELECT * FROM users WHERE email = 'customer@pharmahub.com';

-- Test product search
SELECT * FROM products WHERE LOWER(name) LIKE '%paracetamol%';

-- Test order creation
INSERT INTO orders (...) VALUES (...);

-- Test notifications
SELECT * FROM notifications WHERE user_id = 1;
```

## 🔄 Migration & Updates

### Adding New Column

```sql
ALTER TABLE users ADD COLUMN date_of_birth DATE;
```

### Adding New Table

```sql
CREATE TABLE wishlist (
    wishlist_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    product_id INTEGER REFERENCES products(product_id),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Backup Database

```bash
# Full backup
pg_dump -U postgres pharmahub_db > backup_$(date +%Y%m%d).sql

# Schema only
pg_dump -U postgres -s pharmahub_db > schema_backup.sql

# Data only
pg_dump -U postgres -a pharmahub_db > data_backup.sql
```

### Restore Database

```bash
psql -U postgres pharmahub_db < backup_20250121.sql
```

## 📈 Performance Optimization

### Monitoring Query Performance

```sql
-- Enable query logging
ALTER DATABASE pharmahub_db SET log_min_duration_statement = 1000;

-- Check slow queries
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Analyze Tables

```sql
ANALYZE products;
ANALYZE orders;
ANALYZE users;
```

### Vacuum

```sql
VACUUM ANALYZE;
```

## 🛠️ Maintenance Tasks

### Regular Maintenance (Recommended)

#### Daily:

```sql
-- Cleanup expired tokens
DELETE FROM password_reset_tokens WHERE expires_at < CURRENT_TIMESTAMP;
```

#### Weekly:

```sql
-- Cleanup old notifications
DELETE FROM notifications WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';

-- Vacuum and analyze
VACUUM ANALYZE;
```

#### Monthly:

```sql
-- Generate sales reports
INSERT INTO sales_reports (report_date, total_orders, ...)
SELECT ...;

-- Check database size
SELECT pg_size_pretty(pg_database_size('pharmahub_db'));
```

## 📞 Support & Contribution

### Issues

Jika menemukan bug atau ada pertanyaan, silakan buat issue di repository.

### Contributing

Pull requests are welcome! Untuk perubahan besar, silakan diskusikan terlebih dahulu.

## 📄 License

[MIT License](../LICENSE)

## 👥 Team PharmaHub

Developed with ❤️ by Kelompok PharmaHub

---

**Last Updated:** November 21, 2025
**Database Version:** 1.0.0
**PostgreSQL Version:** 12+

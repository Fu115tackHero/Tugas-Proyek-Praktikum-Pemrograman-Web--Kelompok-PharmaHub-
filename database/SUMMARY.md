# 📁 Database Files Summary - PharmaHub

## ✅ File yang Telah Dibuat

### 1. **schema.sql** (Schema Database Lengkap)

**Size:** ~1000+ lines
**Berisi:**

- 18 tabel lengkap dengan struktur detail
- Indexes untuk optimasi query
- Views untuk reporting (admin_dashboard_stats, top_selling_products, user_order_history)
- 5 Functions otomatis (generate order number, update stock, create notifications, dll)
- 8 Triggers untuk automasi
- Sample data awal (3 users, 8 categories, 3 coupons)
- Full documentation dengan comments

**Tabel Utama:**

- users, user_addresses, password_reset_tokens
- products, product_categories, product_images, product_reviews
- cart_items, saved_for_later
- orders, order_items, order_status_history
- coupons, coupon_usage
- notifications, notification_preferences
- admin_activity_logs, sales_reports

**Fitur BYTEA (Image Storage):**

- users.profile_photo
- products.main_image
- product_images.image_data
- product_categories.icon_image
- orders.prescription_image & payment_proof
- notifications.notification_image
- product_reviews.review_images (BYTEA[])

---

### 2. **sample_queries.sql** (Contoh Query)

**Size:** ~800+ lines
**Berisi 10 kategori query:**

1. **User Management** - Register, login, update profile, upload photo
2. **Product Queries** - Search, filter, detail, stock management
3. **Cart Queries** - Add/remove items, calculate total, saved for later
4. **Order Queries** - Create order, update status, order history
5. **Notification Queries** - Get notifications, mark as read, create manual
6. **Coupon Queries** - Validate, apply, check usage
7. **Review Queries** - Add review, get ratings, average rating
8. **Admin Dashboard** - Statistics, sales summary, activity logs
9. **Reporting Queries** - Monthly sales, product performance, customer lifetime value
10. **Maintenance Queries** - Cleanup, reindex, check database size

---

### 3. **seed_data.sql** (Data Awal Testing)

**Size:** ~600+ lines
**Berisi:**

- 8 demo users (admin, pharmacist, 6 customers)
- 5 user addresses
- 10 product categories
- 11 produk obat lengkap dengan detail
- 5 kupon promosi
- 3 sample orders (completed, preparing, pending)
- 5 notifikasi
- 5 product reviews
- 3 admin activity logs
- Cart items & saved for later
- Notification preferences

**Password semua user:** `password123` (harus di-hash dengan bcrypt)

---

### 4. **README.md** (Dokumentasi Lengkap)

**Size:** ~500+ lines
**Berisi:**

**Sections:**

- Database structure overview
- Tabel-tabel utama dengan penjelasan
- Penyimpanan gambar (BYTEA) guide
- Instalasi step-by-step (PostgreSQL + pgAdmin)
- Penggunaan & contoh query
- Automated functions & triggers
- Security & best practices
- Database size considerations
- Testing & sample data
- Migration & updates
- Performance optimization
- Maintenance tasks
- Support & contribution

---

### 5. **ERD.md** (Entity Relationship Diagram)

**Size:** ~400+ lines
**Berisi:**

**Visualisasi:**

- ASCII art diagram relationships
- Main entity relationships map
- BYTEA columns mapping
- Database views structure
- Automated functions & triggers
- Key relationships summary
- Index strategy
- Data types reference
- Database size estimation

**Helpful untuk:**

- Memahami struktur database
- Planning development
- Onboarding tim baru
- Database documentation

---

### 6. **migrations.sql** (Database Migration Scripts)

**Size:** ~500+ lines
**Berisi:**

**10 Future Migrations:**

1. Social login support (OAuth)
2. Product variants (dosage, size)
3. Shipping integration
4. Product stock history
5. Wishlist feature
6. Product bundles/packages
7. Prescription management
8. Customer loyalty program (points)
9. Chat/consultation feature
10. Migration tracking system

**Plus:**

- Rollback scripts untuk setiap migration
- Migration tracking table
- Utility functions untuk manage migrations

---

### 7. **BACKUP_RESTORE.md** (Backup & Recovery Guide)

**Size:** ~400+ lines
**Berisi:**

**Backup Strategies:**

- Full database backup
- Schema-only backup
- Data-only backup
- Specific tables backup
- Backup excluding images

**Restore Procedures:**

- Full restore
- Partial restore
- Point-in-time recovery

**Automation:**

- Linux/Mac cron scripts
- Windows Task Scheduler scripts
- Cloud backup (AWS S3, Google Cloud)

**Maintenance:**

- Vacuum & analyze
- Reindex
- Check database size
- Export/import BYTEA data

**Emergency Recovery:**

- Corrupt database recovery
- Disaster recovery procedures

---

### 8. **connection_examples.sql** (Kode Koneksi Database)

**Size:** ~600+ lines
**Berisi contoh koneksi untuk:**

1. **Node.js / Express.js** - pg library
   - Basic connection
   - Query examples
   - BYTEA handling (upload/download images)
2. **Python / Flask** - psycopg2
   - Connection pool
   - CRUD operations
   - Binary data handling
3. **PHP / Laravel** - PDO PostgreSQL
   - Configuration
   - Eloquent examples
   - Image upload/download
4. **Java / Spring Boot** - JDBC PostgreSQL
   - JPA entities
   - Repository pattern
   - RESTful API examples
5. **.NET / C#** - Npgsql

   - Entity Framework
   - DbContext
   - API controllers

6. **Environment variables** (.env example)

---

### 9. **.env.example** (Environment Configuration)

**Size:** ~200+ lines
**Berisi konfigurasi:**

- Database connection settings
- Application settings
- Security (JWT, bcrypt, session)
- File upload limits
- External services (Email, Cloud Storage)
- Payment gateway (Midtrans)
- Logging configuration
- Backup settings
- CORS settings
- Rate limiting
- Cache settings (Redis)
- Notification settings
- Monitoring & analytics
- Development vs Production settings

---

## 📊 Total Coverage

### Statistics:

- **Total Files:** 9
- **Total Lines:** ~5000+ lines
- **Total Tables:** 18
- **Total Views:** 3
- **Total Functions:** 5+
- **Total Triggers:** 8+
- **Sample Products:** 11
- **Sample Users:** 8
- **Documentation Pages:** 4

### Teknologi yang Dicakup:

✅ PostgreSQL 12+
✅ Node.js/Express
✅ Python/Flask
✅ PHP/Laravel
✅ Java/Spring Boot
✅ .NET/C#
✅ BYTEA Image Storage
✅ JWT Authentication
✅ Payment Gateway Integration
✅ Email Notifications
✅ Cloud Storage (S3, Cloudinary)

---

## 🚀 Cara Menggunakan

### Quick Start (3 Steps):

1. **Install PostgreSQL** dan buat database:

   ```sql
   CREATE DATABASE pharmahub_db;
   ```

2. **Jalankan schema:**

   ```bash
   psql -U postgres -d pharmahub_db -f schema.sql
   ```

3. **Load sample data** (optional):
   ```bash
   psql -U postgres -d pharmahub_db -f seed_data.sql
   ```

### Untuk Development:

1. Copy `.env.example` ke `.env`
2. Update konfigurasi database
3. Lihat `connection_examples.sql` untuk kode koneksi
4. Gunakan `sample_queries.sql` sebagai referensi
5. Baca `README.md` untuk dokumentasi lengkap

### Untuk Testing:

1. Gunakan `seed_data.sql` untuk data testing
2. Test query di `sample_queries.sql`
3. Coba CRUD operations
4. Test image upload/download (BYTEA)
5. Verify triggers & functions

### Untuk Production:

1. Baca `BACKUP_RESTORE.md` untuk backup strategy
2. Setup automated backups (cron/Task Scheduler)
3. Enable SSL connection
4. Use strong passwords
5. Consider external image storage
6. Monitor database size
7. Regular maintenance (vacuum, analyze)

---

## 🎯 Fitur Unggulan

### 1. **Complete E-commerce System**

- User management (customer, admin, pharmacist)
- Product catalog dengan detail lengkap
- Shopping cart & saved for later
- Order management dengan multiple status
- Coupon & discount system
- Review & rating system

### 2. **Image Storage (BYTEA)**

- User profile photos
- Product images (main + additional)
- Prescription images
- Payment proof
- Review images
- Complete upload/download examples

### 3. **Automation**

- Auto-generate order numbers
- Auto-update stock setelah order
- Auto-create notifications on status change
- Auto-alert low stock ke admin
- Auto-update timestamps

### 4. **Security**

- Password hashing (bcrypt)
- JWT authentication support
- SQL injection prevention (prepared statements)
- Role-based access control
- Session management

### 5. **Reporting & Analytics**

- Admin dashboard statistics
- Sales reports
- Product performance
- Customer analytics
- Top selling products
- Revenue tracking

### 6. **Developer Friendly**

- Comprehensive documentation
- Code examples untuk 5+ languages
- Sample queries untuk semua operasi
- Migration system untuk updates
- Backup & restore guides
- Environment configuration

---

## 📝 Notes

### Best Practices yang Diimplementasikan:

✅ Normalized database structure (3NF)
✅ Proper indexes untuk performance
✅ Foreign key constraints untuk data integrity
✅ Check constraints untuk validation
✅ Triggers untuk automation
✅ Views untuk complex queries
✅ Functions untuk reusable logic
✅ Transaction support (ACID)
✅ Comprehensive documentation
✅ Sample data untuk testing

### Pertimbangan BYTEA vs External Storage:

**BYTEA (Current Implementation):**

- ✅ Transactional consistency
- ✅ Easy backup with database
- ✅ No external dependencies
- ❌ Database size besar
- ❌ Slower untuk file besar

**External Storage (S3/Cloudinary):**

- ✅ Better performance
- ✅ Smaller database size
- ✅ CDN support
- ❌ Additional cost
- ❌ More complex implementation

**Recommendation:**

- Development/Small Scale: BYTEA OK
- Production/Large Scale: External storage + URL in database

---

## 🔄 Future Enhancements (in migrations.sql)

1. Social login (Google, Facebook)
2. Product variants
3. Shipping integration
4. Stock history tracking
5. Wishlist feature
6. Product bundles
7. Advanced prescription management
8. Loyalty points program
9. Live chat dengan pharmacist
10. Advanced analytics

---

## 📞 Support

Jika ada pertanyaan atau issues:

1. Check dokumentasi di `README.md`
2. Lihat contoh query di `sample_queries.sql`
3. Review connection examples untuk bahasa yang digunakan
4. Check ERD untuk struktur database

---

**Database Version:** 1.0.0
**Last Updated:** November 21, 2025
**PostgreSQL Version:** 12+
**License:** MIT

**Created with ❤️ by Kelompok PharmaHub**

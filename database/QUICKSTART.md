# 🚀 Quick Start Guide - PharmaHub Database

## ⚡ Setup dalam 5 Menit

### Prerequisites

- ✅ PostgreSQL 12+ terinstall
- ✅ pgAdmin 4 atau psql command line
- ✅ Git (untuk clone repository)

---

## 📥 Step 1: Install PostgreSQL

### Windows

1. Download dari https://www.postgresql.org/download/windows/
2. Jalankan installer
3. Set password untuk user `postgres`
4. Port default: `5432`
5. Finish installation

### Mac

```bash
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

---

## 💾 Step 2: Create Database

### Menggunakan psql (Command Line)

```bash
# Login sebagai postgres
psql -U postgres

# Buat database
CREATE DATABASE pharmahub_db;

# Keluar
\q
```

### Menggunakan pgAdmin

1. Buka pgAdmin 4
2. Connect ke PostgreSQL server
3. Right-click **Databases** → **Create** → **Database**
4. Database name: `pharmahub_db`
5. Owner: `postgres`
6. Click **Save**

---

## 🏗️ Step 3: Run Schema

### Menggunakan psql

```bash
# Navigasi ke folder database
cd /path/to/Tugas-Proyek-Praktikum-Pemrograman-Web--Kelompok-PharmaHub-/database

# Run schema
psql -U postgres -d pharmahub_db -f schema.sql
```

### Menggunakan pgAdmin

1. Select database `pharmahub_db`
2. Click **Tools** → **Query Tool**
3. Click **Open File** icon
4. Select `schema.sql`
5. Click **Execute/Run** (F5)

✅ **Output yang diharapkan:**

```
Schema PharmaHub berhasil dibuat!
```

---

## 📊 Step 4: Load Sample Data (Optional)

### Untuk Testing/Development

```bash
psql -U postgres -d pharmahub_db -f seed_data.sql
```

### Atau via pgAdmin

1. Query Tool → Open File
2. Select `seed_data.sql`
3. Execute (F5)

✅ **Output yang diharapkan:**

```
Seed data berhasil diinput!
Total Users: 8
Total Products: 11
Total Orders: 3
...
```

---

## ✔️ Step 5: Verify Installation

### Quick Verification Queries

```sql
-- Check tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check users
SELECT user_id, name, email, role FROM users;

-- Check products
SELECT product_id, name, price, stock FROM products LIMIT 5;

-- Check dashboard stats
SELECT * FROM admin_dashboard_stats;
```

### Expected Results

- ✅ 18 tables created
- ✅ 8 users (if seed data loaded)
- ✅ 11 products (if seed data loaded)
- ✅ Dashboard stats showing data

---

## 🔐 Demo Accounts (from seed_data.sql)

### Admin Account

- **Email:** `admin@pharmahub.com`
- **Password:** `password123` (hashed)
- **Role:** admin

### Pharmacist Account

- **Email:** `pharmacist@pharmahub.com`
- **Password:** `password123` (hashed)
- **Role:** pharmacist

### Customer Account

- **Email:** `john.doe@example.com`
- **Password:** `password123` (hashed)
- **Role:** customer

⚠️ **Note:** Password perlu di-hash dengan bcrypt di aplikasi Anda

---

## 🔌 Step 6: Connect to Database

### Node.js Example

1. **Install dependency:**

```bash
npm install pg dotenv
```

2. **Create `.env` file:**

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pharmahub_db
DB_USER=postgres
DB_PASSWORD=your_password
```

3. **Create connection:**

```javascript
// db.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Database connected:", res.rows[0].now);
  }
});

module.exports = pool;
```

4. **Test it:**

```javascript
// test.js
const pool = require("./db");

async function testQuery() {
  const result = await pool.query("SELECT COUNT(*) FROM users");
  console.log("Total users:", result.rows[0].count);
}

testQuery();
```

---

## 🧪 Test Database Functions

### Test Auto-Generate Order Number

```sql
SELECT generate_order_number();
-- Output: PHARMAHUB-20250121-00001
```

### Test Dashboard Stats

```sql
SELECT * FROM admin_dashboard_stats;
```

### Test Top Selling Products

```sql
SELECT * FROM top_selling_products LIMIT 5;
```

### Test User Order History

```sql
SELECT * FROM user_order_history WHERE user_id = 3;
```

---

## 📚 Next Steps

### 1. Explore Sample Queries

```bash
# Open sample_queries.sql untuk referensi
# Lihat 100+ contoh query siap pakai
```

### 2. Read Documentation

- `README.md` - Dokumentasi lengkap
- `ERD.md` - Database structure
- `connection_examples.sql` - Kode koneksi berbagai bahasa

### 3. Setup Backup

- Read `BACKUP_RESTORE.md`
- Setup automated backup
- Test restore procedure

### 4. Customize for Your Needs

- Modify schema jika perlu
- Add custom tables
- Create additional views
- Add more functions/triggers

---

## 🛠️ Common Issues & Solutions

### Issue 1: "psql: command not found"

**Solution:** Add PostgreSQL to PATH

```bash
# Windows: Add to PATH
C:\Program Files\PostgreSQL\14\bin

# Mac/Linux: Add to .bashrc or .zshrc
export PATH="/usr/local/pgsql/bin:$PATH"
```

### Issue 2: "password authentication failed"

**Solution:** Check password dan user

```bash
# Reset postgres password
sudo -u postgres psql
ALTER USER postgres PASSWORD 'newpassword';
```

### Issue 3: "database does not exist"

**Solution:** Create database first

```sql
CREATE DATABASE pharmahub_db;
```

### Issue 4: "permission denied for schema public"

**Solution:** Grant permissions

```sql
GRANT ALL PRIVILEGES ON DATABASE pharmahub_db TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
```

### Issue 5: Connection timeout

**Solution:** Check PostgreSQL is running

```bash
# Windows
# Check Services → PostgreSQL

# Mac
brew services list

# Linux
sudo systemctl status postgresql
```

---

## 📊 Verify Data Loaded Correctly

### Check All Tables

```sql
SELECT
    tablename,
    (SELECT COUNT(*) FROM pg_catalog.pg_class WHERE relname = tablename) as record_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Check Sample Data

```sql
-- Users
SELECT COUNT(*) as total_users,
       COUNT(*) FILTER (WHERE role = 'customer') as customers,
       COUNT(*) FILTER (WHERE role = 'admin') as admins
FROM users;

-- Products
SELECT COUNT(*) as total_products,
       COUNT(*) FILTER (WHERE prescription_required = true) as need_prescription
FROM products;

-- Orders
SELECT COUNT(*) as total_orders,
       COUNT(*) FILTER (WHERE order_status = 'completed') as completed_orders
FROM orders;
```

---

## 🎯 Success Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `pharmahub_db` created
- [ ] Schema executed successfully (18 tables)
- [ ] Sample data loaded (optional)
- [ ] Verification queries working
- [ ] Demo accounts accessible
- [ ] Database connection tested
- [ ] Functions/triggers working
- [ ] Views returning data
- [ ] Documentation reviewed

---

## 💡 Tips

1. **Use pgAdmin** untuk visual interface yang lebih mudah
2. **Run sample_queries.sql** untuk eksplorasi database
3. **Backup database** sebelum eksperimen
4. **Use transactions** untuk testing:
   ```sql
   BEGIN;
   -- Your test queries here
   ROLLBACK; -- Undo changes
   -- Or COMMIT; to save
   ```
5. **Monitor database size** saat develop
6. **Use indexes** untuk query optimization
7. **Regular VACUUM** untuk maintenance

---

## 🆘 Need Help?

### Resources:

- 📖 `README.md` - Full documentation
- 🔍 `sample_queries.sql` - 100+ query examples
- 🗺️ `ERD.md` - Database structure
- 💾 `BACKUP_RESTORE.md` - Backup guides
- 🔌 `connection_examples.sql` - Code examples

### Common Commands Reference:

```bash
# List databases
psql -U postgres -l

# Connect to database
psql -U postgres -d pharmahub_db

# List tables
\dt

# Describe table
\d users

# Run SQL file
\i /path/to/file.sql

# Quit
\q
```

---

## 🎉 You're Ready!

Database sudah siap digunakan! Mulai develop aplikasi Anda dengan:

- Full user management
- Product catalog
- Shopping cart
- Order processing
- Admin dashboard
- Reporting system

**Happy Coding! 🚀**

---

**Quick Start Version:** 1.0
**Last Updated:** November 21, 2025
**Estimated Setup Time:** 5-10 minutes

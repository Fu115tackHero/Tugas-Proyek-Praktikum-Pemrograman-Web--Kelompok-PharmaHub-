# 🚀 Menjalankan PostgreSQL Melalui Terminal VS Code

## 📋 Cara Menggunakan PostgreSQL via Terminal VS Code

### ✅ Prasyarat

- ✅ PostgreSQL sudah terinstall di Windows
- ✅ VS Code sudah terinstall
- ✅ Database `pharmahub_db` sudah dibuat

---

## 🔧 Solusi 1: Menggunakan Full Path (Recommended)

Jika `psql` command tidak dikenali, gunakan full path ke executable PostgreSQL.

### Step 1: Buka Terminal di VS Code

1. Tekan **Ctrl + `** (backtick/grave accent)
2. Atau: **View → Terminal**
3. Pilih **PowerShell** di dropdown terminal

### Step 2: Cari Lokasi PostgreSQL

Jalankan command ini di terminal:

```powershell
# Cari PostgreSQL installation path
Get-ChildItem -Path "C:\Program Files" -Filter "PostgreSQL" -Recurse -ErrorAction SilentlyContinue
```

**Atau gunakan common paths:**

- Windows 64-bit: `C:\Program Files\PostgreSQL\14\bin`
- Windows 32-bit: `C:\Program Files (x86)\PostgreSQL\14\bin`

### Step 3: Connect ke Database

**Opsi A: Dengan Full Path**

```powershell
& 'C:\Program Files\PostgreSQL\14\bin\psql' -U postgres -d pharmahub_db
```

**Opsi B: Alias (Lebih Mudah)**

Buat alias di PowerShell profile:

```powershell
# Edit PowerShell profile
notepad $PROFILE

# Tambahkan line ini:
Set-Alias -Name psql -Value 'C:\Program Files\PostgreSQL\14\bin\psql'

# Save dan restart terminal
```

Setelah itu, cukup ketik:

```powershell
psql -U postgres -d pharmahub_db
```

---

## 🔧 Solusi 2: Add to System PATH (Permanent)

Supaya `psql` bisa diakses dari mana saja:

### Windows Step-by-Step:

1. **Buka Environment Variables:**

   - Tekan `Win + X` → **System**
   - Klik **Advanced system settings**
   - Klik **Environment Variables...**

2. **Edit PATH:**

   - Di bawah "System variables", cari **Path**
   - Klik **Edit...**
   - Klik **New**
   - Tambahkan: `C:\Program Files\PostgreSQL\14\bin`
   - Klik **OK** semua

3. **Restart VS Code**
   - Close terminal di VS Code
   - Close VS Code sepenuhnya
   - Buka VS Code lagi
   - Coba: `psql --version`

**Sekarang semua command psql akan bisa langsung diketik!**

---

## 📖 Command Dasar PostgreSQL di Terminal

Setelah bisa akses `psql`, gunakan command ini:

### 1. Connect ke Database

```powershell
# Connect ke database
psql -U postgres -d pharmahub_db

# Connect ke postgres default
psql -U postgres

# Connect dengan password (akan diminta saat connect)
psql -U postgres -d pharmahub_db -W
```

### 2. Basic Commands (di dalam psql)

```sql
-- List databases
\l

-- List tables
\dt

-- Describe table
\d users

-- List users
\du

-- Connect ke database lain
\c database_name

-- Run SQL file
\i 'C:/path/to/schema.sql'

-- Show current database
SELECT current_database();

-- Show current user
SELECT current_user;

-- Quit psql
\q
```

### 3. Run SQL File dari Terminal

```powershell
# Jalankan schema.sql
psql -U postgres -d pharmahub_db -f "schema.sql"

# Atau dengan full path
psql -U postgres -d pharmahub_db -f "C:\path\to\database\schema.sql"

# Jalankan seed data
psql -U postgres -d pharmahub_db -f "seed_data.sql"

# Output ke file
psql -U postgres -d pharmahub_db -f "schema.sql" > output.txt
```

### 4. Execute Single Query

```powershell
# Query langsung dari PowerShell
psql -U postgres -d pharmahub_db -c "SELECT COUNT(*) FROM users;"

# Multiple queries
psql -U postgres -d pharmahub_db -c "SELECT * FROM products LIMIT 5;"
```

---

## 🎯 Step-by-Step: Setup Database via Terminal

### 1. Create Database

```powershell
# Connect ke postgres
psql -U postgres

# Di dalam psql, jalankan:
CREATE DATABASE pharmahub_db;

# Verify
\l

# Quit
\q
```

### 2. Run Schema File

```powershell
# Navigate ke database folder
cd "D:\SEM 3-ILMU KOMPUTER\Praktikum Pemrograman Web\Proyek Praktikum PemWeb\Tugas-Proyek-Praktikum-Pemrograman-Web--Kelompok-PharmaHub-\database"

# Run schema
psql -U postgres -d pharmahub_db -f schema.sql
```

**Harapkan output:**

```
CREATE TABLE
CREATE INDEX
...
Schema PharmaHub berhasil dibuat!
```

### 3. Load Sample Data

```powershell
psql -U postgres -d pharmahub_db -f seed_data.sql
```

**Harapkan output:**

```
INSERT 0 8
INSERT 0 11
...
Seed data berhasil diinput!
```

### 4. Verify Installation

```powershell
# Check users
psql -U postgres -d pharmahub_db -c "SELECT COUNT(*) as total_users FROM users;"

# Check products
psql -U postgres -d pharmahub_db -c "SELECT COUNT(*) as total_products FROM products;"

# Check orders
psql -U postgres -d pharmahub_db -c "SELECT COUNT(*) as total_orders FROM orders;"
```

---

## 💡 Praktis: Script Helper

Buat file PowerShell script untuk mempermudah:

### File: `connect_db.ps1`

```powershell
# Script untuk connect ke PharmaHub database
param(
    [Parameter(Mandatory=$false)]
    [string]$Command
)

$psqlPath = "C:\Program Files\PostgreSQL\14\bin\psql"
$dbUser = "postgres"
$dbName = "pharmahub_db"

if ($Command) {
    # Execute specific command
    & $psqlPath -U $dbUser -d $dbName -c $Command
} else {
    # Interactive mode
    & $psqlPath -U $dbUser -d $dbName
}
```

### Gunakan:

```powershell
# Interactive connect
.\connect_db.ps1

# Run single query
.\connect_db.ps1 -Command "SELECT * FROM users LIMIT 5;"

# Check database status
.\connect_db.ps1 -Command "SELECT current_database();"
```

---

## 📁 File: `run_schema.ps1`

```powershell
# Script untuk run schema dan seed data
param(
    [Parameter(Mandatory=$false)]
    [string]$SqlFile = "schema.sql"
)

$psqlPath = "C:\Program Files\PostgreSQL\14\bin\psql"
$dbUser = "postgres"
$dbName = "pharmahub_db"

Write-Host "Running $SqlFile..." -ForegroundColor Green

& $psqlPath -U $dbUser -d $dbName -f $SqlFile

Write-Host "Done!" -ForegroundColor Green
```

### Gunakan:

```powershell
# Run schema
.\run_schema.ps1 -SqlFile "schema.sql"

# Run seed data
.\run_schema.ps1 -SqlFile "seed_data.sql"
```

---

## 🔍 Troubleshooting

### Error 1: "psql: command not found"

**Solusi:**

```powershell
# Cek apakah PostgreSQL terinstall
Get-ChildItem "C:\Program Files\PostgreSQL"

# Jika ada, tambahkan ke PATH (lihat Solusi 2 di atas)
# Atau gunakan full path

# Cek versi
& 'C:\Program Files\PostgreSQL\14\bin\psql' --version
```

### Error 2: "FATAL: role "postgres" does not exist"

**Solusi:**

```powershell
# Gunakan built-in superuser atau buat role baru
# Login tanpa user specific terlebih dahulu
psql -U postgres -d template1
```

### Error 3: "FATAL: database "pharmahub_db" does not exist"

**Solusi:**

```powershell
# Create database terlebih dahulu
psql -U postgres -c "CREATE DATABASE pharmahub_db;"

# Verify
psql -U postgres -l
```

### Error 4: "password authentication failed"

**Solusi:**

```powershell
# Gunakan -W flag untuk diminta password
psql -U postgres -W

# Atau reset password
psql -U postgres -c "ALTER USER postgres PASSWORD 'newpassword';"
```

### Error 5: "Permission denied" saat run SQL file

**Solusi:**

```powershell
# Gunakan full path dengan quotes
psql -U postgres -d pharmahub_db -f "C:\path\to\schema.sql"

# Atau copy file ke user directory
Copy-Item "schema.sql" "$HOME\schema.sql"
psql -U postgres -d pharmahub_db -f "$HOME\schema.sql"
```

---

## 🎨 VS Code Extensions untuk PostgreSQL

Untuk experience yang lebih baik, install extensions:

### 1. **PostgreSQL Extension**

- Buka Extensions (Ctrl + Shift + X)
- Cari "PostgreSQL"
- Install "PostgreSQL" by Chris Kolkman

### 2. **SQL Server (mssql)**

- Cari "mssql"
- Atau install "SQLTools"

### Setup Connection di VS Code:

1. Tekan `Ctrl + Shift + P`
2. Cari "SQLTools: Add New Connection"
3. Pilih PostgreSQL
4. Masukkan:
   - **Server:** localhost
   - **Port:** 5432
   - **Database:** pharmahub_db
   - **Username:** postgres
   - **Password:** your_password
5. Test & Save

Sekarang bisa query langsung dari VS Code UI!

---

## 📝 Tips & Tricks

### 1. Save Query ke File

```powershell
# Query hasil disave ke file
psql -U postgres -d pharmahub_db -c "SELECT * FROM users;" > users_output.txt
```

### 2. Run Multiple Files

```powershell
# Jalankan beberapa SQL file sekaligus
psql -U postgres -d pharmahub_db -f schema.sql -f seed_data.sql
```

### 3. Use Configuration File

```powershell
# Buat file: ~/.pgpass
# Isinya: localhost:5432:pharmahub_db:postgres:password

# Sekarang connect tanpa password:
psql -U postgres -d pharmahub_db
```

### 4. Batch Processing

```powershell
# Buat file: query_batch.sql
# Isinya:
# SELECT * FROM users;
# SELECT * FROM products;
# SELECT COUNT(*) FROM orders;

# Run batch:
psql -U postgres -d pharmahub_db < query_batch.sql
```

### 5. Export Data

```powershell
# Export ke CSV
psql -U postgres -d pharmahub_db -c "COPY users TO STDOUT CSV HEADER" > users.csv

# Export ke JSON (PostgreSQL 13+)
psql -U postgres -d pharmahub_db -c "SELECT json_agg(row_to_json(t)) FROM (SELECT * FROM users) t" > users.json
```

---

## ✅ Checklist: Siap Menggunakan

- [ ] PostgreSQL terinstall
- [ ] `psql` bisa diakses dari PowerShell (atau setup alias/PATH)
- [ ] Database `pharmahub_db` sudah dibuat
- [ ] Schema sudah di-run
- [ ] Sample data sudah diload
- [ ] Test query berhasil dijalankan
- [ ] VS Code extension terinstall (optional)

---

## 🎯 Quick Commands Reference

```powershell
# Connect ke database
psql -U postgres -d pharmahub_db

# Run schema
psql -U postgres -d pharmahub_db -f schema.sql

# Run seed data
psql -U postgres -d pharmahub_db -f seed_data.sql

# Quick query
psql -U postgres -d pharmahub_db -c "SELECT COUNT(*) FROM users;"

# List all databases
psql -U postgres -l

# Backup database
pg_dump -U postgres -d pharmahub_db > backup.sql

# Restore database
psql -U postgres -d pharmahub_db < backup.sql
```

---

**Tips:** Simpan reference ini untuk quick lookup setiap kali perlu jalankan PostgreSQL commands!

**Happy Database Management! 🐘**

---

**Panduan Version:** 1.0
**PostgreSQL Version:** 12+
**Windows Version:** Windows 7+

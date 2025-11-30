# Cara Mengganti Database menggunakan AY OTO MA ON.sql

## Prasyarat
- PostgreSQL sudah terinstall di komputer
- File `.env` di folder `api/` sudah dikonfigurasi dengan:
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_HOST`
  - `DB_PORT`
  - `DB_NAME`

## Langkah-langkah

### 1. Buka PowerShell/Command Prompt
Navigasi ke folder `database`:
```powershell
cd "c:\Users\ASUS\Documents\USU momentos\Mata Kuliah 3\Projek PrakPemWeb\react-migrate\Tugas-Proyek-Praktikum-Pemrograman-Web--Kelompok-PharmaHub-\database"
```

### 2. Backup Database Lama (Opsional tapi Direkomendasikan)
Jika ada database lama yang ingin Anda simpan:
```powershell
pg_dump -U postgres -h localhost -p 5432 pharmahub > backup_lama_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql
```

### 3. Drop Database Lama (Jika Diperlukan)
Jika ingin menghapus database lama sepenuhnya:
```powershell
psql -U postgres -h localhost -p 5432 -c "DROP DATABASE IF EXISTS pharmahub;"
```

### 4. Restore dari File AY OTO MA ON.sql
Jalankan perintah berikut untuk mengembalikan database dari file:
```powershell
psql -U postgres -h localhost -p 5432 < "AY OTO MA ON.sql"
```

**Atau jika menggunakan database yang berbeda:**
```powershell
psql -U postgres -h localhost -p 5432 -d nama_database < "AY OTO MA ON.sql"
```

### 5. Verifikasi Database Berhasil Di-restore
Cek apakah tabel sudah ada:
```powershell
psql -U postgres -h localhost -p 5432 -d pharmahub -c "\dt"
```

Atau jalankan query untuk cek jumlah produk:
```powershell
psql -U postgres -h localhost -p 5432 -d pharmahub -c "SELECT COUNT(*) FROM products;"
```

## Troubleshooting

### Jika Error: "Command not found"
PostgreSQL belum ditambahkan ke PATH. Coba dengan path lengkap:
```powershell
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -p 5432 < "AY OTO MA ON.sql"
```

### Jika Error: "Database pharmahub does not exist"
Buat database terlebih dahulu:
```powershell
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE pharmahub;"
psql -U postgres -h localhost -p 5432 -d pharmahub < "AY OTO MA ON.sql"
```

### Jika Error: "Permission denied"
Pastikan file `AY OTO MA ON.sql` memiliki permission baca. Atau jalankan PowerShell sebagai Administrator.

## Setelah Restore

1. Pastikan backend API terhubung ke database yang benar
2. Restart backend server:
   ```powershell
   cd api
   npm run dev
   ```
3. Test dengan membuka halaman admin dan lihat apakah data produk sudah muncul

## Catatan Penting
- File ini adalah **full database backup** dengan semua tabel, functions, dan triggers
- Ukuran file: ~2881 baris SQL
- Backup ini di-dump pada: **2025-11-30 17:17:03**
- Pastikan konfigurasi database di `.env` sesuai dengan file ini sebelum restore

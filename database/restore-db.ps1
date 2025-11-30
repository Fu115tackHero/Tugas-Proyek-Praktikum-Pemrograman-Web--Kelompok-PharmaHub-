# Script untuk restore database pharmahub_db dari AY OTO MA ON.sql

$dbPath = "c:\Users\ASUS\Documents\USU momentos\Mata Kuliah 3\Projek PrakPemWeb\react-migrate\Tugas-Proyek-Praktikum-Pemrograman-Web--Kelompok-PharmaHub-\database"
$sqlFile = Join-Path $dbPath "AY OTO MA ON.sql"
$dbName = "pharmahub_db"
$dbUser = "postgres"
$dbHost = "localhost"
$dbPort = "5432"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Restore Database Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Cek apakah file SQL ada
if (-not (Test-Path $sqlFile)) {
    Write-Host "ERROR: File tidak ditemukan: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "File SQL ditemukan: $sqlFile" -ForegroundColor Green
Write-Host "Database target: $dbName" -ForegroundColor Green
Write-Host ""

# Cek apakah psql tersedia
try {
    $psqlVersion = psql --version 2>&1
    Write-Host "PostgreSQL ditemukan: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: psql command tidak ditemukan. Pastikan PostgreSQL sudah terinstall dan ditambahkan ke PATH" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Proses restore akan dimulai..." -ForegroundColor Yellow
Write-Host ""

# Drop database lama jika ada (opsional - uncomment untuk aktifkan)
# Write-Host "Step 1: Menghapus database lama jika ada..."
# psql -U $dbUser -h $dbHost -p $dbPort -c "DROP DATABASE IF EXISTS $dbName;" 2>&1
# Write-Host "Database lama dihapus (atau tidak ada)" -ForegroundColor Green
# Write-Host ""

# Create database baru jika belum ada
Write-Host "Step 1: Membuat/memastikan database $dbName ada..."
$createDbCmd = "CREATE DATABASE IF NOT EXISTS $dbName;" -replace "IF NOT EXISTS", "" 
psql -U $dbUser -h $dbHost -p $dbPort -c "CREATE DATABASE $dbName;" 2>&1 | Out-Null
Write-Host "Database $dbName siap" -ForegroundColor Green
Write-Host ""

# Restore dari file SQL
Write-Host "Step 2: Restore schema dan data dari SQL file..." -ForegroundColor Yellow
$sqlContent = Get-Content $sqlFile -Raw
$sqlContent | psql -U $dbUser -h $dbHost -p $dbPort -d $dbName 2>&1 | Tee-Object -FilePath restore.log

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Restore selesai! Verifikasi database..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Verifikasi
Write-Host "Step 3: Verifikasi database..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Jumlah produk:" -ForegroundColor Cyan
psql -U $dbUser -h $dbHost -p $dbPort -d $dbName -c "SELECT COUNT(*) as total_produk FROM products;" 2>&1

Write-Host ""
Write-Host "Jumlah user:" -ForegroundColor Cyan
psql -U $dbUser -h $dbHost -p $dbPort -d $dbName -c "SELECT COUNT(*) as total_user FROM users;" 2>&1

Write-Host ""
Write-Host "✅ Database $dbName restore selesai!" -ForegroundColor Green
Write-Host "📝 Pastikan .env memiliki: DB_NAME=pharmahub_db" -ForegroundColor Yellow

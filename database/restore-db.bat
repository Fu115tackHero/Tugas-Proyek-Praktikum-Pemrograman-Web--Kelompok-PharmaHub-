@echo off
REM Script untuk restore database pharmahub_db dari AY OTO MA ON.sql

setlocal enabledelayedexpansion

set "dbPath=c:\Users\ASUS\Documents\USU momentos\Mata Kuliah 3\Projek PrakPemWeb\react-migrate\Tugas-Proyek-Praktikum-Pemrograman-Web--Kelompok-PharmaHub-\database"
set "sqlFile=%dbPath%\AY OTO MA ON.sql"
set "dbName=pharmahub_db"
set "dbUser=postgres"
set "dbHost=localhost"
set "dbPort=5432"

echo ================================
echo Restore Database Script
echo ================================
echo.

REM Cek apakah file SQL ada
if not exist "%sqlFile%" (
    echo ERROR: File tidak ditemukan: %sqlFile%
    exit /b 1
)

echo File SQL ditemukan: %sqlFile%
echo Database target: %dbName%
echo.

REM Drop database lama jika ada
echo Step 1: Menghapus database lama jika ada...
psql -U %dbUser% -h %dbHost% -p %dbPort% -c "DROP DATABASE IF EXISTS %dbName%;" 2>&1 > nul

echo Step 2: Membuat database baru %dbName%...
psql -U %dbUser% -h %dbHost% -p %dbPort% -c "CREATE DATABASE %dbName%;" 2>&1

echo Step 3: Restore schema dan data dari SQL file...
psql -U %dbUser% -h %dbHost% -p %dbPort% -d %dbName% -f "%sqlFile%" 2>&1

if errorlevel 1 (
    echo.
    echo ================================
    echo RESTORE GAGAL
    echo ================================
    exit /b 1
)

echo.
echo ================================
echo RESTORE BERHASIL!
echo ================================
echo.

echo Step 4: Verifikasi database...
echo.

echo Jumlah produk:
psql -U %dbUser% -h %dbHost% -p %dbPort% -d %dbName% -c "SELECT COUNT(*) as total_produk FROM products;" 2>&1

echo.
echo Jumlah user:
psql -U %dbUser% -h %dbHost% -p %dbPort% -d %dbName% -c "SELECT COUNT(*) as total_user FROM users;" 2>&1

echo.
echo ✓ Database %dbName% siap digunakan!
echo.
echo Pastikan .env memiliki:
echo   DB_NAME=%dbName%
echo   DB_USER=%dbUser%
echo   DB_HOST=%dbHost%
echo   DB_PORT=%dbPort%
echo.
pause

@echo off
REM ============================================
REM PharmaHub Database Quick Setup Batch Script
REM For Windows Command Prompt
REM ============================================

setlocal enabledelayedexpansion

REM Configuration
set POSTGRES_PATH=C:\Program Files\PostgreSQL\14\bin
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=pharmahub_db
set DB_USER=postgres

REM Check if running from database folder
if not exist "schema.sql" (
    echo.
    echo [ERROR] schema.sql not found in current directory
    echo Please run this script from the database folder
    echo.
    pause
    exit /b 1
)

REM Check if PostgreSQL is installed
if not exist "%POSTGRES_PATH%\psql.exe" (
    echo.
    echo [ERROR] PostgreSQL not found at %POSTGRES_PATH%
    echo Please install PostgreSQL or update the path in this script
    echo.
    pause
    exit /b 1
)

:menu
cls
echo.
echo ╔════════════════════════════════════╗
echo ║   PharmaHub Database Setup         ║
echo ║   PostgreSQL Management Tool       ║
echo ╚════════════════════════════════════╝
echo.
echo Select an option:
echo.
echo 1. Test Connection to PostgreSQL
echo 2. Create Database and Run Schema
echo 3. Load Seed Data (Sample Data)
echo 4. Backup Database
echo 5. Restore Database
echo 6. Execute Custom Query
echo 7. View Database Info
echo 8. Exit
echo.

set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" goto testconn
if "%choice%"=="2" goto schema
if "%choice%"=="3" goto seed
if "%choice%"=="4" goto backup
if "%choice%"=="5" goto restore
if "%choice%"=="6" goto query
if "%choice%"=="7" goto info
if "%choice%"=="8" goto end
goto menu

:testconn
echo.
echo Testing PostgreSQL connection...
echo.
"%POSTGRES_PATH%\psql.exe" -h %DB_HOST% -U %DB_USER% -d postgres -c "SELECT version();"
echo.
if errorlevel 1 (
    echo [ERROR] Connection failed!
) else (
    echo [SUCCESS] Connection successful!
)
pause
goto menu

:schema
echo.
echo ========================================
echo WARNING: This will create/recreate tables
echo Existing data will be preserved
echo ========================================
echo.
set /p confirm="Continue? (yes/no): "
if /i not "%confirm%"=="yes" goto menu

echo.
echo Running schema.sql...
echo.
"%POSTGRES_PATH%\psql.exe" -h %DB_HOST% -U %DB_USER% -d %DB_NAME% -f schema.sql

if errorlevel 1 (
    echo.
    echo [ERROR] Schema execution failed!
    echo Make sure database '%DB_NAME%' exists
) else (
    echo.
    echo [SUCCESS] Schema executed successfully!
)
pause
goto menu

:seed
echo.
echo Loading seed data...
echo.
"%POSTGRES_PATH%\psql.exe" -h %DB_HOST% -U %DB_USER% -d %DB_NAME% -f seed_data.sql

if errorlevel 1 (
    echo.
    echo [ERROR] Seed data loading failed!
) else (
    echo.
    echo [SUCCESS] Seed data loaded successfully!
)
pause
goto menu

:backup
echo.
set /p backupname="Enter backup filename (default: backup_TIMESTAMP.sql): "
if "%backupname%"=="" (
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
    for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
    set backupname=backup_!mydate!_!mytime!.sql
)

echo.
echo Backing up database to: %backupname%
echo.
"%POSTGRES_PATH%\pg_dump.exe" -h %DB_HOST% -U %DB_USER% -d %DB_NAME% > %backupname%

if errorlevel 1 (
    echo [ERROR] Backup failed!
) else (
    for %%A in (%backupname%) do set size=%%~zA
    echo [SUCCESS] Backup created successfully!
    echo File: %backupname% ^(Size: %size% bytes^)
)
pause
goto menu

:restore
echo.
echo Available backup files:
echo.
dir /b *.sql
echo.
set /p restorename="Enter backup filename to restore: "

if not exist "%restorename%" (
    echo [ERROR] File not found: %restorename%
    pause
    goto menu
)

echo.
echo WARNING: This will overwrite current database
set /p confirm="Continue? (yes/no): "
if /i not "%confirm%"=="yes" goto menu

echo.
echo Restoring from: %restorename%
echo.
"%POSTGRES_PATH%\psql.exe" -h %DB_HOST% -U %DB_USER% -d %DB_NAME% < %restorename%

if errorlevel 1 (
    echo [ERROR] Restore failed!
) else (
    echo [SUCCESS] Database restored successfully!
)
pause
goto menu

:query
echo.
set /p sqlquery="Enter SQL query: "
echo.
"%POSTGRES_PATH%\psql.exe" -h %DB_HOST% -U %DB_USER% -d %DB_NAME% -c "%sqlquery%"
echo.
pause
goto menu

:info
echo.
echo ========== Database Information ==========
echo.
"%POSTGRES_PATH%\psql.exe" -h %DB_HOST% -U %DB_USER% -d %DB_NAME% -c "SELECT 'Total Users' as info, COUNT(*) as count FROM users;" -c "SELECT 'Total Products', COUNT(*) FROM products;" -c "SELECT 'Total Orders', COUNT(*) FROM orders;"
echo.
echo ======== Connection Settings ========
echo Host: %DB_HOST%
echo Port: %DB_PORT%
echo Database: %DB_NAME%
echo User: %DB_USER%
echo PostgreSQL Path: %POSTGRES_PATH%
echo.
pause
goto menu

:end
echo.
echo Thank you for using PharmaHub Database Manager!
echo.
exit /b 0

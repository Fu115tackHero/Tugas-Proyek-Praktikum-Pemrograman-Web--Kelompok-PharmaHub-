#!/usr/bin/env pwsh
# ============================================
# PharmaHub Database Management Script
# PowerShell Script untuk mengelola database
# ============================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("connect", "schema", "seed", "backup", "restore", "query", "verify", "help")]
    [string]$Action = "help",
    
    [Parameter(Mandatory=$false)]
    [string]$SqlFile,
    
    [Parameter(Mandatory=$false)]
    [string]$Query,
    
    [Parameter(Mandatory=$false)]
    [string]$BackupFile
)

# ============================================
# CONFIGURATION
# ============================================

# Update these paths according to your system
$PostgreSqlPath = "C:\Program Files\PostgreSQL\14\bin"
$psqlExe = Join-Path $PostgreSqlPath "psql.exe"
$pgDumpExe = Join-Path $PostgreSqlPath "pg_dump.exe"

$DbHost = "localhost"
$DbPort = "5432"
$DbName = "pharmahub_db"
$DbUser = "postgres"

# Colors for output
$ColorSuccess = "Green"
$ColorError = "Red"
$ColorInfo = "Cyan"
$ColorWarning = "Yellow"

# ============================================
# FUNCTIONS
# ============================================

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $ColorSuccess
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $ColorError
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor $ColorInfo
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $ColorWarning
}

function Check-PostgreSQL {
    Write-Info "Checking PostgreSQL installation..."
    
    if (-not (Test-Path $psqlExe)) {
        Write-Error-Custom "PostgreSQL not found at: $psqlExe"
        Write-Info "Please install PostgreSQL or update the path in this script"
        exit 1
    }
    
    Write-Success "PostgreSQL found at: $psqlExe"
}

function Connect-Database {
    Write-Info "Connecting to database: $DbName"
    Write-Info "User: $DbUser"
    Write-Info "Host: $DbHost"
    
    & $psqlExe -h $DbHost -U $DbUser -d $DbName
}

function Run-SchemaFile {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) {
        Write-Error-Custom "File not found: $FilePath"
        exit 1
    }
    
    Write-Info "Running schema file: $FilePath"
    Write-Warning-Custom "This will create/recreate all tables and data"
    
    $response = Read-Host "Continue? (yes/no)"
    if ($response -ne "yes") {
        Write-Info "Cancelled"
        return
    }
    
    & $psqlExe -h $DbHost -U $DbUser -d $DbName -f $FilePath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Schema executed successfully"
    } else {
        Write-Error-Custom "Schema execution failed"
    }
}

function Run-SeedData {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) {
        Write-Error-Custom "File not found: $FilePath"
        exit 1
    }
    
    Write-Info "Loading seed data from: $FilePath"
    
    & $psqlExe -h $DbHost -U $DbUser -d $DbName -f $FilePath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Seed data loaded successfully"
    } else {
        Write-Error-Custom "Seed data loading failed"
    }
}

function Backup-Database {
    param([string]$OutputFile)
    
    if (-not $OutputFile) {
        $OutputFile = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
    }
    
    Write-Info "Backing up database to: $OutputFile"
    
    & $pgDumpExe -h $DbHost -U $DbUser -d $DbName > $OutputFile
    
    if ($LASTEXITCODE -eq 0) {
        $FileSize = (Get-Item $OutputFile).Length / 1MB
        Write-Success "Database backed up successfully (Size: $([math]::Round($FileSize, 2)) MB)"
        Write-Info "File: $(Get-Item $OutputFile | Select-Object -ExpandProperty FullName)"
    } else {
        Write-Error-Custom "Backup failed"
    }
}

function Restore-Database {
    param([string]$InputFile)
    
    if (-not (Test-Path $InputFile)) {
        Write-Error-Custom "Backup file not found: $InputFile"
        exit 1
    }
    
    Write-Warning-Custom "This will restore the database from backup"
    Write-Warning-Custom "Current data will be overwritten"
    
    $response = Read-Host "Continue? (yes/no)"
    if ($response -ne "yes") {
        Write-Info "Cancelled"
        return
    }
    
    Write-Info "Restoring database from: $InputFile"
    
    & $psqlExe -h $DbHost -U $DbUser -d $DbName < $InputFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Database restored successfully"
    } else {
        Write-Error-Custom "Restore failed"
    }
}

function Execute-Query {
    param([string]$SqlQuery)
    
    if (-not $SqlQuery) {
        Write-Error-Custom "Query is required"
        exit 1
    }
    
    Write-Info "Executing query..."
    
    & $psqlExe -h $DbHost -U $DbUser -d $DbName -c $SqlQuery
}

function Verify-Database {
    Write-Info "Verifying database..."
    
    $queries = @(
        "SELECT COUNT(*) as total_users FROM users;",
        "SELECT COUNT(*) as total_products FROM products;",
        "SELECT COUNT(*) as total_orders FROM orders;",
        "SELECT COUNT(*) as total_notifications FROM notifications;",
        "SELECT current_database() as current_db;",
        "SELECT version();"
    )
    
    foreach ($q in $queries) {
        & $psqlExe -h $DbHost -U $DbUser -d $DbName -c $q
    }
}

function Show-Help {
    Write-Info "PharmaHub Database Management Script"
    Write-Host ""
    Write-Host "Usage: .\manage_db.ps1 -Action <action> [options]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Yellow
    Write-Host "  connect     - Connect to database (interactive)" -ForegroundColor White
    Write-Host "  schema      - Run schema file" -ForegroundColor White
    Write-Host "  seed        - Load seed data" -ForegroundColor White
    Write-Host "  backup      - Backup database" -ForegroundColor White
    Write-Host "  restore     - Restore database from backup" -ForegroundColor White
    Write-Host "  query       - Execute a SQL query" -ForegroundColor White
    Write-Host "  verify      - Verify database" -ForegroundColor White
    Write-Host "  help        - Show this help" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\manage_db.ps1 -Action connect" -ForegroundColor Cyan
    Write-Host "  .\manage_db.ps1 -Action schema -SqlFile schema.sql" -ForegroundColor Cyan
    Write-Host "  .\manage_db.ps1 -Action seed -SqlFile seed_data.sql" -ForegroundColor Cyan
    Write-Host "  .\manage_db.ps1 -Action backup -BackupFile backup.sql" -ForegroundColor Cyan
    Write-Host "  .\manage_db.ps1 -Action restore -BackupFile backup.sql" -ForegroundColor Cyan
    Write-Host "  .\manage_db.ps1 -Action query -Query `"SELECT * FROM users;`"" -ForegroundColor Cyan
    Write-Host "  .\manage_db.ps1 -Action verify" -ForegroundColor Cyan
    Write-Host ""
}

# ============================================
# MAIN
# ============================================

Write-Host "╔════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PharmaHub Database Manager       ║" -ForegroundColor Cyan
Write-Host "║  PostgreSQL Management Script      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Check-PostgreSQL

switch ($Action) {
    "connect" {
        Connect-Database
    }
    
    "schema" {
        if (-not $SqlFile) {
            $SqlFile = "schema.sql"
        }
        Run-SchemaFile $SqlFile
    }
    
    "seed" {
        if (-not $SqlFile) {
            $SqlFile = "seed_data.sql"
        }
        Run-SeedData $SqlFile
    }
    
    "backup" {
        Backup-Database $BackupFile
    }
    
    "restore" {
        if (-not $BackupFile) {
            Write-Error-Custom "BackupFile parameter is required for restore"
            exit 1
        }
        Restore-Database $BackupFile
    }
    
    "query" {
        if (-not $Query) {
            Write-Error-Custom "Query parameter is required"
            exit 1
        }
        Execute-Query $Query
    }
    
    "verify" {
        Verify-Database
    }
    
    "help" {
        Show-Help
    }
    
    default {
        Write-Error-Custom "Unknown action: $Action"
        Show-Help
        exit 1
    }
}

Write-Host ""
Write-Info "Done!"

# Database Backup & Restore Guide

## 📦 Backup Strategies

### 1. Full Database Backup

#### Using pg_dump (Command Line)

```bash
# Backup semua data dan schema
pg_dump -U postgres -d pharmahub_db -F c -f backup_full_$(date +%Y%m%d_%H%M%S).dump

# Backup dalam format SQL
pg_dump -U postgres -d pharmahub_db > backup_$(date +%Y%m%d).sql

# Backup dengan kompresi
pg_dump -U postgres -d pharmahub_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

#### Using pgAdmin

1. Right-click database `pharmahub_db`
2. Select **Backup...**
3. Choose filename and location
4. Format: **Custom** or **Tar**
5. Click **Backup**

### 2. Schema-Only Backup

```bash
# Backup hanya struktur database (tanpa data)
pg_dump -U postgres -s -d pharmahub_db > schema_backup_$(date +%Y%m%d).sql
```

### 3. Data-Only Backup

```bash
# Backup hanya data (tanpa schema)
pg_dump -U postgres -a -d pharmahub_db > data_backup_$(date +%Y%m%d).sql
```

### 4. Specific Tables Backup

```bash
# Backup tabel tertentu
pg_dump -U postgres -d pharmahub_db -t users -t products > users_products_backup.sql

# Backup dengan wildcard
pg_dump -U postgres -d pharmahub_db -t 'product*' > product_tables_backup.sql
```

### 5. Backup Excluding BYTEA (Image) Columns

```bash
# Backup tanpa kolom gambar (lebih kecil)
pg_dump -U postgres -d pharmahub_db \
  --exclude-table-data=product_images \
  --column-inserts > backup_no_images.sql
```

## 🔄 Restore Procedures

### 1. Restore Full Database

#### From .dump file (Custom format)

```bash
# Drop database jika ada (HATI-HATI!)
dropdb -U postgres pharmahub_db

# Create database baru
createdb -U postgres pharmahub_db

# Restore
pg_restore -U postgres -d pharmahub_db -v backup_full_20250121.dump
```

#### From .sql file

```bash
# Drop and recreate
dropdb -U postgres pharmahub_db
createdb -U postgres pharmahub_db

# Restore
psql -U postgres -d pharmahub_db < backup_20250121.sql
```

#### From compressed backup

```bash
gunzip -c backup_20250121.sql.gz | psql -U postgres -d pharmahub_db
```

### 2. Restore to Existing Database

```bash
# Restore tanpa drop database
psql -U postgres -d pharmahub_db < backup_20250121.sql
```

⚠️ **Warning:** Ini mungkin menyebabkan error jika data sudah ada.

### 3. Restore Specific Tables

```bash
# Restore hanya tabel tertentu
pg_restore -U postgres -d pharmahub_db -t users -t products backup.dump

# Atau dari SQL
psql -U postgres -d pharmahub_db -c "TRUNCATE users CASCADE;"
psql -U postgres -d pharmahub_db < users_backup.sql
```

## 🔐 Backup BYTEA (Image) Data

### Export Images to Files

```sql
-- Export user profile photos
COPY (
    SELECT
        user_id,
        ENCODE(profile_photo, 'base64') as photo_data,
        photo_mime_type,
        photo_filename
    FROM users
    WHERE profile_photo IS NOT NULL
) TO '/tmp/user_photos.csv' CSV HEADER;

-- Export product images
COPY (
    SELECT
        product_id,
        ENCODE(main_image, 'base64') as image_data,
        main_image_mime_type,
        main_image_filename
    FROM products
    WHERE main_image IS NOT NULL
) TO '/tmp/product_images.csv' CSV HEADER;
```

### Import Images from Files

```sql
-- Create temp table
CREATE TEMP TABLE temp_user_photos (
    user_id INTEGER,
    photo_data TEXT,
    photo_mime_type VARCHAR(50),
    photo_filename VARCHAR(255)
);

-- Import CSV
COPY temp_user_photos FROM '/tmp/user_photos.csv' CSV HEADER;

-- Update users table
UPDATE users u
SET
    profile_photo = DECODE(t.photo_data, 'base64'),
    photo_mime_type = t.photo_mime_type,
    photo_filename = t.photo_filename
FROM temp_user_photos t
WHERE u.user_id = t.user_id;

-- Cleanup
DROP TABLE temp_user_photos;
```

## 📅 Automated Backup Scripts

### Linux/Mac Cron Job

```bash
#!/bin/bash
# File: /opt/scripts/backup_pharmahub.sh

# Configuration
DB_NAME="pharmahub_db"
DB_USER="postgres"
BACKUP_DIR="/backups/pharmahub"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Full backup
pg_dump -U $DB_USER -d $DB_NAME -F c -f $BACKUP_DIR/full_$DATE.dump

# Compress
gzip $BACKUP_DIR/full_$DATE.dump

# Delete old backups
find $BACKUP_DIR -name "full_*.dump.gz" -mtime +$RETENTION_DAYS -delete

# Log
echo "Backup completed: full_$DATE.dump.gz" >> $BACKUP_DIR/backup.log
```

### Add to Crontab

```bash
# Edit crontab
crontab -e

# Backup setiap hari jam 2 pagi
0 2 * * * /opt/scripts/backup_pharmahub.sh

# Backup setiap 6 jam
0 */6 * * * /opt/scripts/backup_pharmahub.sh
```

### Windows Task Scheduler

```batch
@echo off
REM File: backup_pharmahub.bat

SET DB_NAME=pharmahub_db
SET DB_USER=postgres
SET BACKUP_DIR=C:\Backups\PharmaHub
SET DATE=%DATE:~-4,4%%DATE:~-10,2%%DATE:~-7,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%

IF NOT EXIST %BACKUP_DIR% mkdir %BACKUP_DIR%

"C:\Program Files\PostgreSQL\14\bin\pg_dump.exe" -U %DB_USER% -d %DB_NAME% -F c -f %BACKUP_DIR%\backup_%DATE%.dump

echo Backup completed: backup_%DATE%.dump
```

1. Open **Task Scheduler**
2. Create Basic Task
3. Trigger: Daily at 2:00 AM
4. Action: Start a program
5. Program: `C:\Backups\backup_pharmahub.bat`

## ☁️ Cloud Backup Solutions

### 1. AWS S3 Backup

```bash
#!/bin/bash
# Backup to AWS S3

DB_NAME="pharmahub_db"
BACKUP_FILE="backup_$(date +%Y%m%d).sql.gz"
S3_BUCKET="s3://pharmahub-backups"

# Create backup
pg_dump -U postgres -d $DB_NAME | gzip > /tmp/$BACKUP_FILE

# Upload to S3
aws s3 cp /tmp/$BACKUP_FILE $S3_BUCKET/

# Cleanup local
rm /tmp/$BACKUP_FILE

echo "Backup uploaded to $S3_BUCKET/$BACKUP_FILE"
```

### 2. Google Cloud Storage

```bash
#!/bin/bash
# Backup to Google Cloud Storage

BACKUP_FILE="backup_$(date +%Y%m%d).sql.gz"
GCS_BUCKET="gs://pharmahub-backups"

pg_dump -U postgres -d pharmahub_db | gzip > /tmp/$BACKUP_FILE
gsutil cp /tmp/$BACKUP_FILE $GCS_BUCKET/
rm /tmp/$BACKUP_FILE
```

## 🔧 Maintenance & Optimization

### Vacuum & Analyze

```sql
-- Vacuum untuk cleanup
VACUUM ANALYZE;

-- Vacuum specific tables
VACUUM ANALYZE users;
VACUUM ANALYZE products;
VACUUM ANALYZE orders;

-- Full vacuum (requires exclusive lock)
VACUUM FULL;
```

### Reindex

```sql
-- Reindex database
REINDEX DATABASE pharmahub_db;

-- Reindex specific table
REINDEX TABLE products;

-- Reindex specific index
REINDEX INDEX idx_products_name;
```

### Check Database Size

```sql
-- Database size
SELECT pg_size_pretty(pg_database_size('pharmahub_db'));

-- Table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- BYTEA columns size
SELECT
    'users.profile_photo' as column_name,
    pg_size_pretty(SUM(pg_column_size(profile_photo))) as total_size,
    COUNT(*) FILTER (WHERE profile_photo IS NOT NULL) as count
FROM users
UNION ALL
SELECT
    'products.main_image',
    pg_size_pretty(SUM(pg_column_size(main_image))),
    COUNT(*) FILTER (WHERE main_image IS NOT NULL)
FROM products;
```

## 🚨 Disaster Recovery

### Point-in-Time Recovery (PITR)

PostgreSQL supports PITR using WAL (Write-Ahead Logging).

#### Enable WAL Archiving

Edit `postgresql.conf`:

```
wal_level = replica
archive_mode = on
archive_command = 'cp %p /archive/pharmahub/%f'
```

#### Base Backup

```bash
pg_basebackup -U postgres -D /backup/base -Ft -z -P
```

#### Recovery

```bash
# Stop PostgreSQL
sudo systemctl stop postgresql

# Restore base backup
tar -xzf /backup/base/base.tar.gz -C /var/lib/postgresql/14/main/

# Create recovery.conf
cat > /var/lib/postgresql/14/main/recovery.conf << EOF
restore_command = 'cp /archive/pharmahub/%f %p'
recovery_target_time = '2025-01-21 14:30:00'
EOF

# Start PostgreSQL
sudo systemctl start postgresql
```

## 📋 Backup Checklist

### Daily

- [x] Full database backup
- [x] Verify backup file size
- [x] Test restore on staging (weekly)

### Weekly

- [x] Export BYTEA data separately
- [x] Backup configuration files
- [x] Clean old backups (> 30 days)
- [x] Check backup logs

### Monthly

- [x] Full restore test
- [x] Verify data integrity
- [x] Update disaster recovery documentation
- [x] Review backup storage capacity

## 🔍 Backup Verification

### Test Restore

```bash
# Create test database
createdb -U postgres pharmahub_test

# Restore backup
pg_restore -U postgres -d pharmahub_test backup.dump

# Verify
psql -U postgres -d pharmahub_test -c "SELECT COUNT(*) FROM users;"
psql -U postgres -d pharmahub_test -c "SELECT COUNT(*) FROM products;"
psql -U postgres -d pharmahub_test -c "SELECT COUNT(*) FROM orders;"

# Cleanup
dropdb -U postgres pharmahub_test
```

### Check Backup Integrity

```bash
# Check dump file
pg_restore -l backup.dump | head -20

# Validate backup
pg_restore --list backup.dump > /dev/null
if [ $? -eq 0 ]; then
    echo "Backup is valid"
else
    echo "Backup is corrupted!"
fi
```

## 📊 Monitoring Backup Status

### Create Backup Log Table

```sql
CREATE TABLE backup_logs (
    log_id SERIAL PRIMARY KEY,
    backup_type VARCHAR(50),
    backup_file VARCHAR(500),
    file_size BIGINT,
    status VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert log entry
INSERT INTO backup_logs (backup_type, backup_file, file_size, status)
VALUES ('full', 'backup_20250121.dump', 524288000, 'success');
```

### Query Backup History

```sql
SELECT
    backup_type,
    backup_file,
    pg_size_pretty(file_size) as size,
    status,
    created_at
FROM backup_logs
ORDER BY created_at DESC
LIMIT 10;
```

## 🆘 Emergency Recovery

### Corrupt Database Recovery

1. **Stop database access**

   ```sql
   -- Disconnect all users
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE datname = 'pharmahub_db' AND pid <> pg_backend_pid();
   ```

2. **Check corruption**

   ```sql
   -- Check table integrity
   SELECT * FROM pg_catalog.pg_class WHERE relname = 'users';
   ```

3. **Restore from backup**

   ```bash
   dropdb -U postgres pharmahub_db
   createdb -U postgres pharmahub_db
   pg_restore -U postgres -d pharmahub_db latest_backup.dump
   ```

4. **Verify restoration**
   ```sql
   -- Run verification queries
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM products;
   SELECT COUNT(*) FROM orders;
   ```

---

**Important Notes:**

- Always test backups regularly
- Keep backups in multiple locations
- Use compression for storage efficiency
- Document recovery procedures
- Monitor backup job logs
- Consider BYTEA data size when planning storage

**Recommended Backup Schedule:**

- **Full Daily:** Keep 7 days
- **Full Weekly:** Keep 4 weeks
- **Full Monthly:** Keep 12 months
- **Critical Data:** Real-time replication

---

**Last Updated:** November 21, 2025
**Version:** 1.0.0

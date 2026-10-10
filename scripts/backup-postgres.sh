#!/bin/sh
# Скрипт бэкапа PostgreSQL для KURUTA
# Запускается по cron каждые 6 часов

set -e

# Конфигурация
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="kuruta_db_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

echo "[$(date)] Starting PostgreSQL backup..."

# Создание директории для бэкапов
mkdir -p ${BACKUP_DIR}

# Создание бэкапа
echo "[$(date)] Creating database dump..."
PGPASSWORD=${POSTGRES_PASSWORD} pg_dump -U ${POSTGRES_USER} -h postgres -d ${POSTGRES_DB} | gzip > ${BACKUP_DIR}/${BACKUP_FILE}

# Проверка успешности
if [ $? -eq 0 ]; then
    echo "[$(date)] Backup created successfully: ${BACKUP_FILE}"
    ls -lh ${BACKUP_DIR}/${BACKUP_FILE}
else
    echo "[$(date)] ERROR: Backup failed!"
    exit 1
fi

# Удаление старых бэкапов
echo "[$(date)] Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
find ${BACKUP_DIR} -name "kuruta_db_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete

# Вывод списка оставшихся бэкапов
echo "[$(date)] Current backups:"
ls -lh ${BACKUP_DIR}/kuruta_db_*.sql.gz | tail -10

# Копирование в S3 (если настроено)
if [ -n "${S3_ENDPOINT}" ] && [ -n "${S3_ACCESS_KEY}" ]; then
    echo "[$(date)] Uploading backup to S3..."
    
    # Установка mc (MinIO Client)
    if ! command -v mc &> /dev/null; then
        wget https://dl.min.io/client/mc/release/linux-amd64/mc
        chmod +x mc
        mv mc /usr/local/bin/
    fi
    
    # Настройка алиаса
    mc alias set kuruta-s3 ${S3_ENDPOINT} ${S3_ACCESS_KEY} ${S3_SECRET_KEY}
    
    # Загрузка в S3
    mc cp ${BACKUP_DIR}/${BACKUP_FILE} kuruta-s3/${S3_BUCKET}/backups/db/${BACKUP_FILE}
    
    if [ $? -eq 0 ]; then
        echo "[$(date)] Backup uploaded to S3 successfully"
    else
        echo "[$(date)] ERROR: Failed to upload backup to S3"
        exit 1
    fi
fi

echo "[$(date)] Backup completed successfully!"

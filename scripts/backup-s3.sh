#!/bin/sh
# Скрипт бэкапа S3 (MinIO) для KURUTA
# Запускается по cron каждый день в 2:00

set -e

# Конфигурация
BACKUP_DIR="/backups/s3"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="kuruta_s3_${TIMESTAMP}.tar.gz"
RETENTION_DAYS=30

echo "[$(date)] Starting S3 backup..."

# Создание директории для бэкапов
mkdir -p ${BACKUP_DIR}

# Установка mc (MinIO Client) если не установлен
if ! command -v mc &> /dev/null; then
    echo "[$(date)] Installing MinIO Client..."
    wget -q https://dl.min.io/client/mc/release/linux-amd64/mc
    chmod +x mc
    mv mc /usr/local/bin/
fi

# Настройка алиаса
echo "[$(date)] Configuring MinIO Client..."
mc alias set kuruta-s3 ${S3_ENDPOINT} ${S3_ACCESS_KEY} ${S3_SECRET_KEY}

# Создание бэкапа всех бакетов
echo "[$(date)] Creating S3 backup..."
mc mirror kuruta-s3/${S3_BUCKET} ${BACKUP_DIR}/temp_${TIMESTAMP}

# Архивация
echo "[$(date)] Archiving backup..."
tar -czf ${BACKUP_DIR}/${BACKUP_FILE} -C ${BACKUP_DIR}/temp_${TIMESTAMP} .

# Удаление временной директории
rm -rf ${BACKUP_DIR}/temp_${TIMESTAMP}

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
find ${BACKUP_DIR} -name "kuruta_s3_*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete

# Вывод списка оставшихся бэкапов
echo "[$(date)] Current backups:"
ls -lh ${BACKUP_DIR}/kuruta_s3_*.tar.gz | tail -10

# Копирование в внешний S3 (если настроено)
if [ -n "${EXTERNAL_S3_ENDPOINT}" ] && [ -n "${EXTERNAL_S3_ACCESS_KEY}" ]; then
    echo "[$(date)] Uploading backup to external S3..."
    
    # Настройка алиаса для внешнего S3
    mc alias set external-s3 ${EXTERNAL_S3_ENDPOINT} ${EXTERNAL_S3_ACCESS_KEY} ${EXTERNAL_S3_SECRET_KEY}
    
    # Загрузка в внешний S3
    mc cp ${BACKUP_DIR}/${BACKUP_FILE} external-s3/${EXTERNAL_S3_BUCKET}/backups/s3/${BACKUP_FILE}
    
    if [ $? -eq 0 ]; then
        echo "[$(date)] Backup uploaded to external S3 successfully"
    else
        echo "[$(date)] ERROR: Failed to upload backup to external S3"
        exit 1
    fi
fi

echo "[$(date)] S3 backup completed successfully!"

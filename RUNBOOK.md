# KURUTA Operations Runbook

> Руководство для операций и инцидентов

## 📋 Содержание

1. [Ежедневные операции](#ежедневные-операции)
2. [Мониторинг](#мониторинг)
3. [Инциденты](#инциденты)
4. [Обслуживание](#обслуживание)
5. [Аварийное восстановление](#аварийное-восстановление)

## 📅 Ежедневные операции

### Утренняя проверка (9:00)

```bash
# 1. Проверка статуса всех сервисов
docker-compose -f docker-compose.prod.yml ps

# 2. Проверка health endpoints
curl -s https://kuruta.dev/api/v1/health | jq .
curl -s https://kuruta.dev | head -20
curl -s https://admin.kuruta.dev | head -20

# 3. Проверка логов на ошибки
docker-compose -f docker-compose.prod.yml logs --since=24h | grep -i error

# 4. Проверка использования ресурсов
docker stats --no-stream

# 5. Проверка бэкапов
ls -lh /backups/ | tail -10
```

### Вечерняя проверка (18:00)

```bash
# 1. Проверка бэкапов
ls -lh /backups/ | grep $(date +%Y%m%d)

# 2. Проверка Sentry на новые ошибки
# Откройте https://sentry.io/organizations/your-org/projects/kuruta/

# 3. Проверка audit log на подозрительную активность
docker exec kuruta-postgres-prod psql -U kuruta_prod -c "
  SELECT action, COUNT(*) 
  FROM audit_log 
  WHERE timestamp > NOW() - INTERVAL '24 hours'
  GROUP BY action
  ORDER BY COUNT(*) DESC
  LIMIT 20;
"
```

## 📊 Мониторинг

### Health Checks

```bash
# API Health
curl -s https://kuruta.dev/api/v1/health

# Database Health
docker exec kuruta-postgres-prod pg_isready -U kuruta_prod

# Redis Health
docker exec kuruta-redis-prod redis-cli -a <PASSWORD> ping

# MinIO Health
curl -s http://localhost:9000/minio/health/live
```

### Метрики производительности

```bash
# PostgreSQL метрики
docker exec kuruta-postgres-prod psql -U kuruta_prod -c "
  SELECT 
    datname,
    numbackends,
    xact_commit,
    xact_rollback,
    blks_read,
    blks_hit,
    tup_returned,
    tup_fetched,
    tup_inserted,
    tup_updated,
    tup_deleted
  FROM pg_stat_database
  WHERE datname = 'kuruta';
"

# Redis метрики
docker exec kuruta-redis-prod redis-cli -a <PASSWORD> INFO stats

# Container метрики
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
```

### Алерты

Настройте алерты для:
- **CPU > 80%** в течение 5 минут
- **Memory > 90%** в течение 5 минут
- **Disk > 85%**
- **Health check failed** 3 раза подряд
- **Error rate > 1%** в течение 5 минут
- **Response time > 2s** в течение 5 минут

## 🚨 Инциденты

### Инцидент 1: API недоступен

**Симптомы**:
- Health check не проходит
- Пользователи не могут войти
- Ошибки 502/503

**Действия**:

```bash
# 1. Проверка статуса
docker-compose -f docker-compose.prod.yml ps

# 2. Проверка логов
docker-compose -f docker-compose.prod.yml logs --tail=100 api

# 3. Перезапуск API
docker-compose -f docker-compose.prod.yml restart api

# 4. Проверка health
curl -s https://kuruta.dev/api/v1/health

# 5. Если не помогло, проверка зависимостей
docker-compose -f docker-compose.prod.yml logs postgres
docker-compose -f docker-compose.prod.yml logs redis
```

**Эскалация**: Если не решено за 15 минут, восстановить из бэкапа.

### Инцидент 2: Database down

**Симптомы**:
- Все сервисы падают
- Ошибки подключения к БД
- API возвращает 500

**Действия**:

```bash
# 1. Проверка статуса PostgreSQL
docker-compose -f docker-compose.prod.yml ps postgres

# 2. Проверка логов
docker-compose -f docker-compose.prod.yml logs postgres

# 3. Попытка перезапуска
docker-compose -f docker-compose.prod.yml restart postgres

# 4. Если не помогло, проверка данных
docker exec kuruta-postgres-prod ls -la /var/lib/postgresql/data

# 5. Восстановление из бэкапа
docker-compose -f docker-compose.prod.yml stop postgres
gunzip -c /backups/kuruta_db_$(date +%Y%m%d)_*.sql.gz | \
  docker exec -i kuruta-postgres-prod psql -U kuruta_prod -d kuruta
docker-compose -f docker-compose.prod.yml start postgres
```

**Эскалация**: Немедленно, это критический инцидент.

### Инцидент 3: Security breach

**Симптомы**:
- Подозрительная активность в audit log
- Множественные неудачные попытки входа
- Необычные финансовые операции

**Действия**:

```bash
# 1. Проверка audit log
docker exec kuruta-postgres-prod psql -U kuruta_prod -c "
  SELECT * FROM audit_log 
  WHERE timestamp > NOW() - INTERVAL '1 hour'
  ORDER BY timestamp DESC
  LIMIT 50;
"

# 2. Проверка антифрод сигналов
docker exec kuruta-postgres-prod psql -U kuruta_prod -c "
  SELECT * FROM anti_fraud_signals 
  WHERE created_at > NOW() - INTERVAL '1 hour'
  ORDER BY created_at DESC;
"

# 3. Блокировка подозрительных пользователей
docker exec kuruta-postgres-prod psql -U kuruta_prod -c "
  UPDATE users SET status = 'blocked' 
  WHERE id IN ('user-id-1', 'user-id-2');
"

# 4. Отзыв всех токенов
docker exec kuruta-postgres-prod psql -U kuruta_prod -c "
  UPDATE sessions SET revoked_at = NOW() 
  WHERE revoked_at IS NULL;
"

# 5. Смена всех секретов
nano .env
# Измените JWT_ACCESS_SECRET и JWT_REFRESH_SECRET
docker-compose -f docker-compose.prod.yml up -d
```

**Эскалация**: Немедленно, свяжитесь с security team.

### Инцидент 4: High memory usage

**Симптомы**:
- Docker stats показывает >90% memory
- Сервисы начинают падать
- OOM killer активируется

**Действия**:

```bash
# 1. Проверка использования памяти
docker stats --no-stream

# 2. Определение проблемного сервиса
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}" | sort -k2 -h

# 3. Перезапуск проблемного сервиса
docker-compose -f docker-compose.prod.yml restart <service-name>

# 4. Если не помогло, увеличение лимитов
nano docker-compose.prod.yml
# Увеличьте memory limits для проблемного сервиса
docker-compose -f docker-compose.prod.yml up -d
```

**Эскалация**: Если memory >95%, немедленно увеличьте ресурсы сервера.

### Инцидент 5: Disk full

**Симптомы**:
- Ошибки записи в БД
- Сервисы не могут писать логи
- Docker не может создавать контейнеры

**Действия**:

```bash
# 1. Проверка использования диска
df -h

# 2. Очистка старых логов
docker system prune -a --volumes

# 3. Очистка старых бэкапов
find /backups -name "*.sql.gz" -mtime +7 -delete

# 4. Очистка Docker образов
docker image prune -a

# 5. Проверка использования
df -h
```

**Эскалация**: Если диск >95%, немедленно расширьте disk space.

## 🔧 Обслуживание

### Еженедельное обслуживание (Понедельник, 3:00)

```bash
# 1. Обновление системы
sudo apt update && sudo apt upgrade -y

# 2. Обновление Docker
sudo apt install docker-ce docker-ce-cli containerd.io -y

# 3. Очистка Docker
docker system prune -a --volumes

# 4. Проверка бэкапов
ls -lh /backups/

# 5. Проверка SSL сертификатов
curl -I https://kuruta.dev | grep -i expires
```

### Ежемесячное обслуживание (1-е число, 3:00)

```bash
# 1. Полная проверка безопасности
npm audit
docker scan kuruta-api-prod
docker scan kuruta-web-prod

# 2. Обновление зависимостей
cd /opt/kuruta
npm update
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Проверка производительности
# Запустите нагрузочное тестирование

# 4. Ревью audit log
docker exec kuruta-postgres-prod psql -U kuruta_prod -c "
  SELECT action, COUNT(*) 
  FROM audit_log 
  WHERE timestamp > NOW() - INTERVAL '30 days'
  GROUP BY action
  ORDER BY COUNT(*) DESC;
"

# 5. Тест восстановления из бэкапа
# Восстановите бэкап на тестовый сервер
```

### Квартальное обслуживание

```bash
# 1. Полная проверка безопасности
# penetration testing

# 2. Ревью и обновление политики безопасности
nano SECURITY.md

# 3. Тест disaster recovery
# Полное восстановление на новом сервере

# 4. Ревью capacity planning
# Проверьте, нужны ли дополнительные ресурсы

# 5. Обновление документации
# Проверьте все документы на актуальность
```

## 🆘 Аварийное восстановление

### Сценарий 1: Полный отказ сервера

**Время восстановления**: 2-4 часа

**Действия**:

```bash
# 1. Поднимите новый сервер
# Следуйте DEPLOY.md

# 2. Восстановите из бэкапов
# PostgreSQL
gunzip -c /backups/kuruta_db_*.sql.gz | \
  docker exec -i kuruta-postgres-prod psql -U kuruta_prod -d kuruta

# S3
mc cp kuruta-s3/${S3_BUCKET}/backups/s3/*.tar.gz /tmp/
tar -xzf /tmp/kuruta_s3_*.tar.gz -C /data/

# 3. Обновите DNS
# Укажите новый IP сервера

# 4. Проверьте все сервисы
docker-compose -f docker-compose.prod.yml ps
curl https://kuruta.dev/api/v1/health
```

### Сценарий 2: Corruption базы данных

**Время восстановления**: 1-2 часа

**Действия**:

```bash
# 1. Остановка всех сервисов
docker-compose -f docker-compose.prod.yml stop

# 2. Удаление поврежденной БД
docker volume rm kuruta_postgres_data

# 3. Восстановление из последнего хорошего бэкапа
gunzip -c /backups/kuruta_db_*.sql.gz | \
  docker exec -i kuruta-postgres-prod psql -U kuruta_prod -d kuruta

# 4. Запуск сервисов
docker-compose -f docker-compose.prod.yml start

# 5. Проверка целостности
docker exec kuruta-postgres-prod psql -U kuruta_prod -c "
  SELECT COUNT(*) FROM users;
  SELECT COUNT(*) FROM financial_transactions;
"
```

### Сценарий 3: Security breach

**Время восстановления**: 4-8 часов

**Действия**:

```bash
# 1. Изоляция сервера
sudo ufw default deny incoming
sudo ufw allow 22/tcp

# 2. Сбор доказательств
docker logs kuruta-api-prod > /tmp/api-logs-$(date +%Y%m%d).txt
docker logs kuruta-postgres-prod > /tmp/db-logs-$(date +%Y%m%d).txt

# 3. Анализ инцидента
docker exec kuruta-postgres-prod psql -U kuruta_prod -c "
  SELECT * FROM audit_log 
  WHERE timestamp > NOW() - INTERVAL '24 hours'
  ORDER BY timestamp DESC;
"

# 4. Смена всех секретов
nano .env
# Измените все пароли и секреты
docker-compose -f docker-compose.prod.yml up -d

# 5. Уведомление пользователей
# Если были скомпрометированы данные пользователей

# 6. Пост-мортем анализ
# Создайте отчёт об инциденте
```

## 📞 Контакты

### Экстренные контакты

- **On-call инженер**: +7 (XXX) XXX-XX-XX
- **Security team**: security@kuruta.dev
- **Management**: cto@kuruta.dev

### Внешние контакты

- **Hosting provider**: support@hosting.com
- **Domain registrar**: support@registrar.com
- **Sentry**: support@sentry.io

---

**Последнее обновление**: 2024-01-15  
**Версия**: 1.0.0  
**Следующий ревью**: 2024-04-15

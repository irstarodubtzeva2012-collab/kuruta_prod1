# KURUTA Production Deployment

> Production-деплой для KURUTA с multi-stage builds, CI/CD, мониторингом и бэкапами.

## 📦 Что включено

### Docker Configuration
- **Multi-stage builds** для минимизации размера образов
- **Non-root user** (kuruta:1001) для безопасности
- **Healthchecks** для всех сервисов
- **Resource limits** для предотвращения OOM
- **Network isolation** через kuruta-network

### CI/CD Pipeline
- **Test & Lint**: Автоматическая проверка кода
- **Build & Push**: Сборка Docker образов и push в GHCR
- **Deploy Staging**: Автоматический деплой на staging (develop branch)
- **Deploy Production**: Zero downtime deployment на production (main branch)
- **Security Scan**: Trivy vulnerability scanner, npm audit

### Monitoring
- **Health endpoints**: `/health` для всех сервисов
- **Sentry integration**: Автоматическая отправка ошибок
- **Structured logging**: JSON логи с маскированием чувствительных данных
- **Resource monitoring**: Docker stats, PostgreSQL metrics, Redis metrics

### Backups
- **PostgreSQL**: Every 6 hours, retention 30 days
- **S3**: Daily at 2:00 AM, retention 30 days
- **Automatic upload** to external S3
- **Manual backup scripts** для экстренных случаев

### Documentation
- **DEPLOY.md**: Полное руководство по деплою
- **RUNBOOK.md**: Руководство для операций и инцидентов

## 🚀 Quick Start

### 1. Подготовка сервера

```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Клонирование репозитория
cd /opt
git clone https://github.com/your-org/kuruta.git
cd kuruta
```

### 2. Конфигурация

```bash
# Создание .env файла
cp .env.example .env
nano .env

# Генерация секретов
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Деплой

```bash
# Первый деплой
docker-compose -f docker-compose.prod.yml up -d --build

# Проверка статуса
docker-compose -f docker-compose.prod.yml ps

# Проверка health
curl http://localhost:4000/health
```

### 4. Настройка DNS

Добавьте A-записи:
```
kuruta.dev       → <SERVER_IP>
api.kuruta.dev   → <SERVER_IP>
admin.kuruta.dev → <SERVER_IP>
```

## 📊 Мониторинг

### Health Checks

```bash
# API health
curl https://kuruta.dev/api/v1/health

# Database health
docker exec kuruta-postgres-prod pg_isready -U kuruta_prod

# Redis health
docker exec kuruta-redis-prod redis-cli -a <PASSWORD> ping
```

### Логи

```bash
# Все логи
docker-compose -f docker-compose.prod.yml logs -f

# Логи конкретного сервиса
docker-compose -f docker-compose.prod.yml logs -f api

# Последние 100 строк
docker-compose -f docker-compose.prod.yml logs --tail=100 api
```

### Resource Usage

```bash
# Использование ресурсов
docker stats

# Детальная информация
docker inspect kuruta-api-prod | grep -A 10 "Resources"
```

## 💾 Бэкапы

### Автоматические бэкапы

- **PostgreSQL**: Каждые 6 часов
- **S3**: Каждый день в 2:00 AM

### Ручной бэкап

```bash
# Бэкап PostgreSQL
docker exec kuruta-backup /usr/local/bin/backup-postgres.sh

# Бэкап S3
docker exec kuruta-backup /usr/local/bin/backup-s3.sh
```

### Восстановление из бэкапа

```bash
# Остановка сервисов
docker-compose -f docker-compose.prod.yml stop postgres

# Восстановление PostgreSQL
gunzip -c /backups/kuruta_db_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i kuruta-postgres-prod psql -U kuruta_prod -d kuruta

# Запуск сервисов
docker-compose -f docker-compose.prod.yml start postgres
```

## 🔄 Обновление

### Обновление кода

```bash
cd /opt/kuruta

# Получение последних изменений
git pull origin main

# Пересборка и перезапуск
docker-compose -f docker-compose.prod.yml up -d --build

# Проверка статуса
docker-compose -f docker-compose.prod.yml ps
```

### Zero Downtime Deployment

```bash
# Обновление только API
docker-compose -f docker-compose.prod.yml up -d --no-deps --build api

# Обновление только Web
docker-compose -f docker-compose.prod.yml up -d --no-deps --build web

# Обновление только Admin
docker-compose -f docker-compose.prod.yml up -d --no-deps --build admin
```

## 🔙 Откат

### Откат к предыдущей версии

```bash
cd /opt/kuruta

# Проверка предыдущих коммитов
git log --oneline -10

# Откат к конкретному коммиту
git checkout <COMMIT_HASH>

# Пересборка
docker-compose -f docker-compose.prod.yml up -d --build
```

### Откат базы данных

```bash
# Остановка сервисов
docker-compose -f docker-compose.prod.yml stop

# Восстановление из бэкапа
gunzip -c /backups/kuruta_db_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i kuruta-postgres-prod psql -U kuruta_prod -d kuruta

# Запуск сервисов
docker-compose -f docker-compose.prod.yml start
```

## 🔒 Безопасность

### Non-root user

Все контейнеры запускаются от имени пользователя `kuruta` (UID 1001).

### Network isolation

Все сервисы находятся в изолированной сети `kuruta-network`.

### Ports

Все порты exposed только на localhost (127.0.0.1), доступ через Caddy reverse proxy.

### Secrets

Все секреты хранятся в `.env` файле, который не коммитится в Git.

### SSL/TLS

Caddy автоматически obtains SSL сертификаты от Let's Encrypt.

## 📈 Performance

### Resource Limits

| Service | CPU | Memory |
|---------|-----|--------|
| API | 2 cores | 2 GB |
| Web | 2 cores | 2 GB |
| Admin | 1 core | 1 GB |
| PostgreSQL | 2 cores | 4 GB |
| Redis | 1 core | 1 GB |
| MinIO | 1 core | 2 GB |
| Caddy | 1 core | 512 MB |

### Optimization

- **PostgreSQL**: Настроены параметры для production
- **Redis**: Maxmemory 512MB, allkeys-lru policy
- **Node.js**: Production mode, optimized builds

## 🆘 Troubleshooting

### Сервис не запускается

```bash
# Проверка логов
docker-compose -f docker-compose.prod.yml logs api

# Проверка статуса
docker-compose -f docker-compose.prod.yml ps

# Перезапуск сервиса
docker-compose -f docker-compose.prod.yml restart api
```

### Database connection failed

```bash
# Проверка PostgreSQL
docker exec -it kuruta-postgres-prod psql -U kuruta_prod -c "SELECT 1;"

# Проверка переменных окружения
docker exec kuruta-api-prod env | grep DATABASE

# Перезапуск PostgreSQL
docker-compose -f docker-compose.prod.yml restart postgres
```

### SSL certificate issues

```bash
# Проверка Caddy логов
docker-compose -f docker-compose.prod.yml logs caddy

# Перезапуск Caddy
docker-compose -f docker-compose.prod.yml restart caddy
```

## 📚 Документация

- **[DEPLOY.md](DEPLOY.md)**: Полное руководство по деплою
- **[RUNBOOK.md](RUNBOOK.md)**: Руководство для операций и инцидентов
- **[SECURITY.md](SECURITY.md)**: Политика безопасности
- **[KURUTA_CONTEXT.md](KURUTA_CONTEXT.md)**: Конституция проекта

## 📞 Поддержка

### Контакты

- **Email**: support@kuruta.dev
- **Telegram**: @kuruta_support
- **Документация**: https://docs.kuruta.dev

### Экстренные ситуации

1. **Сервер недоступен**: Проверьте firewall, DNS, SSL
2. **Database down**: Проверьте логи PostgreSQL, восстановите из бэкапа
3. **Security incident**: Немедленно отзовите все токены, проверьте audit log

---

**Последнее обновление**: 2024-01-15  
**Версия**: 1.0.0  
**Статус**: Production Ready

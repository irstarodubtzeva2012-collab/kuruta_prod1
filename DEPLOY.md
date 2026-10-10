# KURUTA Deployment Guide

> Полное руководство по деплою KURUTA в production

## 📋 Содержание

1. [Требования](#требования)
2. [Подготовка сервера](#подготовка-сервера)
3. [Конфигурация](#конфигурация)
4. [Деплой](#деплой)
5. [Мониторинг](#мониторинг)
6. [Бэкапы](#бэкапы)
7. [Обновление](#обновление)
8. [Откат](#откат)

## 🔧 Требования

### Сервер
- **OS**: Ubuntu 22.04 LTS или новее
- **CPU**: Минимум 4 vCPU
- **RAM**: Минимум 16 GB
- **Disk**: Минимум 100 GB SSD
- **Network**: Публичный IP, домен с SSL

### Software
- Docker 24.0+
- Docker Compose 2.20+
- Git 2.30+

### Домены
- `kuruta.dev` — основной домен
- `api.kuruta.dev` — API (опционально)
- `admin.kuruta.dev` — Admin Panel (опционально)

## 🖥️ Подготовка сервера

### 1. Установка Docker

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавление пользователя в docker группу
sudo usermod -aG docker $USER

# Проверка установки
docker --version
docker-compose --version
```

### 2. Настройка firewall

```bash
# Установка UFW
sudo apt install ufw -y

# Разрешение SSH
sudo ufw allow 22/tcp

# Разрешение HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включение firewall
sudo ufw enable

# Проверка статуса
sudo ufw status
```

### 3. Настройка DNS

Добавьте A-записи для доменов:

```
kuruta.dev       → <SERVER_IP>
api.kuruta.dev   → <SERVER_IP>
admin.kuruta.dev → <SERVER_IP>
```

### 4. Создание директории проекта

```bash
# Создание директории
sudo mkdir -p /opt/kuruta
cd /opt/kuruta

# Установка прав
sudo chown $USER:$USER /opt/kuruta
```

## ⚙️ Конфигурация

### 1. Клонирование репозитория

```bash
cd /opt/kuruta
git clone https://github.com/your-org/kuruta.git .
```

### 2. Создание .env файла

```bash
cp .env.example .env
nano .env
```

**Обязательные переменные:**

```env
# ─── Database ─────────────────────────────────────────────────────
POSTGRES_USER=kuruta_prod
POSTGRES_PASSWORD=<STRONG_PASSWORD>  # Минимум 32 символа
POSTGRES_DB=kuruta

# ─── Redis ────────────────────────────────────────────────────────
REDIS_PASSWORD=<STRONG_PASSWORD>

# ─── S3/MinIO ─────────────────────────────────────────────────────
S3_ACCESS_KEY=<ACCESS_KEY>
S3_SECRET_KEY=<SECRET_KEY>
S3_BUCKET=kuruta-prod

# ─── JWT Secrets ──────────────────────────────────────────────────
# Генерация: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=<64_CHARS_MIN>
JWT_REFRESH_SECRET=<64_CHARS_MIN>

# ─── CORS ─────────────────────────────────────────────────────────
CORS_ORIGINS=https://kuruta.dev,https://admin.kuruta.dev

# ─── API ──────────────────────────────────────────────────────────
API_URL=https://kuruta.dev
API_PORT=4000

# ─── Sentry ───────────────────────────────────────────────────────
SENTRY_DSN=https://<key>@sentry.io/<project>

# ─── Environment ──────────────────────────────────────────────────
NODE_ENV=production
```

### 3. Генерация секретов

```bash
# Генерация пароля PostgreSQL
openssl rand -base64 32

# Генерация JWT секретов
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Настройка Caddyfile

Отредактируйте `Caddyfile` для вашего домена:

```bash
nano Caddyfile
```

Замените `kuruta.dev` на ваш домен.

## 🚀 Деплой

### Первый деплой

```bash
cd /opt/kuruta

# Сборка и запуск всех сервисов
docker-compose -f docker-compose.prod.yml up -d --build

# Проверка статуса
docker-compose -f docker-compose.prod.yml ps

# Проверка логов
docker-compose -f docker-compose.prod.yml logs -f

# Проверка health endpoints
curl http://localhost:4000/health
curl http://localhost:3000
curl http://localhost:3001
```

### Проверка SSL

Caddy автоматически obtains SSL сертификаты от Let's Encrypt.

```bash
# Проверка SSL
curl -I https://kuruta.dev
```

## 📊 Мониторинг

### Health Endpoints

```bash
# API health
curl https://kuruta.dev/api/v1/health

# Проверка всех сервисов
docker-compose -f docker-compose.prod.yml ps
```

### Логи

```bash
# Все логи
docker-compose -f docker-compose.prod.yml logs -f

# Логи конкретного сервиса
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f web
docker-compose -f docker-compose.prod.yml logs -f postgres

# Последние 100 строк
docker-compose -f docker-compose.prod.yml logs --tail=100 api
```

### Sentry

Все ошибки автоматически отправляются в Sentry.

Проверка: https://sentry.io/organizations/your-org/projects/kuruta/

### Resource Usage

```bash
# Использование ресурсов
docker stats

# Детальная информация
docker inspect kuruta-api-prod | grep -A 10 "Resources"
```

## 💾 Бэкапы

### Автоматические бэкапы

Бэкапы выполняются автоматически:
- **PostgreSQL**: Каждые 6 часов
- **S3**: Каждый день в 2:00

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

### Проверка бэкапов

```bash
# Список бэкапов
ls -lh /backups/

# Проверка целостности
gunzip -t /backups/kuruta_db_*.sql.gz
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

### Обновление зависимостей

```bash
# Обновление npm зависимостей
npm update

# Пересборка
docker-compose -f docker-compose.prod.yml up -d --build
```

### Zero Downtime Deployment

```bash
# Обновление только API (без остановки других сервисов)
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

### Обновление секретов

```bash
# Редактирование .env
nano .env

# Перезапуск сервисов с новыми секретами
docker-compose -f docker-compose.prod.yml up -d
```

### Проверка безопасности

```bash
# Сканирование уязвимостей
docker scan kuruta-api-prod
docker scan kuruta-web-prod

# Проверка открытых портов
sudo netstat -tulpn | grep LISTEN
```

### Firewall правила

```bash
# Проверка правил
sudo ufw status verbose

# Добавление правила
sudo ufw allow <PORT>/tcp

# Удаление правила
sudo ufw delete allow <PORT>/tcp
```

## 📈 Производительность

### Оптимизация PostgreSQL

```bash
# Вход в контейнер
docker exec -it kuruta-postgres-prod psql -U kuruta_prod

# Проверка статистики
SELECT * FROM pg_stat_activity;
SELECT * FROM pg_stat_database;

# Выход
\q
```

### Оптимизация Redis

```bash
# Вход в контейнер
docker exec -it kuruta-redis-prod redis-cli -a <PASSWORD>

# Проверка памяти
INFO memory

# Проверка ключей
DBSIZE

# Выход
exit
```

### Мониторинг производительности

```bash
# Использование ресурсов в реальном времени
docker stats

# Детальная информация о контейнере
docker inspect kuruta-api-prod
```

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

### High memory usage

```bash
# Проверка использования памяти
docker stats

# Перезапуск сервисов
docker-compose -f docker-compose.prod.yml restart

# Увеличение лимитов в docker-compose.prod.yml
```

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

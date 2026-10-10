# KURUTA — Монорепо

> Двусторонний маркетплейс рекламных размещений.
> Единственный источник истины — `KURUTA_CONTEXT.md`.

## Структура

```
kuruta/
├── apps/
│   ├── api/          # NestJS — Backend API
│   ├── web/          # Next.js 14+ (App Router) — Основной фронтенд
│   └── admin/        # Next.js — Панель модерации/администрирования
├── packages/
│   ├── shared/       # Общие типы, утилиты, константы
│   └── database/     # Prisma schema + клиент + миграции
├── docker-compose.yml
├── turbo.json
├── .env.example
└── KURUTA_CONTEXT.md
```

## Стек (фиксирован Конституцией)

| Слой | Технология |
|------|-----------|
| Backend | Node.js 20 LTS + TypeScript 5.x + NestJS |
| Frontend | Next.js 14+ (App Router) + TypeScript |
| БД | PostgreSQL 16 |
| ORM | Prisma |
| Кэш/Очереди | Redis 7 + BullMQ |
| Файлы | S3-совместимое (MinIO) |
| Тесты | Jest + Supertest |
| CI/CD | GitHub Actions + Docker |

## Быстрый старт

### 1. Клонировать и установить зависимости

```bash
git clone <repo-url>
cd kuruta
cp .env.example .env
# Отредактируйте .env — замените секреты на сгенерированные
```

### 2. Поднять инфраструктуру (БД, Redis, MinIO)

```bash
docker compose up -d
```

Проверка:
```bash
docker compose ps
# Все сервисы должны быть healthy
```

### 3. Инициализировать базу данных

```bash
cd packages/database
npm install
npx prisma migrate dev
npx prisma generate
```

### 4. Запустить API

```bash
cd apps/api
npm install
npm run start:dev
```

API доступен на `http://localhost:4000`.

### 5. Запустить фронтенд

```bash
cd apps/web
npm install
npm run dev
```

Web доступен на `http://localhost:3000`.

### 6. Запустить админ-панель

```bash
cd apps/admin
npm install
npm run dev
```

Admin доступен на `http://localhost:3001`.

## Команды

| Команда | Описание |
|---------|----------|
| `docker compose up -d` | Поднять PostgreSQL, Redis, MinIO |
| `docker compose down -v` | Остановить и удалить volumes |
| `docker compose logs -f` | Логи всех сервисов |
| `npm run lint` | Линтер (корневой) |
| `npm run typecheck` | Проверка типов |
| `npm run test` | Тесты |
| `npm run build` | Сборка |

## CI/CD

GitHub Actions pipeline (`.github/workflows/ci.yml`):
1. Install dependencies
2. Lint
3. Typecheck
4. Test
5. Build

**Merge блокируется при падении любого шага.**

## Pre-commit hooks

Автоматически установлены через Husky:
- **lint-staged** — линтит только изменённые файлы
- **gitleaks** — блокирует коммиты с секретами

## Безопасность

- Секреты — только через `.env`, никогда в коде
- `.env` в `.gitignore`
- Pre-commit hook блокирует утечки
- См. `KURUTA_CONTEXT.md` раздел 3

## Лицензия

Private. Все права защищены.

# KURUTA — Схема базы данных

> PostgreSQL 16 + Prisma ORM. 18 моделей. Double-entry финансовая модель.

## Обзор

Схема спроектирована согласно Конституции проекта (`KURUTA_CONTEXT.md`).

### Ключевые принципы

1. **Финансовая модель**: Баланс пользователя **НЕ хранится** как поле. Вычисляется через агрегацию `FinancialTransaction`.
2. **Деньги**: Только `Decimal(14,2)`. Никаких Float.
3. **FSM**: Все статусы через конечные автоматы (см. Конституцию раздел 6).
4. **Индексы**: На всех FK, email/phone (unique), составные индексы для частых запросов.
5. **Cascade delete**: Только где безопасно (UserProfile, UserRoleAssignment, Session, Notification).
6. **AuditLog**: Append-only, **нет updatedAt**.

## Модели (18)

### Пользователи и роли
- **User** — основная сущность пользователя
- **UserProfile** — профиль (displayName, avatar, bio)
- **UserRoleAssignment** — many-to-many для совмещения ролей

### Амбассадоры (Направление A)
- **AmbassadorProfile** — профиль амбассадора (соцсети, аудитория, рейтинг)
- **AmbassadorVerificationRequest** — заявка на верификацию

### Владельцы площадок (Направление B)
- **PlatformOwnerProfile** — профиль владельца (компания, ИНН, ОГРН)
- **Platform** — площадка (Telegram, Instagram, YouTube, etc.)

### Направление A: Задания
- **Campaign** — кампания креатора
- **Task** — задание для амбассадора

### Направление B: Рекламные места
- **AdSlot** — рекламное место
- **Deal** — сделка (бронирование)

### Финансы (КРИТИЧНО)
- **FinancialTransaction** — финансовый журнал (double-entry)
  - `idempotencyKey` (unique) — идемпотентность
  - `type` (enum) — deposit, reward, refund, reserve, payout, fee, release, adjustment
  - `amount` — всегда положительное Decimal(14,2)
  - Баланс = SUM(deposit, reward, refund) − SUM(reserve, payout, fee)
- **PayoutRequest** — заявка на вывод средств

### Модерация и споры
- **ModerationQueue** — очередь модерации с приоритетами
- **Dispute** — спор между участниками

### Системные
- **AuditLog** — аудит-лог (append-only, нет updatedAt)
- **Notification** — уведомления (in-app)
- **Session** — refresh tokens
- **AntiFraudSignal** — антифрод-сигналы

## Enums (14)

### Статусы пользователей
- `UserStatus`: active, limited, blocked, deleted
- `UserRole`: guest, creator, ambassador, platform_owner, moderator, finance, admin, superadmin

### Статусы верификации
- `AmbassadorVerificationStatus`: draft, pending, needs_info, approved, rejected, suspended

### Статусы Direction A
- `CampaignStatus`: draft, awaiting_payment, pending_review, approved, active, paused, completed, cancelled
- `TaskStatus`: available, taken, in_progress, proof_submitted, reviewing, approved, paid, rejected, resubmit_required, overdue, cancelled, disputed

### Статусы Direction B
- `AdSlotStatus`: draft, pending_review, published, booked, in_progress, confirming, completed, closed
- `DealStatus`: created, paid, in_progress, confirming, completed, disputed, cancelled

### Финансы
- `FinancialTransactionType`: deposit, reserve, release, reward, fee, payout, refund, adjustment
- `FinancialTransactionStatus`: pending, completed, failed, refunded
- `PayoutStatus`: requested, checking, processing, paid, error, cancelled

### Модерация
- `ModerationQueueType`: ambassador_verification, platform_owner_verification, campaign, task, deal, dispute, payout
- `ModerationQueueStatus`: pending, in_progress, approved, rejected, needs_revision
- `DisputeStatus`: opened, investigating, resolved_creator, resolved_executor, resolved_partial, closed

### Системные
- `NotificationType`: task_assigned, task_completed, task_rejected, payout_requested, payout_processed, dispute_opened, dispute_resolved, campaign_approved, campaign_rejected, deal_created, deal_completed, verification_approved, verification_rejected
- `AntiFraudSignalType`: duplicate_device_fingerprint, duplicate_payout_requisites, suspicious_fast_completion, duplicate_proof_screenshots, sudden_audience_growth, unusual_activity_pattern
- `AntiFraudSignalSeverity`: low, medium, high, critical

## Индексы

### Unique
- `User.email`
- `User.phone`
- `FinancialTransaction.idempotencyKey`
- `Session.refreshToken`
- `UserRoleAssignment(userId, role)`

### Составные (для частых запросов)
- `Task(campaignId, status)`
- `Deal(adSlotId, status)`
- `FinancialTransaction(userId, createdAt)`
- `FinancialTransaction(userId, type)`
- `AuditLog(userId, timestamp)`
- `AntiFraudSignal(userId, type)`
- `PayoutRequest(userId, status)`
- `AdSlot(platformId, status)`
- `ModerationQueue(priority, createdAt)`

### FK индексы
Все foreign key поля проиндексированы для быстрого JOIN.

## Связи и onDelete

### Cascade (безопасно)
- `UserProfile` → `User`
- `UserRoleAssignment` → `User`
- `Session` → `User`
- `Notification` → `User`
- `Campaign` → `Task`
- `Platform` → `AdSlot`
- `AmbassadorProfile` → `AmbassadorVerificationRequest`

### Restrict (защита данных)
- `Campaign` → `User` (creator)
- `AdSlot` → `User` (owner)
- `Deal` → `User` (buyer)
- `Deal` → `AdSlot`
- `FinancialTransaction` → `User`
- `PayoutRequest` → `User`
- `Dispute` → `User` (opener)

### SetNull (мягкое удаление)
- `Task` → `User` (ambassador)
- `AuditLog` → `User`
- `AntiFraudSignal` → `User`

## Финансовая модель

### Формула баланса

```sql
SELECT 
  COALESCE(SUM(CASE WHEN type IN ('deposit', 'reward', 'refund', 'release') THEN amount ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN type IN ('reserve', 'payout', 'fee') THEN amount ELSE 0 END), 0)
FROM financial_transactions
WHERE user_id = $1 AND status = 'completed';
```

### Правила

1. Все операции в ACID-транзакциях (`prisma.$transaction`)
2. Идемпотентность через `idempotencyKey` (unique)
3. Транзакции неизменяемы (immutable)
4. `SELECT ... FOR UPDATE` при работе с балансом
5. Минимальный вывод: 500 ₽
6. Ежедневная сверка (reconciliation cron)

## Использование

### Валидация схемы

```bash
cd packages/database
npm run db:validate
# или
npx prisma validate
```

### Применение миграции

```bash
cd packages/database
npm run db:migrate:init
# или
npx prisma migrate dev --name init
```

### Генерация клиента

```bash
cd packages/database
npm run db:generate
# или
npx prisma generate
```

### Prisma Studio (GUI)

```bash
cd packages/database
npm run db:studio
# или
npx prisma studio
```

Откроется на `http://localhost:5555`.

## Критерии приёмки

- ✅ `npx prisma validate` — без ошибок
- ✅ `npx prisma migrate dev --name init` — проходит
- ✅ Все 18 сущностей присутствуют
- ✅ Деньги только Decimal(14,2)
- ✅ Баланс НЕ хранится в User
- ✅ AuditLog append-only (нет updatedAt)
- ✅ Cascade delete только где безопасно
- ✅ Индексы на FK и составные
- ✅ FSM статусы из Конституции

## Коммит

```
feat(database): initial schema
```

## Ссылки

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/16/)
- [KURUTA Constitution](../KURUTA_CONTEXT.md)

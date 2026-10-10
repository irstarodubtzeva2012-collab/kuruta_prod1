# Модуль модерации, споров и антифрода

## Обзор

Модуль реализует систему модерации, разрешения споров и антифрод-защиты для платформы KURUTA.

## Структура

```
apps/api/src/moderation/
├── moderation.module.ts          # Модуль
├── moderation.service.ts         # Сервис модерации
├── moderation.controller.ts      # Контроллер модерации
├── disputes.service.ts           # Сервис споров
├── disputes.controller.ts        # Контроллер споров
├── anti-fraud.service.ts         # Сервис антифрода
├── anti-fraud.controller.ts      # Контроллер антифрода
├── dto/
│   ├── moderation.dto.ts         # DTO модерации
│   ├── disputes.dto.ts           # DTO споров
│   └── anti-fraud.dto.ts         # DTO антифрода
└── processors/
    ├── anti-fraud.processor.ts   # Обработчик антифрод-задач
    └── verification.processor.ts # Обработчик верификации
```

## Модерация

### Очередь модерации

Универсальная очередь для всех типов сущностей:
- `campaign` - кампании
- `task` - задания
- `ad_slot` - рекламные места
- `deal` - сделки
- `dispute` - споры
- `ambassador_verification` - верификация амбассадоров
- `anti_fraud` - антифрод-сигналы

### API Endpoints

```
GET    /api/v1/moderation/queue           # Получить очередь
POST   /api/v1/moderation/queue/:id/assign # Назначить модератора
POST   /api/v1/moderation/queue/:id/approve # Одобрить
POST   /api/v1/moderation/queue/:id/reject  # Отклонить
GET    /api/v1/moderation/stats           # Статистика модератора
```

### Примеры

#### Получить очередь модерации

```bash
curl -X GET "http://localhost:3000/api/v1/moderation/queue?entityType=task&status=pending&limit=20" \
  -H "Authorization: Bearer <moderator-token>"
```

#### Одобрить элемент

```bash
curl -X POST "http://localhost:3000/api/v1/moderation/queue/123/approve" \
  -H "Authorization: Bearer <moderator-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "approved",
    "comment": "Все требования выполнены"
  }'
```

## Споры

### Жизненный цикл спора

```
opened → investigating → resolved_creator
                       → resolved_executor
                       → resolved_partial
                       → closed
```

### Открытие спора

Спор может быть открыт для:
- `task` - задания (креатором или амбассадором)
- `deal` - сделки (креатором или владельцем площадки)

При открытии спора:
1. Связанная сущность блокируется (статус → `disputed`)
2. Создается запись в `ModerationQueue` с высоким приоритетом
3. Создается запись в `AuditLog`

### Разрешение спора

Модератор может принять одно из решений:

1. **in_favor_of_creator** - полный возврат креатору
   - Все средства возвращаются креатору
   - Исполнитель не получает ничего

2. **in_favor_of_executor** - полная выплата исполнителю
   - Все средства выплачиваются исполнителю
   - Креатор не получает возврат

3. **partial_refund** - частичный возврат
   - Указывается процент возврата (`refundPercentage`)
   - Средства распределяются между креатором и исполнителем

### API Endpoints

```
POST   /api/v1/disputes              # Открыть спор
GET    /api/v1/disputes/my           # Мои споры
GET    /api/v1/disputes/all          # Все споры (модератор)
GET    /api/v1/disputes/:id          # Получить спор
POST   /api/v1/disputes/:id/resolve  # Разрешить спор
```

### Примеры

#### Открыть спор

```bash
curl -X POST "http://localhost:3000/api/v1/disputes" \
  -H "Authorization: Bearer <creator-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "entityType": "task",
    "entityId": "task-uuid",
    "reason": "Task not completed properly",
    "details": "The work does not meet the requirements",
    "evidence": {
      "screenshots": ["screenshot1.jpg", "screenshot2.jpg"]
    }
  }'
```

#### Разрешить спор (полный возврат)

```bash
curl -X POST "http://localhost:3000/api/v1/disputes/dispute-uuid/resolve" \
  -H "Authorization: Bearer <moderator-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "resolution": "in_favor_of_creator",
    "comment": "Task was not completed according to requirements",
    "idempotencyKey": "uuid"
  }'
```

#### Разрешить спор (частичный возврат)

```bash
curl -X POST "http://localhost:3000/api/v1/disputes/dispute-uuid/resolve" \
  -H "Authorization: Bearer <moderator-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "resolution": "partial_refund",
    "refundPercentage": 50,
    "comment": "Task partially completed",
    "idempotencyKey": "uuid"
  }'
```

### Распределение денег

При разрешении спора вызывается `FinanceService`:

```typescript
// Полный возврат креатору
await this.financeService.refund({
  userId: creatorId,
  originalTransactionId: taskId,
  amount: '1000.00',
  description: 'Возврат по спору #disputeId',
  idempotencyKey: uuidv4(),
});

// Выплата исполнителю
await this.financeService.reward({
  userId: executorId,
  amount: '500.00',
  description: 'Выплата по спору #disputeId',
  idempotencyKey: uuidv4(),
  relatedEntityType: 'task',
  relatedEntityId: taskId,
});
```

## Антифрод

### Типы сигналов

1. **duplicate_device_fingerprint** - одинаковые устройства у разных пользователей
2. **duplicate_payout_requisites** - одинаковые реквизиты для выплат
3. **suspicious_fast_completion** - подозрительно быстрое выполнение заданий
4. **duplicate_proof_screenshots** - дубликаты скриншотов
5. **sudden_audience_growth** - резкий рост аудитории
6. **unusual_activity_pattern** - необычные паттерны активности

### Severity уровни

- `low` - низкий приоритет
- `medium` - средний приоритет
- `high` - высокий приоритет
- `critical` - критический приоритет

### Cron-задачи

Антифрод-проверки запускаются автоматически:

| Задача | Расписание | Описание |
|--------|-----------|----------|
| `check-duplicate-devices` | Каждые 6 часов | Проверка дубликатов устройств |
| `check-fast-completions` | Каждые 4 часа | Проверка быстрых выполнений |
| `check-duplicate-screenshots` | Каждые 8 часов | Проверка дубликатов скриншотов |
| `check-duplicate-requisites` | Раз в день | Проверка дубликатов реквизитов |

### API Endpoints

```
GET    /api/v1/anti-fraud/signals           # Получить сигналы
POST   /api/v1/anti-fraud/signals/:id/review # Проверить сигнал
POST   /api/v1/anti-fraud/schedule          # Запустить планирование
```

### Примеры

#### Получить сигналы

```bash
curl -X GET "http://localhost:3000/api/v1/anti-fraud/signals?severity=high&status=pending" \
  -H "Authorization: Bearer <moderator-token>"
```

#### Проверить сигнал

```bash
curl -X POST "http://localhost:3000/api/v1/anti-fraud/signals/signal-uuid/review" \
  -H "Authorization: Bearer <moderator-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed",
    "comment": "Fraud confirmed, user blocked"
  }'
```

## Повторная верификация амбассадоров

### Cron-задача

Запускается раз в 30 дней:

```typescript
@Cron('0 0 1 * *') // Первый день каждого месяца
async handleReverifyAmbassadors() {
  // Получаем всех верифицированных амбассадоров
  const ambassadors = await prisma.ambassadorProfile.findMany({
    where: { isVerified: true },
  });

  for (const ambassador of ambassadors) {
    // Проверяем активность за последние 60 дней
    const lastTask = await prisma.task.findFirst({
      where: {
        ambassadorId: ambassador.userId,
        status: 'paid',
        updatedAt: {
          gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!lastTask) {
      // Создаем заявку на повторную верификацию
      await prisma.ambassadorVerificationRequest.create({
         {
          ambassadorId: ambassador.id,
          status: 'pending',
        },
      });
    }
  }
}
```

## Аудит-лог

Все действия логируются в `AuditLog`:

```typescript
await prisma.auditLog.create({
   {
    userId: moderatorId,
    action: 'dispute.resolved',
    entityType: 'Dispute',
    entityId: disputeId,
    before: { status: 'opened' },
    after: {
      status: 'resolved_creator',
      creatorRefund: 1000,
      executorPayout: 0,
    },
  },
});
```

## Тестирование

### E2E тесты

```bash
npm run test:e2e test/disputes.e2e-spec.ts
```

Тесты покрывают:
- Открытие спора
- Разрешение спора (полный возврат)
- Разрешение спора (частичный возврат)
- Контроль доступа
- Распределение денег

### Критерии приёмки

- ✅ E2E тест: открытие → решение → распределение денег
- ✅ Коммит: `feat(api): moderation, disputes, anti-fraud`

## Зависимости

- `@nestjs/bull` - очередь задач
- `bull` - обработчик очереди
- `FinanceModule` - финансовые операции
- `AdSlotsModule` - рекламные места
- `CampaignsModule` - кампании и задания

## Коммит

```
feat(api): moderation, disputes, anti-fraud
```

# KURUTA — Campaigns and Tasks Module

> Модуль кампаний и заданий с FSM, модерацией и интеграцией с финансовым журналом.

## Обзор

Модуль реализует два направления KURUTA:
- **Направление A**: Креатор → Кампания → Задания → Амбассадоры → Модерация → Вознаграждение

### Ключевые особенности

1. **FSM для задач**: available → taken → proof_submitted → reviewing → approved/rejected
2. **Интеграция с FinanceService**: резервирование, начисление, освобождение
3. **Модерация**: очередь для модераторов, approve/reject
4. **Фоновые задачи**: проверка просроченных заданий через BullMQ
5. **Подбор амбассадоров**: автоматический фильтр по требованиям

## Структура

```
apps/api/src/campaigns/
├── campaigns.module.ts
├── campaigns.controller.ts
├── campaigns.service.ts
├── tasks.controller.ts
├── tasks.service.ts
├── moderation.controller.ts
├── moderation.service.ts
├── dto/
│   ├── campaign.dto.ts
│   └── task.dto.ts
└── processors/
    └── task.processor.ts
```

## FSM Состояния

### Campaign
```
draft → awaiting_payment → pending_review → approved → active → paused → completed | cancelled
```

### Task
```
available → taken → in_progress → proof_submitted → reviewing → approved → paid | rejected | overdue
```

## API Endpoints

### Campaigns

#### POST /campaigns
Создание кампании.

**Request:**
```json
{
  "title": "Продвижение продукта",
  "description": "Необходимо создать контент...",
  "budget": 10000,
  "taskCount": 10,
  "taskReward": 1000,
  "requirements": { "niches": ["technology"] },
  "targetAudience": { "age": "18-35" }
}
```

#### GET /campaigns
Получение списка кампаний пользователя.

#### GET /campaigns/:id
Получение кампании.

#### PUT /campaigns/:id
Обновление кампании (только в статусе draft).

#### POST /campaigns/:id/pay
Оплата кампании (резервирование средств).

**Request:**
```json
{
  "idempotencyKey": "uuid"
}
```

#### POST /campaigns/:id/submit
Отправка на модерацию.

#### POST /campaigns/:id/ambassadors
Подбор амбассадоров.

**Request:**
```json
{
  "niches": ["technology"],
  "minAudienceSize": 5000,
  "limit": 20
}
```

### Tasks

#### GET /tasks/available
Получение доступных задач.

#### GET /tasks/my
Получение задач амбассадора.

#### GET /tasks/:id
Получение задачи.

#### POST /tasks/:id/take
Взятие задачи (FSM: available → taken).

**Request:**
```json
{
  "idempotencyKey": "uuid"
}
```

#### POST /tasks/:id/submit
Отправка доказательства (FSM: taken → proof_submitted).

**Request:**
```json
{
  "proofData": {
    "links": ["https://..."],
    "screenshots": ["..."]
  },
  "idempotencyKey": "uuid"
}
```

### Moderation

#### GET /moderation/queue
Получение очереди модерации.

#### POST /moderation/approve/:entityType/:entityId
Одобрение элемента.

**Request:**
```json
{
  "reviewNotes": "Отличная работа"
}
```

#### POST /moderation/reject/:entityType/:entityId
Отклонение элемента.

**Request:**
```json
{
  "reason": "Не соответствует требованиям"
}
```

## Финансовые операции

### При создании кампании
1. Креатор создаёт кампанию (статус: draft)
2. Оплачивает кампанию → резервирование средств (статус: awaiting_payment)
3. Отправляет на модерацию (статус: pending_review)

### При одобрении кампании
- Статус: approved
- Средства остаются зарезервированными

### При отклонении кампании
- Статус: cancelled
- Освобождение резерва → возврат средств креатору

### При взятии задачи
- Резервирование вознаграждения за задачу

### При одобрении задачи
- Начисление вознаграждения амбассадору
- Освобождение резерва креатора

### При отклонении задачи
- Освобождение резерва креатора

### При просрочке задачи
- Освобождение резерва креатора
- Ухудшение рейтинга амбассадора

## Фоновые задачи (BullMQ)

### Проверка просроченных задач
- Задача добавляется в очередь при взятии
- Задержка: 7 дней (срок выполнения)
- При срабатывании: проверка статуса, обработка просрочки

## Подбор амбассадоров

Автоматический фильтр по:
- **Темы/ниши** (niches)
- **Минимальный размер аудитории** (minAudienceSize)
- **Гео** (geo) - TODO
- **Верификация** (isVerified: true)
- **Рейтинг** (сортировка по убыванию)

## Тестирование

### E2E тест

```bash
cd apps/api
npm run test:e2e test/campaigns.e2e-spec.ts
```

**Сценарий:**
1. Create campaign → pay → moderate → approve
2. Take task → submit proof → moderate → approve
3. Verify reward received

## Коммит

```
feat(api): campaigns and tasks module
```

## Ссылки

- [KURUTA Constitution](../../../KURUTA_CONTEXT.md) — раздел 6 (FSM)
- [Finance Module](../finance/FINANCE_MODULE.md)

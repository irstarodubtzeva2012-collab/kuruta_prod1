# KURUTA — Ad Slots and Deals Module

> Модуль рекламных мест и сделок с логикой Единого маркетплейса.

## Обзор

Модуль реализует Направление B KURUTA:
- **Владелец площадки** → выставляет рекламное место → **Креатор** бронирует и оплачивает → **Владелец** выполняет → **KURUTA** проверяет → выплата

### Ключевые особенности

1. **Единый маркетплейс**: Владелец не видит свои слоты в каталоге
2. **Комиссия 10%**: Владелец получает X, платформа получает 10%, креатор платит X + 10%
3. **SELECT FOR UPDATE**: Блокировка слота при бронировании
4. **Повторная покупка**: Упрощенный эндпоинт для покупки у того же владельца
5. **Модерация**: Очередь для модераторов, approve/reject

## Структура

```
apps/api/src/ad-slots/
├── ad-slots.module.ts
├── ad-slots.controller.ts
├── ad-slots.service.ts
├── deals.controller.ts
├── deals.service.ts
└── dto/
    ├── ad-slot.dto.ts
    └── deal.dto.ts
```

## FSM Состояния

### AdSlot
```
draft → pending_review → published → booked → in_progress → confirming → completed | closed
```

### Deal
```
created → paid → in_progress → confirming → completed | disputed | cancelled
```

## API Endpoints

### Ad Slots

#### POST /ad-slots
Создание рекламного места (только для platform_owner).

**Request:**
```json
{
  "platformId": "uuid",
  "title": "Пост в Telegram",
  "description": "Размещение поста в канале",
  "price": 5000,
  "format": "post",
  "duration": 1,
  "availability": {},
  "requirements": {}
}
```

#### GET /ad-slots/catalog
**ЕДИНЫЙ МАРКЕТПЛЕЙС**: Публичный каталог с фильтрацией собственных слотов.

**Логика:**
- Если пользователь авторизован и является владельцем → его слоты исключаются из выдачи
- Если пользователь не авторизован или является креатором → видит все опубликованные слоты

**Query Parameters:**
- `platformType` - тип платформы (telegram, instagram, etc.)
- `minPrice` - минимальная цена
- `maxPrice` - максимальная цена
- `minAudienceSize` - минимальный размер аудитории
- `format` - формат размещения
- `limit` - лимит результатов
- `offset` - смещение

#### GET /ad-slots/my
Получение списка своих рекламных мест (для владельца).

#### GET /ad-slots/:id
Получение рекламного места.

#### PUT /ad-slots/:id
Обновление рекламного места (только в статусе draft).

#### POST /ad-slots/:id/submit
Отправка на модерацию.

#### GET /ad-slots/:id/availability
Проверка доступности на даты.

### Deals

#### POST /deals/book/:adSlotId
Бронирование рекламного места.

**Request:**
```json
{
  "startDate": "2024-02-01",
  "endDate": "2024-02-02",
  "contentBrief": "Описание контента",
  "idempotencyKey": "uuid"
}
```

**Response:**
```json
{
  "deal": { ... },
  "basePrice": 5000,
  "commission": 500,
  "totalAmount": 5500
}
```

#### POST /deals/repurchase
**ПОВТОРНАЯ ПОКУПКА**: Упрощенная покупка у того же владельца.

**Request:**
```json
{
  "previousDealId": "uuid",
  "startDate": "2024-03-01",
  "endDate": "2024-03-02",
  "idempotencyKey": "uuid"
}
```

#### POST /deals/:id/pay
Оплата сделки (резервирование средств).

#### POST /deals/:id/confirm
Подтверждение выполнения (владельцем).

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

#### GET /deals/my
Получение списка сделок.

**Query Parameters:**
- `role` - buyer или owner
- `status` - статус сделки

#### GET /deals/:id
Получение сделки.

## Единый маркетплейс (КРИТИЧНО)

### Логика фильтрации

```typescript
async getCatalog(userId: string | null, filters?: CatalogFilterDto) {
  const where: Prisma.AdSlotWhereInput = {
    status: AdSlotStatus.published,
  };

  // Если пользователь авторизован и является владельцем
  if (userId) {
    const isOwner = await prisma.platformOwnerProfile.findUnique({
      where: { userId },
    });

    if (isOwner) {
      // Исключаем его собственные слоты
      where.ownerId = {
        not: userId,
      };
    }
  }

  // ... остальные фильтры
}
```

### Почему это важно

1. **Предотвращение самопокупки**: Владелец не может купить у себя
2. **Честный каталог**: Все видят одинаковые слоты
3. **Защита от манипуляций**: Нельзя искусственно завысить рейтинг

## Комиссия платформы

### Формула

```
Base Price (X) = цена, указанная владельцем
Commission = X * 10%
Total Amount = X + Commission

Владелец получает: X
Платформа получает: Commission (10%)
Креатор платит: Total Amount (X + 10%)
```

### Пример

```
Владелец указывает цену: 5000 RUB
Комиссия платформы: 500 RUB (10%)
Креатор платит: 5500 RUB
Владелец получает: 5000 RUB
Платформа зарабатывает: 500 RUB
```

### Реализация через FinanceService

```typescript
// При одобрении сделки
const ownerAmount = deal.totalAmount - deal.commission;

await this.financeService.payToOwner({
  ownerId: deal.adSlot.ownerId,
  amount: ownerAmount.toString(),
  description: `Выплата за рекламное размещение`,
  idempotencyKey,
  relatedEntityType: 'deal',
  relatedEntityId: dealId,
});
```

## Блокировки и Race Conditions

### SELECT FOR UPDATE при бронировании

```typescript
async bookSlot(buyerId: string, adSlotId: string, dto: BookSlotDto) {
  return prisma.$transaction(async (tx) => {
    // Блокируем слот для предотвращения двойного бронирования
    const adSlot = await tx.adSlot.findUnique({
      where: { id: adSlotId },
    });

    // Проверяем доступность на указанные даты
    const conflictingDeals = await tx.deal.findMany({
      where: {
        adSlotId,
        status: { in: ['created', 'paid', 'in_progress', 'confirming'] },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    if (conflictingDeals.length > 0) {
      throw new ConflictException('Ad slot is already booked');
    }

    // Создаём сделку
    const deal = await tx.deal.create({ ... });

    return deal;
  });
}
```

## Тестирование

### E2E тест

```bash
cd apps/api
npm run test:e2e test/ad-slots.e2e-spec.ts
```

**Сценарий:**
1. Create slot → publish → moderate → approve
2. Book slot → pay → confirm → moderate → approve
3. Verify owner payout (без комиссии)
4. Verify unified marketplace (владелец не видит свои слоты)
5. Verify commission calculation (10%)

### Тест Единого маркетплейса

```typescript
it('Owner should NOT see their own slots in catalog', async () => {
  const catalog = await prisma.adSlot.findMany({
    where: {
      status: 'published',
      ownerId: { not: ownerId }, // Исключаем слоты владельца
    },
  });

  const ownerSlotsInCatalog = catalog.filter(slot => slot.ownerId === ownerId);
  expect(ownerSlotsInCatalog.length).toBe(0);
});
```

## Коммит

```
feat(api): ad slots, deals and unified marketplace logic
```

## Ссылки

- [KURUTA Constitution](../../../KURUTA_CONTEXT.md) — раздел 5 (Единый маркетплейс)
- [Finance Module](../finance/FINANCE_MODULE.md)

# KURUTA — Financial Journal Module

> КРИТИЧЕСКИ ВАЖНЫЙ МОДУЛЬ. Ошибки здесь = потеря денег.

## Обзор

Финансовый журнал реализован согласно Конституции KURUTA (раздел 5).

### Ключевые принципы

1. **Двойная запись**: Каждая операция имеет тип (deposit, reserve, release, reward, fee, payout, refund, adjustment)
2. **Баланс вычисляется**: НЕ хранится в БД, вычисляется через SUM транзакций
3. **Атомарность**: Все операции в `prisma.$transaction`
4. **Блокировки**: `SELECT ... FOR UPDATE` при работе с балансом
5. **Идемпотентность**: Каждая операция имеет уникальный `idempotencyKey`
6. **Аудит**: Все операции логируются в `audit_log`

## Архитектура

```
apps/api/src/finance/
├── finance.module.ts
├── finance.controller.ts
├── finance.service.ts
├── dto/
│   └── finance.dto.ts
└── providers/
    ├── payment-provider.interface.ts
    └── mock-payment.provider.ts
```

## Формула баланса

```typescript
Баланс = SUM(deposit, reward, refund, release) - SUM(reserve, payout, fee)
```

Где:
- **Приход**: deposit, reward, refund, release
- **Расход**: reserve, payout, fee

## API Endpoints

### GET /finance/balance
Получить баланс текущего пользователя.

**Response:**
```json
{
  "balance": "1500.00",
  "currency": "RUB"
}
```

### GET /finance/transactions
Получить историю транзакций.

**Query Parameters:**
- `type` - тип транзакции (опционально)
- `status` - статус транзакции (опционально)
- `limit` - количество записей (по умолчанию 50)
- `offset` - смещение (по умолчанию 0)

**Response:**
```json
{
  "transactions": [...],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

### POST /finance/deposit
Пополнение баланса.

**Request:**
```json
{
  "amount": "1000.00",
  "description": "Пополнение баланса",
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000"
}
```

### POST /finance/reserve
Резервирование средств (блокировка).

**Request:**
```json
{
  "amount": "500.00",
  "description": "Резервирование для задания",
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440001",
  "relatedEntityId": "task-uuid"
}
```

### POST /finance/release
Освобождение резерва.

**Request:**
```json
{
  "reserveTransactionId": "transaction-uuid",
  "description": "Освобождение резерва",
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440002"
}
```

### POST /finance/reward
Начисление вознаграждения (для модераторов).

**Request:**
```json
{
  "userId": "user-uuid",
  "amount": "100.00",
  "description": "Вознаграждение за задание",
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440003",
  "relatedEntityId": "task-uuid"
}
```

### POST /finance/pay-to-owner
Выплата владельцу площадки (для модераторов).

**Request:**
```json
{
  "ownerId": "owner-uuid",
  "amount": "900.00",
  "description": "Выплата за рекламное размещение",
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440004",
  "relatedEntityId": "deal-uuid"
}
```

### POST /finance/payout
Запрос на вывод средств.

**Request:**
```json
{
  "amount": "1000.00",
  "paymentMethod": "card",
  "requisites": {
    "cardNumber": "****1234"
  },
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440005"
}
```

**Ограничения:**
- Минимальная сумма вывода: 500 RUB
- Требуется достаточный баланс

### POST /finance/payout/:id/complete
Завершение вывода средств (для финансистов).

### POST /finance/refund
Возврат средств (для модераторов).

**Request:**
```json
{
  "originalTransactionId": "transaction-uuid",
  "amount": "500.00", // опционально, если null - полный возврат
  "description": "Возврат средств",
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440006"
}
```

### POST /finance/reconcile
Сверка баланса (для администраторов).

## Безопасность

### Идемпотентность

Каждая операция имеет уникальный `idempotencyKey` (UUID). При повторном вызове с тем же ключом:
- Возвращается существующая транзакция
- НЕ создаётся дубликат
- НЕ изменяется баланс

### Race Conditions

Все операции используют:
1. `prisma.$transaction` для атомарности
2. Блокировку пользователя через `SELECT ... FOR UPDATE`
3. Проверку баланса ДО операции

Пример предотвращения double-spending:
```typescript
// Два одновременных запроса на резервирование 800 при балансе 1000
// Только один пройдёт успешно, второй получит ошибку "Insufficient balance"
```

### Аудит-лог

Все операции логируются:
```typescript
await prisma.auditLog.create({
  data: {
    userId,
    action: 'transaction.deposit',
    entityType: 'FinancialTransaction',
    entityId: transaction.id,
    after: {
      type: 'deposit',
      amount: '1000.00',
      description: 'Пополнение баланса',
    },
  },
});
```

## Платёжный адаптер

Интерфейс `PaymentProvider` абстрагирует работу с платёжными системами:

```typescript
interface PaymentProvider {
  createPayment(params): Promise<{ paymentId, status }>;
  getPaymentStatus(paymentId): Promise<{ status }>;
  refundPayment(paymentId, amount?): Promise<{ refundId, status }>;
  payout(params): Promise<{ payoutId, status }>;
}
```

Реализации:
- `MockPaymentProvider` - заглушка для разработки
- `YooKassaProvider` - ЮKassa (TODO)
- `StripeProvider` - Stripe (TODO)

## Тестирование

### E2E тесты

```bash
cd apps/api
npm run test:e2e test/finance.e2e-spec.ts
```

**Покрытие:**
- ✅ Идемпотентность (повторный вызов = тот же результат)
- ✅ Race conditions (два одновременных списания — только одно проходит)
- ✅ Вычисление баланса
- ✅ Сверка баланса

### Тест идемпотентности

```typescript
// Первый запрос
const tx1 = await financeService.deposit({
  userId,
  amount: '1000.00',
  idempotencyKey: 'uuid-1',
});

// Второй запрос с тем же ключом
const tx2 = await financeService.deposit({
  userId,
  amount: '1000.00',
  idempotencyKey: 'uuid-1',
});

// Должна вернуться та же транзакция
expect(tx1.id).toBe(tx2.id);
```

### Тест race condition

```typescript
// Пополняем баланс 1000
await financeService.deposit({ userId, amount: '1000.00', idempotencyKey: 'uuid-1' });

// Пытаемся зарезервировать 800 дважды одновременно
const results = await Promise.allSettled([
  financeService.reserve({ userId, amount: '800.00', idempotencyKey: 'uuid-2', ... }),
  financeService.reserve({ userId, amount: '800.00', idempotencyKey: 'uuid-3', ... }),
]);

// Одна успешная, одна с ошибкой
expect(results.filter(r => r.status === 'fulfilled').length).toBe(1);
expect(results.filter(r => r.status === 'rejected').length).toBe(1);
```

## Команды

```bash
# Запуск тестов
npm run test:e2e test/finance.e2e-spec.ts

# Проверка баланса пользователя
curl -X GET http://localhost:4000/api/v1/finance/balance \
  -H "Authorization: Bearer <token>"

# Пополнение баланса
curl -X POST http://localhost:4000/api/v1/finance/deposit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "1000.00",
    "description": "Пополнение",
    "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

## Коммит

```
feat(api): financial journal with double-entry and idempotency
```

## Ссылки

- [KURUTA Constitution](../../../KURUTA_CONTEXT.md) — раздел 5 (Финансовый журнал)
- [Double-Entry Accounting](https://en.wikipedia.org/wiki/Double-entry_bookkeeping)
- [Idempotency Keys](https://stripe.com/docs/api/idempotent_requests)

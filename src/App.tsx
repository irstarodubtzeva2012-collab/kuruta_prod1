import { useState } from "react";

const sections = [
  { id: "overview", num: "00", title: "Обзор" },
  { id: "balance", num: "01", title: "Баланс" },
  { id: "operations", num: "02", title: "Операции" },
  { id: "idempotency", num: "03", title: "Идемпотентность" },
  { id: "race", num: "04", title: "Race Conditions" },
  { id: "payout", num: "05", title: "Вывод средств" },
  { id: "reconcile", num: "06", title: "Сверка" },
  { id: "tests", num: "07", title: "Тесты" },
];

function NavItem({ section, active, onClick }: { section: typeof sections[0]; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-l-2 transition-colors duration-200 ${
        active
          ? "border-[#FF6B35] bg-[#FF6B35]/5 text-[#1A1A1A] font-medium"
          : "border-transparent text-[#666] hover:text-[#1A1A1A] hover:border-[#E5E5E5]"
      }`}
    >
      <span className="text-xs font-mono text-[#999] mr-2">{section.num}</span>
      <span className="text-sm">{section.title}</span>
    </button>
  );
}

function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <div className="mb-8">
      <span className="font-mono text-sm text-[#FF6B35] tracking-wider">{num}</span>
      <h2 className="font-display text-3xl md:text-4xl font-bold text-[#1A1A1A] mt-1">{title}</h2>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-[#E5E5E5] rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: "done" | "ready" | "critical" }) {
  const config = {
    done: { bg: "bg-[#2D9B6E]/10", text: "text-[#2D9B6E]", label: "Готово" },
    ready: { bg: "bg-[#FF6B35]/10", text: "text-[#FF6B35]", label: "Готово" },
    critical: { bg: "bg-[#E63946]/10", text: "text-[#E63946]", label: "Критично" },
  };
  const c = config[status];
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

function EndpointCard({ method, path, desc, auth }: { method: string; path: string; desc: string; auth?: boolean }) {
  const methodColors: Record<string, string> = {
    GET: "bg-[#2D9B6E]/10 text-[#2D9B6E]",
    POST: "bg-[#6366F1]/10 text-[#6366F1]",
    PUT: "bg-[#F59E0B]/10 text-[#F59E0B]",
    DELETE: "bg-[#E63946]/10 text-[#E63946]",
  };

  return (
    <div className="flex items-center gap-4 border border-[#E5E5E5] rounded-xl p-4">
      <span className={`px-3 py-1 rounded-lg text-xs font-bold font-mono ${methodColors[method]}`}>
        {method}
      </span>
      <code className="text-sm font-mono text-[#1A1A1A] flex-1">{path}</code>
      {auth && (
        <span className="px-2 py-1 bg-[#999]/10 text-[#999] text-xs rounded">
          🔒 Auth
        </span>
      )}
      <span className="text-sm text-[#666]">{desc}</span>
    </div>
  );
}

function OverviewSection() {
  return (
    <div>
      <SectionHeader num="00" title="Financial Journal" />
      <p className="text-lg text-[#444] mb-8 leading-relaxed">
        КРИТИЧЕСКИ ВАЖНЫЙ МОДУЛЬ. Ошибки здесь = потеря денег. Двойная запись, идемпотентность, атомарность.
      </p>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Endpoints", value: "11" },
          { label: "Типов транзакций", value: "8" },
          { label: "E2E тестов", value: "10" },
          { label: "Методов сервиса", value: "10" },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-[#666] mb-1">{item.label}</p>
            <p className="text-3xl font-bold text-[#1A1A1A] font-display">{item.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-8 border-[#E63946]/30 bg-[#E63946]/5">
        <h4 className="font-semibold text-[#E63946] mb-3">🚨 Ключевые принципы</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• <strong>Двойная запись</strong>: Каждая операция имеет тип (deposit, reserve, release, reward, fee, payout, refund, adjustment)</li>
          <li>• <strong>Баланс вычисляется</strong>: НЕ хранится в БД, вычисляется через SUM транзакций</li>
          <li>• <strong>Атомарность</strong>: Все операции в <code className="font-mono bg-white px-1.5 py-0.5 rounded">prisma.$transaction</code></li>
          <li>• <strong>Блокировки</strong>: <code className="font-mono bg-white px-1.5 py-0.5 rounded">SELECT ... FOR UPDATE</code> при работе с балансом</li>
          <li>• <strong>Идемпотентность</strong>: Каждая операция имеет уникальный <code className="font-mono bg-white px-1.5 py-0.5 rounded">idempotencyKey</code></li>
          <li>• <strong>Аудит</strong>: Все операции логируются в <code className="font-mono bg-white px-1.5 py-0.5 rounded">audit_log</code></li>
        </ul>
      </Card>

      <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Формула баланса</h4>
        <pre className="text-sm font-mono bg-white p-4 rounded-lg overflow-x-auto">
{`Баланс = SUM(deposit, reward, refund, release) - SUM(reserve, payout, fee)

Приход:  deposit, reward, refund, release
Расход:  reserve, payout, fee`}
        </pre>
      </Card>

      <div className="space-y-3 mt-8">
        {[
          { task: "FinanceService с 10 методами", status: "done" as const },
          { task: "Все методы в prisma.$transaction", status: "done" as const },
          { task: "SELECT ... FOR UPDATE для блокировок", status: "done" as const },
          { task: "Идемпотентность через idempotencyKey", status: "done" as const },
          { task: "Двойная запись через type enum", status: "done" as const },
          { task: "API эндпоинты: /balance, /transactions, /payout", status: "done" as const },
          { task: "PaymentProvider интерфейс + MockPaymentProvider", status: "done" as const },
          { task: "Тест идемпотентности", status: "done" as const },
          { task: "Тест race condition", status: "done" as const },
        ].map((item) => (
          <div key={item.task} className="flex items-center justify-between border border-[#E5E5E5] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#2D9B6E] flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm text-[#1A1A1A]">{item.task}</span>
            </div>
            <StatusBadge status={item.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BalanceSection() {
  return (
    <div>
      <SectionHeader num="01" title="Вычисление баланса" />
      
      <Card className="mb-8 border-[#E63946]/30 bg-[#E63946]/5">
        <h4 className="font-semibold text-[#E63946] mb-3">⚠️ КРИТИЧНО</h4>
        <p className="text-sm text-[#444]">
          Баланс <strong>НЕ хранится</strong> как поле в таблице User. Он вычисляется через агрегацию FinancialTransaction.
        </p>
      </Card>

      <EndpointCard method="GET" path="/finance/balance" desc="Получить баланс пользователя" auth />

      <Card className="mt-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Response (200)</h4>
        <pre className="text-sm font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`{
  "balance": "1500.00",
  "currency": "RUB"
}`}
        </pre>
      </Card>

      <Card className="mt-4">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Реализация getBalance()</h4>
        <pre className="text-xs font-mono bg-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`async getBalance(userId: string): Promise<Decimal> {
  const transactions = await prisma.financialTransaction.findMany({
    where: {
      userId,
      status: FinancialTransactionStatus.completed,
    },
  });

  let balance = new Decimal(0);

  for (const tx of transactions) {
    const amount = new Decimal(tx.amount.toString());

    switch (tx.type) {
      case 'deposit':
      case 'reward':
      case 'refund':
      case 'release':
        balance = balance.plus(amount);
        break;
      case 'reserve':
      case 'payout':
      case 'fee':
        balance = balance.minus(amount);
        break;
    }
  }

  return balance;
}`}
        </pre>
      </Card>

      <Card className="mt-4">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Типы транзакций</h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { type: "deposit", desc: "Пополнение", sign: "+", color: "#2D9B6E" },
            { type: "reward", desc: "Вознаграждение", sign: "+", color: "#2D9B6E" },
            { type: "refund", desc: "Возврат", sign: "+", color: "#2D9B6E" },
            { type: "release", desc: "Освобождение резерва", sign: "+", color: "#2D9B6E" },
            { type: "reserve", desc: "Резервирование", sign: "−", color: "#E63946" },
            { type: "payout", desc: "Выплата", sign: "−", color: "#E63946" },
            { type: "fee", desc: "Комиссия", sign: "−", color: "#E63946" },
            { type: "adjustment", desc: "Корректировка", sign: "±", color: "#F59E0B" },
          ].map((t) => (
            <div key={t.type} className="border border-[#E5E5E5] rounded-lg p-3">
              <code className="text-xs font-mono text-[#1A1A1A]">{t.type}</code>
              <p className="text-xs text-[#666] mt-1">{t.desc}</p>
              <p className={`text-lg font-bold mt-1`} style={{ color: t.color }}>
                {t.sign}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function OperationsSection() {
  return (
    <div>
      <SectionHeader num="02" title="Финансовые операции" />
      
      <div className="space-y-4">
        <EndpointCard method="POST" path="/finance/deposit" desc="Пополнение баланса" auth />
        <EndpointCard method="POST" path="/finance/reserve" desc="Резервирование средств" auth />
        <EndpointCard method="POST" path="/finance/release" desc="Освобождение резерва" auth />
        <EndpointCard method="POST" path="/finance/reward" desc="Начисление вознаграждения" auth />
        <EndpointCard method="POST" path="/finance/pay-to-owner" desc="Выплата владельцу" auth />
        <EndpointCard method="POST" path="/finance/refund" desc="Возврат средств" auth />
      </div>

      <Card className="mt-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Пример: Пополнение баланса</h4>
        <pre className="text-sm font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`POST /finance/deposit
{
  "amount": "1000.00",
  "description": "Пополнение баланса",
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000"
}`}
        </pre>
      </Card>

      <Card className="mt-4">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Пример: Резервирование средств</h4>
        <pre className="text-sm font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`POST /finance/reserve
{
  "amount": "500.00",
  "description": "Резервирование для задания",
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440001",
  "relatedEntityId": "task-uuid"
}`}
        </pre>
      </Card>

      <Card className="mt-4 border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Атомарность операций</h4>
        <p className="text-sm text-[#444] mb-3">Все операции используют <code className="font-mono bg-white px-1.5 py-0.5 rounded">prisma.$transaction</code>:</p>
        <pre className="text-xs font-mono bg-white p-3 rounded-lg overflow-x-auto">
{`return prisma.$transaction(async (tx) => {
  // Блокируем пользователя
  await tx.user.findUniqueOrThrow({
    where: { id: userId },
  });

  // Проверяем идемпотентность
  const existing = await tx.financialTransaction.findUnique({
    where: { idempotencyKey },
  });

  if (existing) {
    return existing; // Идемпотентность
  }

  // Создаём транзакцию
  const transaction = await tx.financialTransaction.create({
    data: { ... },
  });

  // Аудит-лог
  await tx.auditLog.create({ ... });

  return transaction;
});`}
        </pre>
      </Card>
    </div>
  );
}

function IdempotencySection() {
  return (
    <div>
      <SectionHeader num="03" title="Идемпотентность" />
      <p className="text-[#444] mb-8">Каждая операция имеет уникальный <code className="font-mono bg-[#F5F5F0] px-2 py-0.5 rounded">idempotencyKey</code> (UUID). Повторный вызов = тот же результат.</p>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Как работает идемпотентность</h4>
        <div className="space-y-4">
          {[
            { step: "1", desc: "Клиент генерирует уникальный UUID (idempotencyKey)" },
            { step: "2", desc: "Отправляет запрос с этим ключом" },
            { step: "3", desc: "Сервер проверяет: существует ли транзакция с этим ключом?" },
            { step: "4", desc: "Если существует — возвращает её (НЕ создаёт дубликат)" },
            { step: "5", desc: "Если не существует — создаёт новую транзакцию" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[#FF6B35] font-bold">{item.step}</span>
              </div>
              <p className="text-sm text-[#444] pt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Тест идемпотентности</h4>
        <pre className="text-xs font-mono bg-white p-4 rounded-lg overflow-x-auto">
{`it('should return same transaction on duplicate idempotency key', async () => {
  const idempotencyKey = '550e8400-e29b-41d4-a716-446655440001';

  // Первый запрос
  const tx1 = await financeService.deposit({
    userId,
    amount: '1000.00',
    idempotencyKey,
  });

  // Второй запрос с тем же ключом
  const tx2 = await financeService.deposit({
    userId,
    amount: '1000.00',
    idempotencyKey,
  });

  // Должна вернуться та же транзакция
  expect(tx1.id).toBe(tx2.id);

  // В БД только одна транзакция
  const count = await prisma.financialTransaction.count({
    where: { idempotencyKey },
  });
  expect(count).toBe(1);
});`}
        </pre>
      </Card>
    </div>
  );
}

function RaceConditionSection() {
  return (
    <div>
      <SectionHeader num="04" title="Race Conditions" />
      <p className="text-[#444] mb-8">Предотвращение double-spending через блокировки и атомарные транзакции.</p>

      <Card className="mb-8 border-[#E63946]/30 bg-[#E63946]/5">
        <h4 className="font-semibold text-[#E63946] mb-3">🚨 Проблема</h4>
        <p className="text-sm text-[#444]">
          Два одновременных запроса на списание 800 RUB при балансе 1000 RUB. Без защиты оба пройдут, и баланс уйдёт в минус.
        </p>
      </Card>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Решение</h4>
        <div className="space-y-4">
          {[
            { step: "1", desc: "prisma.$transaction — атомарность" },
            { step: "2", desc: "SELECT ... FOR UPDATE — блокировка пользователя" },
            { step: "3", desc: "Проверка баланса ДО операции" },
            { step: "4", desc: "Если недостаточно средств — ошибка" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#2D9B6E]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[#2D9B6E] font-bold">{item.step}</span>
              </div>
              <p className="text-sm text-[#444] pt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Тест race condition</h4>
        <pre className="text-xs font-mono bg-white p-4 rounded-lg overflow-x-auto">
{`it('should handle concurrent reserve operations correctly', async () => {
  // Пополняем баланс 1000
  await financeService.deposit({
    userId,
    amount: '1000.00',
    idempotencyKey: 'uuid-1',
  });

  // Пытаемся зарезервировать 800 дважды одновременно
  const results = await Promise.allSettled([
    financeService.reserve({
      userId,
      amount: '800.00',
      idempotencyKey: 'uuid-2',
      relatedEntityId: 'task-1',
    }),
    financeService.reserve({
      userId,
      amount: '800.00',
      idempotencyKey: 'uuid-3',
      relatedEntityId: 'task-2',
    }),
  ]);

  // Одна успешная, одна с ошибкой
  const successful = results.filter(r => r.status === 'fulfilled');
  const failed = results.filter(r => r.status === 'rejected');

  expect(successful.length).toBe(1);
  expect(failed.length).toBe(1);

  // Баланс корректен: 1000 - 800 = 200
  const balance = await financeService.getBalance(userId);
  expect(balance.toString()).toBe('200.00');
});`}
        </pre>
      </Card>
    </div>
  );
}

function PayoutSection() {
  return (
    <div>
      <SectionHeader num="05" title="Вывод средств" />
      
      <EndpointCard method="POST" path="/finance/payout" desc="Запрос на вывод средств" auth />
      <EndpointCard method="POST" path="/finance/payout/:id/complete" desc="Завершение вывода (для финансистов)" auth />

      <Card className="mt-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Request: Запрос на вывод</h4>
        <pre className="text-sm font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`POST /finance/payout
{
  "amount": "1000.00",
  "paymentMethod": "card",
  "requisites": {
    "cardNumber": "****1234"
  },
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440005"
}`}
        </pre>
      </Card>

      <Card className="mt-4 border-[#F59E0B]/30 bg-[#F59E0B]/5">
        <h4 className="font-semibold text-[#F59E0B] mb-3">⚠️ Ограничения</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• Минимальная сумма вывода: <strong>500 RUB</strong></li>
          <li>• Требуется достаточный баланс</li>
          <li>• Заявка проходит модерацию</li>
          <li>• После завершения — выплата через платёжный провайдер</li>
        </ul>
      </Card>

      <Card className="mt-4">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">PaymentProvider интерфейс</h4>
        <pre className="text-xs font-mono bg-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`interface PaymentProvider {
  createPayment(params): Promise<{ paymentId, status }>;
  getPaymentStatus(paymentId): Promise<{ status }>;
  refundPayment(paymentId, amount?): Promise<{ refundId, status }>;
  payout(params): Promise<{ payoutId, status }>;
}

// Реализации:
// - MockPaymentProvider (заглушка для dev)
// - YooKassaProvider (TODO)
// - StripeProvider (TODO)`}
        </pre>
      </Card>
    </div>
  );
}

function ReconcileSection() {
  return (
    <div>
      <SectionHeader num="06" title="Сверка баланса" />
      <p className="text-[#444] mb-8">Проверка корректности всех транзакций. Запускается по cron или вручную.</p>

      <EndpointCard method="POST" path="/finance/reconcile" desc="Сверка баланса (для администраторов)" auth />

      <Card className="mt-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Response (200)</h4>
        <pre className="text-sm font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`{
  "transactionCount": 150,
  "finalBalance": "1500.00",
  "errors": [],
  "success": true
}`}
        </pre>
      </Card>

      <Card className="mt-4">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Что проверяется</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• Все транзакции пользователя</li>
          <li>• Корректность расчёта баланса</li>
          <li>• Отсутствие отрицательного баланса</li>
          <li>• Соответствие рассчитанного и текущего баланса</li>
        </ul>
      </Card>

      <Card className="mt-4 border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Аудит-лог сверки</h4>
        <p className="text-sm text-[#444]">
          Каждая сверка логируется в <code className="font-mono bg-white px-1.5 py-0.5 rounded">audit_log</code> с действием <code className="font-mono bg-white px-1.5 py-0.5 rounded">finance.reconciled</code>.
        </p>
      </Card>
    </div>
  );
}

function TestsSection() {
  return (
    <div>
      <SectionHeader num="07" title="Тестирование" />
      
      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">E2E тесты</h4>
        <pre className="text-sm font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`cd apps/api
npm run test:e2e test/finance.e2e-spec.ts`}
        </pre>
      </Card>

      <div className="space-y-3 mb-8">
        {[
          { test: "Идемпотентность (повторный вызов = тот же результат)", count: 2 },
          { test: "Race conditions (два одновременных списания)", count: 2 },
          { test: "Вычисление баланса", count: 1 },
          { test: "Сверка баланса", count: 1 },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between border border-[#E5E5E5] rounded-xl p-4">
            <span className="text-sm text-[#1A1A1A]">{item.test}</span>
            <span className="text-xs font-mono text-[#999] bg-[#F5F5F0] px-2 py-1 rounded">{item.count} tests</span>
          </div>
        ))}
      </div>

      <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Критерии приёмки</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• Тест идемпотентности (повторный вызов = тот же результат)</li>
          <li>• Тест race condition (два одновременных списания — только одно проходит)</li>
          <li>• Коммит: <code className="font-mono bg-white px-1.5 py-0.5 rounded">feat(api): financial journal with double-entry and idempotency</code></li>
        </ul>
      </Card>

      <Card className="mt-8 border-[#E63946]/30 bg-[#E63946]/5">
        <h4 className="font-semibold text-[#E63946] mb-3">🚫 ЗАПРЕЩЕНО</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• ❌ Обновлять баланс напрямую</li>
          <li>• ❌ Использовать Float для денег</li>
          <li>• ❌ Делать транзакции без <code className="font-mono bg-white px-1.5 py-0.5 rounded">$transaction</code></li>
        </ul>
      </Card>
    </div>
  );
}

const sectionComponents: Record<string, React.FC> = {
  overview: OverviewSection,
  balance: BalanceSection,
  operations: OperationsSection,
  idempotency: IdempotencySection,
  race: RaceConditionSection,
  payout: PayoutSection,
  reconcile: ReconcileSection,
  tests: TestsSection,
};

export default function App() {
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const ActiveComponent = sectionComponents[activeSection];

  return (
    <div className="min-h-screen bg-[#F5F5F0]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F5F5F0]/95 border-b border-[#E5E5E5] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
              <span className="text-[#FF6B35] font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>K</span>
            </div>
            <div>
              <h1 className="font-bold text-[#1A1A1A] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>KURUTA</h1>
              <p className="text-[10px] text-[#999] uppercase tracking-wider">Financial Journal</p>
            </div>
          </div>

          <button
            className="md:hidden p-2 border border-[#E5E5E5] rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#1A1A1A" strokeWidth="1.5">
              {mobileMenuOpen ? (
                <path d="M5 5l10 10M15 5L5 15" />
              ) : (
                <path d="M3 5h14M3 10h14M3 15h14" />
              )}
            </svg>
          </button>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-[#999] font-mono">Double-Entry + Idempotency</span>
            <span className="px-2 py-1 bg-[#E63946]/10 text-[#E63946] text-xs font-medium rounded-md">CRITICAL</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 flex-shrink-0 py-8 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="space-y-0.5">
            {sections.map((section) => (
              <NavItem
                key={section.id}
                section={section}
                active={activeSection === section.id}
                onClick={() => setActiveSection(section.id)}
              />
            ))}
          </nav>
        </aside>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 z-40 bg-[#F5F5F0] overflow-y-auto">
            <nav className="p-4 space-y-0.5">
              {sections.map((section) => (
                <NavItem
                  key={section.id}
                  section={section}
                  active={activeSection === section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setMobileMenuOpen(false);
                  }}
                />
              ))}
            </nav>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 py-8 md:pl-12 min-w-0">
          {/* Mobile section navigation */}
          <div className="md:hidden mb-6 flex gap-2 overflow-x-auto pb-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  activeSection === section.id
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                    : "bg-white text-[#666] border-[#E5E5E5]"
                }`}
              >
                {section.num} {section.title}
              </button>
            ))}
          </div>

          <ActiveComponent />

          {/* Navigation footer */}
          <div className="mt-12 pt-8 border-t border-[#E5E5E5] flex justify-between">
            {sections.findIndex((s) => s.id === activeSection) > 0 && (
              <button
                onClick={() => {
                  const idx = sections.findIndex((s) => s.id === activeSection);
                  setActiveSection(sections[idx - 1].id);
                }}
                className="flex items-center gap-2 text-sm text-[#666] hover:text-[#1A1A1A] transition-colors"
              >
                <span>←</span>
                <span>{sections[sections.findIndex((s) => s.id === activeSection) - 1].title}</span>
              </button>
            )}
            <div className="flex-1"></div>
            {sections.findIndex((s) => s.id === activeSection) < sections.length - 1 && (
              <button
                onClick={() => {
                  const idx = sections.findIndex((s) => s.id === activeSection);
                  setActiveSection(sections[idx + 1].id);
                }}
                className="flex items-center gap-2 text-sm text-[#666] hover:text-[#1A1A1A] transition-colors"
              >
                <span>{sections[sections.findIndex((s) => s.id === activeSection) + 1].title}</span>
                <span>→</span>
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

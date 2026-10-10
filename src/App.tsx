import { useState } from "react";

const sections = [
  { id: "overview", num: "00", title: "Обзор" },
  { id: "moderation", num: "01", title: "Модерация" },
  { id: "disputes", num: "02", title: "Споры" },
  { id: "anti-fraud", num: "03", title: "Антифрод" },
  { id: "verification", num: "04", title: "Верификация" },
  { id: "tests", num: "05", title: "Тесты" },
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

function OverviewSection() {
  return (
    <div>
      <SectionHeader num="00" title="Moderation, Disputes & Anti-Fraud" />
      <p className="text-lg text-[#444] mb-8 leading-relaxed">
        Модуль реализует систему модерации, разрешения споров и антифрод-защиты для платформы KURUTA.
      </p>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Endpoints", value: "15" },
          { label: "Cron задач", value: "5" },
          { label: "E2E тестов", value: "8" },
          { label: "Сущностей", value: "3" },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-[#666] mb-1">{item.label}</p>
            <p className="text-3xl font-bold text-[#1A1A1A] font-display">{item.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-8 border-[#E63946]/30 bg-[#E63946]/5">
        <h4 className="font-semibold text-[#E63946] mb-3">🚨 Ключевые особенности</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• <strong>Универсальная очередь модерации</strong> для всех типов сущностей</li>
          <li>• <strong>Система споров</strong> с блокировкой сделок и распределением денег</li>
          <li>• <strong>Антифрод-система</strong> с автоматическими cron-проверками</li>
          <li>• <strong>Повторная верификация</strong> амбассадоров раз в 30 дней</li>
          <li>• <strong>Полный аудит</strong> всех действий модераторов</li>
        </ul>
      </Card>

      <div className="space-y-3">
        {[
          { task: "Универсальная очередь ModerationQueue", status: "done" as const },
          { task: "Аудит действий модератора", status: "done" as const },
          { task: "Система споров с блокировкой сделок", status: "done" as const },
          { task: "Распределение денег через FinanceService", status: "done" as const },
          { task: "Антифрод-сигналы (6 типов)", status: "done" as const },
          { task: "Cron-задачи для антифрода", status: "done" as const },
          { task: "Ручная проверка сигналов модератором", status: "done" as const },
          { task: "Повторная верификация амбассадоров", status: "done" as const },
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

function ModerationSection() {
  return (
    <div>
      <SectionHeader num="01" title="Модерация" />
      
      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Универсальная очередь</h4>
        <p className="text-sm text-[#666] mb-4">Одна очередь для всех типов сущностей:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { type: "campaign", color: "#FF6B35" },
            { type: "task", color: "#6366F1" },
            { type: "ad_slot", color: "#2D9B6E" },
            { type: "deal", color: "#F59E0B" },
            { type: "dispute", color: "#E63946" },
            { type: "ambassador_verification", color: "#999" },
            { type: "anti_fraud", color: "#EC4899" },
          ].map((item) => (
            <span
              key={item.type}
              className="px-3 py-1.5 rounded-lg text-xs font-mono border"
              style={{
                backgroundColor: `${item.color}15`,
                borderColor: `${item.color}40`,
                color: item.color,
              }}
            >
              {item.type}
            </span>
          ))}
        </div>
      </Card>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">API Endpoints</h4>
        <div className="space-y-2">
          {[
            { method: "GET", path: "/moderation/queue", desc: "Получить очередь" },
            { method: "POST", path: "/moderation/queue/:id/assign", desc: "Назначить модератора" },
            { method: "POST", path: "/moderation/queue/:id/approve", desc: "Одобрить" },
            { method: "POST", path: "/moderation/queue/:id/reject", desc: "Отклонить" },
            { method: "GET", path: "/moderation/stats", desc: "Статистика модератора" },
          ].map((item) => (
            <div key={item.path} className="flex items-center gap-3 border border-[#E5E5E5] rounded-lg p-3">
              <span className={`px-2 py-1 rounded text-xs font-bold font-mono ${
                item.method === "GET" ? "bg-[#2D9B6E]/10 text-[#2D9B6E]" : "bg-[#6366F1]/10 text-[#6366F1]"
              }`}>
                {item.method}
              </span>
              <code className="text-sm font-mono text-[#1A1A1A] flex-1">{item.path}</code>
              <span className="text-xs text-[#666]">{item.desc}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Аудит действий</h4>
        <p className="text-sm text-[#444] mb-3">Все действия модераторов логируются:</p>
        <pre className="text-xs font-mono bg-white p-3 rounded-lg overflow-x-auto">
{`await prisma.auditLog.create({
   {
    userId: moderatorId,
    action: 'moderation.approved',
    entityType: 'ModerationQueue',
    entityId: queueId,
    after: {
      entityType: queueItem.entityType,
      entityId: queueItem.entityId,
      decision: dto.decision,
    },
  },
});`}
        </pre>
      </Card>
    </div>
  );
}

function DisputesSection() {
  return (
    <div>
      <SectionHeader num="02" title="Споры" />
      
      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Жизненный цикл спора</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { state: "opened", color: "#F59E0B" },
            { state: "investigating", color: "#6366F1" },
            { state: "resolved_creator", color: "#2D9B6E" },
            { state: "resolved_executor", color: "#2D9B6E" },
            { state: "resolved_partial", color: "#F59E0B" },
            { state: "closed", color: "#999" },
          ].map((item, i) => (
            <div key={item.state} className="flex items-center gap-2">
              <span
                className="px-3 py-1.5 rounded-lg text-xs font-mono border"
                style={{
                  backgroundColor: `${item.color}15`,
                  borderColor: `${item.color}40`,
                  color: item.color,
                }}
              >
                {item.state}
              </span>
              {i < 5 && <span className="text-[#CCC]">→</span>}
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-8 border-[#E63946]/30 bg-[#E63946]/5">
        <h4 className="font-semibold text-[#E63946] mb-3">🚨 Блокировка сделки</h4>
        <p className="text-sm text-[#444] mb-3">При открытии спора связанная сущность блокируется:</p>
        <pre className="text-xs font-mono bg-white p-3 rounded-lg overflow-x-auto">
{`// Блокируем сделку/задачу
await tx.deal.update({
  where: { id: dto.entityId },
   { status: 'disputed' },
});

// Или для задачи
await tx.task.update({
  where: { id: dto.entityId },
   { status: 'disputed' },
});`}
        </pre>
      </Card>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Распределение денег</h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border border-[#2D9B6E]/30 bg-[#2D9B6E]/5 rounded-lg p-4">
            <h5 className="font-semibold text-[#2D9B6E] mb-2">В пользу креатора</h5>
            <p className="text-xs text-[#444]">100% возврат креатору</p>
            <p className="text-xs text-[#666] mt-1">Исполнитель: 0%</p>
          </div>
          <div className="border border-[#6366F1]/30 bg-[#6366F1]/5 rounded-lg p-4">
            <h5 className="font-semibold text-[#6366F1] mb-2">В пользу исполнителя</h5>
            <p className="text-xs text-[#444]">100% выплата исполнителю</p>
            <p className="text-xs text-[#666] mt-1">Креатор: 0%</p>
          </div>
          <div className="border border-[#F59E0B]/30 bg-[#F59E0B]/5 rounded-lg p-4">
            <h5 className="font-semibold text-[#F59E0B] mb-2">Частичный возврат</h5>
            <p className="text-xs text-[#444]">Распределение по %</p>
            <p className="text-xs text-[#666] mt-1">Например: 50/50</p>
          </div>
        </div>
      </Card>

      <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Интеграция с FinanceService</h4>
        <pre className="text-xs font-mono bg-white p-3 rounded-lg overflow-x-auto">
{`// Возврат креатору
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
});`}
        </pre>
      </Card>
    </div>
  );
}

function AntiFraudSection() {
  return (
    <div>
      <SectionHeader num="03" title="Антифрод" />
      
      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Типы сигналов</h4>
        <div className="space-y-2">
          {[
            { type: "duplicate_device_fingerprint", desc: "Одинаковые устройства", severity: "high" },
            { type: "duplicate_payout_requisites", desc: "Одинаковые реквизиты", severity: "critical" },
            { type: "suspicious_fast_completion", desc: "Быстрое выполнение", severity: "medium" },
            { type: "duplicate_proof_screenshots", desc: "Дубликаты скриншотов", severity: "high" },
            { type: "sudden_audience_growth", desc: "Резкий рост аудитории", severity: "medium" },
            { type: "unusual_activity_pattern", desc: "Необычные паттерны", severity: "low" },
          ].map((item) => (
            <div key={item.type} className="flex items-center gap-3 border border-[#E5E5E5] rounded-lg p-3">
              <code className="text-xs font-mono text-[#1A1A1A] flex-1">{item.type}</code>
              <span className="text-xs text-[#666]">{item.desc}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                item.severity === "critical" ? "bg-[#E63946]/10 text-[#E63946]" :
                item.severity === "high" ? "bg-[#FF6B35]/10 text-[#FF6B35]" :
                item.severity === "medium" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                "bg-[#999]/10 text-[#999]"
              }`}>
                {item.severity}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Cron-задачи</h4>
        <div className="space-y-2">
          {[
            { task: "check-duplicate-devices", schedule: "Каждые 6 часов" },
            { task: "check-fast-completions", schedule: "Каждые 4 часа" },
            { task: "check-duplicate-screenshots", schedule: "Каждые 8 часов" },
            { task: "check-duplicate-requisites", schedule: "Раз в день" },
          ].map((item) => (
            <div key={item.task} className="flex items-center gap-3 border border-[#E5E5E5] rounded-lg p-3">
              <code className="text-xs font-mono text-[#1A1A1A] flex-1">{item.task}</code>
              <span className="text-xs text-[#666]">{item.schedule}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Ручная проверка</h4>
        <p className="text-sm text-[#444] mb-3">Сигналы не блокируют автоматически, а отправляются на ручную проверку модератором:</p>
        <pre className="text-xs font-mono bg-white p-3 rounded-lg overflow-x-auto">
{`// Создаём сигнал
await this.createSignal({
  type: 'duplicate_device_fingerprint',
  userId,
  severity: 'high',
  title: 'Duplicate device fingerprint detected',
  description: \`User \${userId} shares device...\`,
  meta { userAgent, ip, relatedUserIds },
});

// Добавляем в очередь модерации
await prisma.moderationQueue.create({
   {
    entityType: 'anti_fraud',
    entityId: signal.id,
    status: 'pending',
    priority: 15,
  },
});`}
        </pre>
      </Card>
    </div>
  );
}

function VerificationSection() {
  return (
    <div>
      <SectionHeader num="04" title="Повторная верификация" />
      
      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Cron-задача</h4>
        <p className="text-sm text-[#666] mb-4">Запускается раз в 30 дней (первый день каждого месяца):</p>
        <pre className="text-xs font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`@Cron('0 0 1 * *') // Первый день каждого месяца
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
}`}
        </pre>
      </Card>

      <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Логика проверки</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• Проверяется активность за последние 60 дней</li>
          <li>• Если нет выполненных заданий — требуется повторная верификация</li>
          <li>• Создаётся заявка в <code className="font-mono bg-white px-1.5 py-0.5 rounded">AmbassadorVerificationRequest</code></li>
          <li>• Добавляется в очередь модерации</li>
          <li>• Амбассадор получает уведомление</li>
        </ul>
      </Card>
    </div>
  );
}

function TestsSection() {
  return (
    <div>
      <SectionHeader num="05" title="Тестирование" />
      
      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">E2E тесты</h4>
        <pre className="text-sm font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`cd apps/api
npm run test:e2e test/disputes.e2e-spec.ts`}
        </pre>
      </Card>

      <div className="space-y-3 mb-8">
        {[
          { test: "Открытие спора", count: 2 },
          { test: "Разрешение спора (полный возврат)", count: 2 },
          { test: "Разрешение спора (частичный возврат)", count: 2 },
          { test: "Контроль доступа", count: 2 },
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
          <li>• E2E тест: открытие → решение → распределение денег</li>
          <li>• Коммит: <code className="font-mono bg-white px-1.5 py-0.5 rounded">feat(api): moderation, disputes, anti-fraud</code></li>
        </ul>
      </Card>

      <Card className="mt-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Тест распределения денег</h4>
        <pre className="text-xs font-mono bg-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`it('Should resolve dispute with partial refund', async () => {
  // Открываем спор
  const openResponse = await request(app.getHttpServer())
    .post('/api/v1/disputes')
    .send({
      entityType: 'task',
      entityId: taskId,
      reason: 'Partial completion',
    })
    .expect(201);

  // Разрешаем с частичным возвратом 50%
  const resolveResponse = await request(app.getHttpServer())
    .post(\`/api/v1/disputes/\${disputeId}/resolve\`)
    .send({
      resolution: 'partial_refund',
      refundPercentage: 50,
      comment: 'Task partially completed',
    })
    .expect(200);

  expect(resolveResponse.body.distribution.creatorRefund).toBe(500);
  expect(resolveResponse.body.distribution.executorPayout).toBe(500);
});`}
        </pre>
      </Card>
    </div>
  );
}

const sectionComponents: Record<string, React.FC> = {
  overview: OverviewSection,
  moderation: ModerationSection,
  disputes: DisputesSection,
  "anti-fraud": AntiFraudSection,
  verification: VerificationSection,
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
              <p className="text-[10px] text-[#999] uppercase tracking-wider">Moderation & Disputes</p>
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
            <span className="text-xs text-[#999] font-mono">Anti-Fraud + Disputes</span>
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

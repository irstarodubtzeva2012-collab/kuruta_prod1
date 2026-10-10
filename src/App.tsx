import { useState } from "react";

const sections = [
  { id: "overview", num: "00", title: "Обзор" },
  { id: "marketplace", num: "01", title: "Единый маркетплейс" },
  { id: "commission", num: "02", title: "Комиссия" },
  { id: "booking", num: "03", title: "Бронирование" },
  { id: "repurchase", num: "04", title: "Повторная покупка" },
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
      <SectionHeader num="00" title="Ad Slots & Deals" />
      <p className="text-lg text-[#444] mb-8 leading-relaxed">
        Модуль рекламных мест и сделок с логикой Единого маркетплейса. Направление B KURUTA.
      </p>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Endpoints", value: "12" },
          { label: "Комиссия", value: "10%" },
          { label: "E2E тестов", value: "11" },
          { label: "FSM состояний", value: "2" },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-[#666] mb-1">{item.label}</p>
            <p className="text-3xl font-bold text-[#1A1A1A] font-display">{item.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-8 border-[#E63946]/30 bg-[#E63946]/5">
        <h4 className="font-semibold text-[#E63946] mb-3">🚨 КРИТИЧНО: Единый маркетплейс</h4>
        <p className="text-sm text-[#444] mb-3">
          Владелец площадки, переключившись в роль Креатора, видит ОБЩИЙ каталог. При этом его собственные рекламные места <strong>исключаются из выдачи</strong>, чтобы он не покупал у себя.
        </p>
        <pre className="text-xs font-mono bg-white p-3 rounded-lg overflow-x-auto">
{`GET /ad-slots/catalog
Если пользователь = владелец → исключить его слоты из выдачи
Если пользователь = креатор → видит все слоты`}
        </pre>
      </Card>

      <div className="space-y-3">
        {[
          { task: "CRUD рекламных мест для Владельца", status: "done" as const },
          { task: "Модерация рекламных мест", status: "done" as const },
          { task: "Публичный каталог с фильтрами", status: "done" as const },
          { task: "Бронирование с SELECT FOR UPDATE", status: "done" as const },
          { task: "Оплата через FinanceService", status: "done" as const },
          { task: "Подтверждение выполнения", status: "done" as const },
          { task: "Модерация сделок", status: "done" as const },
          { task: "Комиссия 10% через FinanceService.payToOwner()", status: "done" as const },
          { task: "Повторная покупка у того же владельца", status: "done" as const },
          { task: "Единый маркетплейс (исключение своих слотов)", status: "done" as const },
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

function MarketplaceSection() {
  return (
    <div>
      <SectionHeader num="01" title="Единый маркетплейс" />
      
      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Логика фильтрации</h4>
        <pre className="text-xs font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`async getCatalog(userId: string | null, filters?: CatalogFilterDto) {
  const where: Prisma.AdSlotWhereInput = {
    status: AdSlotStatus.published,
  };

  // КРИТИЧНО: Если пользователь авторизован
  if (userId) {
    // Проверяем, является ли пользователь владельцем
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

  // Применяем остальные фильтры...
}`}
        </pre>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
          <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Владелец в роли Креатора</h4>
          <ul className="text-sm text-[#444] space-y-1.5">
            <li>• Видит общий каталог</li>
            <li>• Его слоты <strong>исключены</strong></li>
            <li>• Не может купить у себя</li>
            <li>• Может купить у других владельцев</li>
          </ul>
        </Card>

        <Card className="border-[#6366F1]/30 bg-[#6366F1]/5">
          <h4 className="font-semibold text-[#6366F1] mb-3">✓ Обычный Креатор</h4>
          <ul className="text-sm text-[#444] space-y-1.5">
            <li>• Видит все опубликованные слоты</li>
            <li>• Может бронировать любые слоты</li>
            <li>• Не является владельцем</li>
          </ul>
        </Card>
      </div>

      <Card className="mt-8 border-[#E63946]/30 bg-[#E63946]/5">
        <h4 className="font-semibold text-[#E63946] mb-3">🚫 Защита от самопокупки</h4>
        <pre className="text-xs font-mono bg-white p-3 rounded-lg overflow-x-auto">
{`async bookSlot(buyerId: string, adSlotId: string, dto: BookSlotDto) {
  const adSlot = await prisma.adSlot.findUnique({
    where: { id: adSlotId },
  });

  // Владелец не может покупать у себя
  if (adSlot.ownerId === buyerId) {
    throw new ForbiddenException('You cannot book your own ad slot');
  }

  // ... остальная логика
}`}
        </pre>
      </Card>
    </div>
  );
}

function CommissionSection() {
  return (
    <div>
      <SectionHeader num="02" title="Комиссия платформы" />
      
      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Формула</h4>
        <pre className="text-sm font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`Base Price (X) = цена, указанная владельцем
Commission = X * 10%
Total Amount = X + Commission

Владелец получает: X
Платформа получает: Commission (10%)
Креатор платит: Total Amount (X + 10%)`}
        </pre>
      </Card>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Пример</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-[#E5E5E5] rounded-lg p-4">
            <p className="text-xs text-[#666] mb-1">Владелец указывает</p>
            <p className="text-2xl font-bold text-[#1A1A1A] font-display">5000 ₽</p>
          </div>
          <div className="border border-[#FF6B35]/30 bg-[#FF6B35]/5 rounded-lg p-4">
            <p className="text-xs text-[#666] mb-1">Комиссия (10%)</p>
            <p className="text-2xl font-bold text-[#FF6B35] font-display">500 ₽</p>
          </div>
          <div className="border border-[#6366F1]/30 bg-[#6366F1]/5 rounded-lg p-4">
            <p className="text-xs text-[#666] mb-1">Креатор платит</p>
            <p className="text-2xl font-bold text-[#6366F1] font-display">5500 ₽</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="border border-[#2D9B6E]/30 bg-[#2D9B6E]/5 rounded-lg p-4">
            <p className="text-xs text-[#666] mb-1">Владелец получает</p>
            <p className="text-2xl font-bold text-[#2D9B6E] font-display">5000 ₽</p>
          </div>
          <div className="border border-[#E63946]/30 bg-[#E63946]/5 rounded-lg p-4">
            <p className="text-xs text-[#666] mb-1">Платформа зарабатывает</p>
            <p className="text-2xl font-bold text-[#E63946] font-display">500 ₽</p>
          </div>
        </div>
      </Card>

      <Card>
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Реализация через FinanceService</h4>
        <pre className="text-xs font-mono bg-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`// При одобрении сделки модератором
const ownerAmount = deal.totalAmount - deal.commission;

await this.financeService.payToOwner({
  ownerId: deal.adSlot.ownerId,
  amount: ownerAmount.toString(),
  description: \`Выплата за рекламное размещение\`,
  idempotencyKey,
  relatedEntityType: 'deal',
  relatedEntityId: dealId,
});`}
        </pre>
      </Card>
    </div>
  );
}

function BookingSection() {
  return (
    <div>
      <SectionHeader num="03" title="Бронирование" />
      
      <Card className="mb-8 border-[#E63946]/30 bg-[#E63946]/5">
        <h4 className="font-semibold text-[#E63946] mb-3">🚨 Защита от двойного бронирования</h4>
        <p className="text-sm text-[#444]">
          Используется <code className="font-mono bg-white px-1.5 py-0.5 rounded">prisma.$transaction</code> для атомарности и предотвращения race conditions.
        </p>
      </Card>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Логика бронирования</h4>
        <pre className="text-xs font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`async bookSlot(buyerId: string, adSlotId: string, dto: BookSlotDto) {
  return prisma.$transaction(async (tx) => {
    // 1. Получаем слот
    const adSlot = await tx.adSlot.findUnique({
      where: { id: adSlotId },
    });

    // 2. Проверяем, что владелец не покупает у себя
    if (adSlot.ownerId === buyerId) {
      throw new ForbiddenException('Cannot book own slot');
    }

    // 3. Проверяем доступность на даты
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
      throw new ConflictException('Slot already booked');
    }

    // 4. Вычисляем стоимость
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const basePrice = adSlot.pricePerDay * days;
    const commission = basePrice * 0.10;
    const totalAmount = basePrice + commission;

    // 5. Создаём сделку
    const deal = await tx.deal.create({
       {
        adSlotId,
        buyerId,
        status: 'created',
        startDate,
        endDate,
        totalAmount,
        commission,
      },
    });

    // 6. Обновляем статус слота
    await tx.adSlot.update({
      where: { id: adSlotId },
       { status: 'booked' },
    });

    return deal;
  });
}`}
        </pre>
      </Card>

      <Card>
        <h4 className="font-semibold text-[#1A1A1A] mb-3">FSM сделки</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { state: "created", color: "#999" },
            { state: "paid", color: "#6366F1" },
            { state: "in_progress", color: "#6366F1" },
            { state: "confirming", color: "#F59E0B" },
            { state: "completed", color: "#2D9B6E" },
            { state: "disputed", color: "#E63946" },
            { state: "cancelled", color: "#E63946" },
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
              {i < 6 && <span className="text-[#CCC]">→</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function RepurchaseSection() {
  return (
    <div>
      <SectionHeader num="04" title="Повторная покупка" />
      <p className="text-[#444] mb-8">Упрощенный эндпоинт для покупки у того же владельца.</p>

      <EndpointCard method="POST" path="/deals/repurchase" desc="Повторная покупка" auth />

      <Card className="mt-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Request</h4>
        <pre className="text-sm font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`POST /deals/repurchase
{
  "previousDealId": "uuid-previous-deal",
  "startDate": "2024-03-01",
  "endDate": "2024-03-02",
  "idempotencyKey": "uuid"
}`}
        </pre>
      </Card>

      <Card className="mt-4">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Логика</h4>
        <pre className="text-xs font-mono bg-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`async repurchase(buyerId: string, dto: RepurchaseDto) {
  // Получаем предыдущую сделку
  const previousDeal = await prisma.deal.findUnique({
    where: { id: dto.previousDealId },
    include: { adSlot: true },
  });

  // Проверяем, что это сделка текущего пользователя
  if (previousDeal.buyerId !== buyerId) {
    throw new ForbiddenException('Can only repurchase own deals');
  }

  // Проверяем, что предыдущая сделка завершена
  if (previousDeal.status !== 'completed') {
    throw new BadRequestException('Can only repurchase completed deals');
  }

  // Бронируем тот же слот с новыми датами
  return this.bookSlot(buyerId, previousDeal.adSlotId, {
    startDate: dto.startDate,
    endDate: dto.endDate,
    contentBrief: previousDeal.contentBrief,
    idempotencyKey: dto.idempotencyKey,
  });
}`}
        </pre>
      </Card>

      <Card className="mt-4 border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Преимущества</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• Не нужно искать слот заново</li>
          <li>• Сохраняются настройки из предыдущей сделки</li>
          <li>• Быстрее для постоянных клиентов</li>
          <li>• Увеличивает LTV (Lifetime Value)</li>
        </ul>
      </Card>
    </div>
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

function TestsSection() {
  return (
    <div>
      <SectionHeader num="05" title="Тестирование" />
      
      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">E2E тесты</h4>
        <pre className="text-sm font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`cd apps/api
npm run test:e2e test/ad-slots.e2e-spec.ts`}
        </pre>
      </Card>

      <div className="space-y-3 mb-8">
        {[
          { test: "Полный цикл: create → publish → book → pay → confirm → moderate → payout", count: 8 },
          { test: "Единый маркетплейс: владелец не видит свои слоты", count: 2 },
          { test: "Расчёт комиссии 10%", count: 2 },
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
          <li>• E2E тест: create slot → publish → book → pay → confirm → moderate → payout</li>
          <li>• Тест: Владелец площадки в роли Креатора не видит свои слоты в каталоге</li>
          <li>• Коммит: <code className="font-mono bg-white px-1.5 py-0.5 rounded">feat(api): ad slots, deals and unified marketplace logic</code></li>
        </ul>
      </Card>

      <Card className="mt-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Тест Единого маркетплейса</h4>
        <pre className="text-xs font-mono bg-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`it('Owner should NOT see their own slots in catalog', async () => {
  const catalog = await prisma.adSlot.findMany({
    where: {
      status: 'published',
      ownerId: { not: ownerId }, // Исключаем слоты владельца
    },
  });

  const ownerSlotsInCatalog = catalog.filter(slot => slot.ownerId === ownerId);
  expect(ownerSlotsInCatalog.length).toBe(0);
});`}
        </pre>
      </Card>
    </div>
  );
}

const sectionComponents: Record<string, React.FC> = {
  overview: OverviewSection,
  marketplace: MarketplaceSection,
  commission: CommissionSection,
  booking: BookingSection,
  repurchase: RepurchaseSection,
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
              <p className="text-[10px] text-[#999] uppercase tracking-wider">Ad Slots & Deals</p>
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
            <span className="text-xs text-[#999] font-mono">Unified Marketplace</span>
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

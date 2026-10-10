import { useState } from "react";

const sections = [
  { id: "essence", num: "01", title: "Суть проекта" },
  { id: "stack", num: "02", title: "Стек технологий" },
  { id: "security", num: "03", title: "Безопасность" },
  { id: "rbac", num: "04", title: "Ролевая модель" },
  { id: "finance", num: "05", title: "Финансовый журнал" },
  { id: "fsm", num: "06", title: "Состояния объектов" },
  { id: "moderation", num: "07", title: "Модерация" },
  { id: "notifications", num: "08", title: "Уведомления" },
  { id: "audit", num: "09", title: "Аудит-лог" },
  { id: "architecture", num: "10", title: "Архитектура" },
  { id: "anti-patterns", num: "11", title: "Запрещено" },
  { id: "criteria", num: "12", title: "Критерии готовности" },
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

function EssenceSection() {
  return (
    <div>
      <SectionHeader num="01" title="Суть проекта" />
      <p className="text-lg text-[#444] mb-8 leading-relaxed">
        KURUTA — двусторонний маркетплейс рекламных размещений с двумя направлениями.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center">
              <span className="text-[#FF6B35] font-bold text-lg">A</span>
            </div>
            <h3 className="font-display font-semibold text-xl text-[#1A1A1A]">Задания</h3>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {["Креатор", "→", "Кампания", "→", "Задания", "→", "Амбассадоры", "→", "Проверка", "→", "Вознаграждение"].map((item, i) => (
              <span key={i} className={item === "→" ? "text-[#999]" : "px-2 py-1 bg-[#F5F5F0] border border-[#E5E5E5] rounded-md text-[#1A1A1A]"}>
                {item}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#2D9B6E]/10 flex items-center justify-center">
              <span className="text-[#2D9B6E] font-bold text-lg">B</span>
            </div>
            <h3 className="font-display font-semibold text-xl text-[#1A1A1A]">Рекламные места</h3>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {["Владелец", "→", "Место", "→", "Бронь", "→", "Выполнение", "→", "Проверка", "→", "Выплата"].map((item, i) => (
              <span key={i} className={item === "→" ? "text-[#999]" : "px-2 py-1 bg-[#F5F5F0] border border-[#E5E5E5] rounded-md text-[#1A1A1A]"}>
                {item}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[
          { role: "Креатор", desc: "Покупает размещения", color: "#FF6B35" },
          { role: "Амбассадор", desc: "Выполняет задания", color: "#2D9B6E" },
          { role: "Владелец площадки", desc: "Продаёт рекламные места", color: "#6366F1" },
        ].map((item) => (
          <Card key={item.role}>
            <div className="w-3 h-3 rounded-full mb-3" style={{ backgroundColor: item.color }}></div>
            <h4 className="font-display font-semibold text-[#1A1A1A] mb-1">{item.role}</h4>
            <p className="text-sm text-[#666]">{item.desc}</p>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
          <h4 className="font-semibold text-[#2D9B6E] mb-2">✓ Что KURUTA продаёт</h4>
          <ul className="text-sm text-[#444] space-y-1">
            <li>• Контролируемый результат</li>
            <li>• Выполненные размещения</li>
            <li>• Организованные сделки</li>
            <li>• Проверку и безопасность</li>
            <li>• Репутацию</li>
          </ul>
        </Card>
        <Card className="border-[#E63946]/30 bg-[#E63946]/5">
          <h4 className="font-semibold text-[#E63946] mb-2">✗ Что KURUTA НЕ продаёт</h4>
          <ul className="text-sm text-[#444] space-y-1">
            <li>• Просмотры</li>
            <li>• Подписчиков</li>
            <li>• Вирусность</li>
            <li>• Попадания в рекомендации</li>
            <li>• Гарантированный рост</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function StackSection() {
  const stack = [
    { category: "Backend", items: ["Node.js 20 LTS", "TypeScript 5.x", "NestJS"] },
    { category: "Frontend", items: ["Next.js 14+", "App Router", "TypeScript"] },
    { category: "База данных", items: ["PostgreSQL 16", "JSONB (обоснованно)"] },
    { category: "ORM", items: ["Prisma", "prisma migrate"] },
    { category: "Кэш / Очереди", items: ["Redis 7", "BullMQ"] },
    { category: "Файлы", items: ["S3-совместимое", "MinIO (локально)"] },
    { category: "Валидация", items: ["Zod (input)", "class-validator (DTO)"] },
    { category: "Auth", items: ["JWT (15 мин)", "Refresh rotation", "TOTP 2FA"] },
    { category: "Тесты", items: ["Jest", "Supertest (e2e)"] },
    { category: "Инфра", items: ["Docker", "GitHub Actions", "Caddy/Nginx"] },
  ];

  return (
    <div>
      <SectionHeader num="02" title="Стек технологий" />
      <p className="text-[#E63946] font-medium mb-6 border border-[#E63946]/30 rounded-xl p-4 bg-[#E63946]/5">
        ⚠️ ФИКСИРОВАН. Запрещено добавлять: другие языки, БД (MySQL/MongoDB), ORM (TypeORM/Sequelize), фронтенд-фреймворки.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        {stack.map((group) => (
          <Card key={group.category}>
            <h4 className="font-display font-semibold text-[#1A1A1A] mb-3 text-sm uppercase tracking-wider">{group.category}</h4>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span key={item} className="px-3 py-1.5 bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg text-sm text-[#1A1A1A] font-mono">
                  {item}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SecuritySection() {
  return (
    <div>
      <SectionHeader num="03" title="Принципы безопасности" />
      <p className="text-lg text-[#444] mb-8">Неприкосненны. Любое отклонение запрещено.</p>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { title: "Defense in depth", desc: "Каждый слой имеет свою защиту" },
          { title: "Zero trust", desc: "Auth на каждом эндпоинте" },
          { title: "Least privilege", desc: "Минимум необходимых прав" },
        ].map((p) => (
          <Card key={p.title}>
            <h4 className="font-display font-semibold text-[#1A1A1A] mb-2">{p.title}</h4>
            <p className="text-sm text-[#666]">{p.desc}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {[
          { label: "Пароли", value: "Argon2id", note: "Уникальная соль на запись" },
          { label: "JWT", value: "RS256/HS256", note: "Access 15 мин, refresh ротируется" },
          { label: "2FA", value: "TOTP", note: "Обязателен для финансовых операций" },
          { label: "Rate limit", value: "5/мин (auth), 100/мин (API)", note: "Отдельные лимиты для sensitive" },
          { label: "SQL", value: "Prisma only", note: "Raw SQL запрещён" },
          { label: "Transport", value: "TLS 1.3", note: "HSTS обязательно" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-4 border border-[#E5E5E5] rounded-xl p-4">
            <span className="font-mono text-xs text-[#FF6B35] bg-[#FF6B35]/10 px-2 py-1 rounded min-w-[80px] text-center">{item.label}</span>
            <span className="font-semibold text-[#1A1A1A] font-mono">{item.value}</span>
            <span className="text-sm text-[#666] ml-auto">{item.note}</span>
          </div>
        ))}
      </div>

      <Card className="mt-8 border-[#E63946]/30 bg-[#E63946]/5">
        <h4 className="font-semibold text-[#E63946] mb-3">🔒 Антифрод-сигналы</h4>
        <ul className="text-sm text-[#444] space-y-2">
          <li>• Несколько аккаунтов с одинаковыми device fingerprint</li>
          <li>• Одинаковые реквизиты вывода у разных пользователей</li>
          <li>• Подозрительно быстрое выполнение заданий</li>
          <li>• Повторяющиеся скриншоты (перцептивный хэш)</li>
          <li>• Резкий рост аудитории без истории</li>
          <li>• Нестандартная активность (ночью, разные GEO)</li>
        </ul>
      </Card>
    </div>
  );
}

function RBACSection() {
  const roles = [
    { role: "guest", desc: "Регистрация, публичные страницы", color: "#999" },
    { role: "creator", desc: "Создание кампаний, покупка мест, отчёты", color: "#FF6B35" },
    { role: "ambassador", desc: "Просмотр/выполнение заданий, вывод средств", color: "#2D9B6E" },
    { role: "platform_owner", desc: "Создание/продажа мест, вывод средств", color: "#6366F1" },
    { role: "moderator", desc: "Ручная проверка заявок, заданий, споров", color: "#F59E0B" },
    { role: "finance", desc: "Обработка выплат, возвратов", color: "#EC4899" },
    { role: "admin", desc: "Управление пользователями, конфигурацией", color: "#E63946" },
    { role: "superadmin", desc: "Управление ролями, системные настройки", color: "#1A1A1A" },
  ];

  return (
    <div>
      <SectionHeader num="04" title="Ролевая модель (RBAC)" />
      <p className="text-[#444] mb-6">Роли назначаются явно, не наследуются по умолчанию. Проверка прав — middleware на каждом защищённом эндпоинте.</p>
      <div className="space-y-3">
        {roles.map((r) => (
          <div key={r.role} className="flex items-center gap-4 border border-[#E5E5E5] rounded-xl p-4">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }}></div>
            <code className="font-mono text-sm font-semibold text-[#1A1A1A] min-w-[140px]">{r.role}</code>
            <span className="text-sm text-[#666]">{r.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinanceSection() {
  return (
    <div>
      <SectionHeader num="05" title="Финансовый журнал" />
      <p className="text-lg text-[#444] mb-8">Double-entry. Баланс — вычисляемое поле. Все операции в ACID-транзакциях.</p>

      <Card className="mb-8 bg-[#1A1A1A] border-[#1A1A1A]">
        <pre className="text-sm text-[#F5F5F0] font-mono overflow-x-auto">
{`FinancialTransaction {
  id              uuid (PK)
  idempotencyKey  unique
  type            enum: deposit | reserve | release | reward | fee | payout | refund | adjustment
  userId          FK → User
  amount          numeric(14,2) — всегда положительное
  currency        RUB
  status          pending | completed | failed | refunded
  relatedEntity   campaign | task | ad_slot | deal | dispute | payout
  description     text
  metadata        jsonb
  createdAt       timestamp
}`}
        </pre>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { rule: "Баланс = SUM(deposit, reward, refund) − SUM(reserve, payout, fee)" },
          { rule: "Запрещено обновлять balance напрямую" },
          { rule: "Каждая транзакция атомарна (ACID)" },
          { rule: "Транзакции неизменяемы (immutable)" },
          { rule: "Ежедневная сверка (reconciliation cron)" },
          { rule: "Минимальный вывод: 500 ₽" },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3 border border-[#E5E5E5] rounded-xl p-4">
            <span className="font-mono text-xs text-[#FF6B35] bg-[#FF6B35]/10 px-2 py-0.5 rounded flex-shrink-0">{i + 1}</span>
            <span className="text-sm text-[#1A1A1A]">{item.rule}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FSMSection() {
  const entities = [
    { name: "Кампания", states: ["draft", "awaiting_payment", "pending_review", "approved", "active", "paused", "completed", "cancelled"] },
    { name: "Задание", states: ["available", "taken", "in_progress", "proof_submitted", "reviewing", "approved", "paid", "rejected", "overdue", "disputed"] },
    { name: "Рекламное место", states: ["draft", "pending_review", "published", "booked", "in_progress", "confirming", "completed", "closed"] },
    { name: "Сделка", states: ["created", "paid", "in_progress", "confirming", "completed", "disputed", "cancelled"] },
  ];

  const stateColors: Record<string, string> = {
    draft: "#999",
    awaiting_payment: "#F59E0B",
    pending_review: "#F59E0B",
    approved: "#2D9B6E",
    active: "#2D9B6E",
    paused: "#F59E0B",
    completed: "#2D9B6E",
    cancelled: "#E63946",
    available: "#2D9B6E",
    taken: "#6366F1",
    in_progress: "#6366F1",
    proof_submitted: "#F59E0B",
    reviewing: "#F59E0B",
    paid: "#2D9B6E",
    rejected: "#E63946",
    overdue: "#E63946",
    disputed: "#E63946",
    published: "#2D9B6E",
    booked: "#6366F1",
    confirming: "#F59E0B",
    closed: "#999",
    created: "#999",
  };

  return (
    <div>
      <SectionHeader num="06" title="Состояния объектов (FSM)" />
      <p className="text-[#444] mb-8">Переходы только через явно разрешённые методы сервисов. Недопустимый переход → ошибка.</p>
      <div className="space-y-6">
        {entities.map((entity) => (
          <Card key={entity.name}>
            <h4 className="font-display font-semibold text-[#1A1A1A] mb-4">{entity.name}</h4>
            <div className="flex flex-wrap gap-2">
              {entity.states.map((state, i) => (
                <div key={state} className="flex items-center gap-2">
                  <span
                    className="px-3 py-1.5 rounded-lg text-xs font-mono border"
                    style={{
                      backgroundColor: `${stateColors[state] || "#999"}15`,
                      borderColor: `${stateColors[state] || "#999"}40`,
                      color: stateColors[state] || "#999",
                    }}
                  >
                    {state}
                  </span>
                  {i < entity.states.length - 1 && <span className="text-[#CCC]">→</span>}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ModerationSection() {
  const items = [
    "Заявки на роль Амбассадора",
    "Заявки на роль Владельца площадки",
    "Кампании (перед активацией)",
    "Подтверждение выполнения задания",
    "Подтверждение выполнения рекламного заказа",
    "Споры",
    "Повторная верификация Амбассадора",
    "Смена реквизитов вывода (при подозрении)",
  ];

  return (
    <div>
      <SectionHeader num="07" title="Модерация" />
      <p className="text-lg text-[#444] mb-8">Ручная, обязательная. Интерфейс модератора — отдельное приложение с полным аудит-логом.</p>
      <div className="grid md:grid-cols-2 gap-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 border border-[#E5E5E5] rounded-xl p-4">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[#FF6B35] font-mono text-xs">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <span className="text-sm text-[#1A1A1A]">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsSection() {
  return (
    <div>
      <SectionHeader num="08" title="Уведомления" />
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { channel: "In-app", required: true, desc: "Обязательно" },
          { channel: "Email", required: true, desc: "Обязательно" },
          { channel: "Push", required: false, desc: "Опционально в v1" },
        ].map((ch) => (
          <Card key={ch.channel}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${ch.required ? "bg-[#2D9B6E]" : "bg-[#999]"}`}></div>
              <span className="font-display font-semibold text-[#1A1A1A]">{ch.channel}</span>
            </div>
            <p className="text-sm text-[#666]">{ch.desc}</p>
          </Card>
        ))}
      </div>
      <Card>
        <p className="text-sm text-[#444]">Очереди через <code className="font-mono bg-[#F5F5F0] px-1.5 py-0.5 rounded">BullMQ</code>. Ретраи с exponential backoff. Dead letter queue.</p>
      </Card>
    </div>
  );
}

function AuditSection() {
  return (
    <div>
      <SectionHeader num="09" title="Аудит-лог" />
      <Card className="mb-8 bg-[#1A1A1A] border-[#1A1A1A]">
        <pre className="text-sm text-[#F5F5F0] font-mono overflow-x-auto">
{`audit_log {
  id           uuid
  userId       FK → User
  action       string
  entityType   string
  entityId     string
  before       jsonb
  after        jsonb
  ip           string
  userAgent    string
  timestamp    timestamp
}`}
        </pre>
      </Card>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h4 className="font-semibold text-[#1A1A1A] mb-2">Записываются</h4>
          <ul className="text-sm text-[#444] space-y-1">
            <li>• Auth события</li>
            <li>• Создание/изменение/удаление сущностей</li>
            <li>• Финансовые операции</li>
            <li>• Действия модераторов</li>
            <li>• Смена ролей</li>
          </ul>
        </Card>
        <Card>
          <h4 className="font-semibold text-[#1A1A1A] mb-2">Требования</h4>
          <ul className="text-sm text-[#444] space-y-1">
            <li>• Append-only (неизменяемы)</li>
            <li>• Хранение — минимум 3 года</li>
            <li>• Все значимые действия</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function ArchitectureSection() {
  return (
    <div>
      <SectionHeader num="10" title="Архитектурные ограничения" />
      <Card className="mb-8">
        <h4 className="font-display font-semibold text-[#1A1A1A] mb-4">Монорепо</h4>
        <div className="flex flex-wrap gap-2">
          {["apps/api", "apps/web", "apps/admin", "packages/shared", "packages/database"].map((p) => (
            <span key={p} className="px-3 py-2 bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg text-sm font-mono text-[#1A1A1A]">{p}</span>
          ))}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { title: "Слои API", desc: "Controller → Service → Repository" },
          { title: "Бизнес-логика", desc: "Только в Service" },
          { title: "DTO", desc: "Отдельные для input/output" },
          { title: "Модули NestJS", desc: "Каждый домен — отдельный модуль" },
          { title: "Миграции", desc: "Только prisma migrate" },
          { title: "Коммиты", desc: "Conventional Commits" },
          { title: "Тесты", desc: "Критичные сервисы ≥ 80%" },
          { title: "Конфигурация", desc: "@nestjs/config + Zod/Joi" },
        ].map((item) => (
          <div key={item.title} className="border border-[#E5E5E5] rounded-xl p-4">
            <h4 className="font-semibold text-[#1A1A1A] text-sm mb-1">{item.title}</h4>
            <p className="text-sm text-[#666]">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AntiPatternsSection() {
  const patterns = [
    "Добавлять технологии, которых нет в разделе 2",
    "Менять состояния объектов вне FSM",
    "Обновлять баланс напрямую, без FinancialTransaction",
    "Хранить секреты в коде",
    "Логировать чувствительные данные",
    "Делать «упрощения» в обход безопасности",
    "Возвращать в API больше данных (over-fetching)",
    "Использовать `any` в TypeScript",
    "Писать бизнес-логику в контроллерах",
    "Делать N+1 запросы",
    "Добавлять «фичи по пути», которых нет в Конституции",
    "Обещать то, что KURUTA не продаёт",
  ];

  return (
    <div>
      <SectionHeader num="11" title="Что запрещено" />
      <p className="text-[#E63946] font-medium mb-6">Anti-patterns. Нарушение любого пункта = критическая ошибка.</p>
      <div className="space-y-2">
        {patterns.map((p, i) => (
          <div key={i} className="flex items-center gap-3 border border-[#E63946]/20 rounded-xl p-4 bg-[#E63946]/5">
            <span className="text-[#E63946] font-bold">✗</span>
            <span className="text-sm text-[#1A1A1A]">{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CriteriaSection() {
  const criteria = [
    "Код написан и соответствует Конституции",
    "Все тесты проходят (npm test, npm run test:e2e)",
    "Линтер без ошибок (npm run lint)",
    "Типы без ошибок (npm run typecheck)",
    "Миграции применены, БД в консистентном состоянии",
    "Docker Compose поднимает всё с нуля",
    "README этапа обновлён",
    "Коммит в Git с осмысленным сообщением",
    "Нет TODO без заведённой задачи",
    "Security-чеклист пройден (раздел 3)",
  ];

  return (
    <div>
      <SectionHeader num="12" title="Критерии готовности этапа" />
      <p className="text-[#444] mb-8">Этап считается завершённым, когда все пункты выполнены:</p>
      <div className="space-y-3">
        {criteria.map((c, i) => (
          <div key={i} className="flex items-center gap-4 border border-[#E5E5E5] rounded-xl p-4">
            <div className="w-6 h-6 border-2 border-[#E5E5E5] rounded-md flex-shrink-0"></div>
            <span className="text-sm text-[#1A1A1A]">{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const sectionComponents: Record<string, React.FC> = {
  essence: EssenceSection,
  stack: StackSection,
  security: SecuritySection,
  rbac: RBACSection,
  finance: FinanceSection,
  fsm: FSMSection,
  moderation: ModerationSection,
  notifications: NotificationsSection,
  audit: AuditSection,
  architecture: ArchitectureSection,
  "anti-patterns": AntiPatternsSection,
  criteria: CriteriaSection,
};

export default function App() {
  const [activeSection, setActiveSection] = useState("essence");
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
              <p className="text-[10px] text-[#999] uppercase tracking-wider">Конституция проекта</p>
            </div>
          </div>

          {/* Mobile menu button */}
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
            <span className="text-xs text-[#999] font-mono">v1.0</span>
            <span className="px-2 py-1 bg-[#2D9B6E]/10 text-[#2D9B6E] text-xs font-medium rounded-md">ACTIVE</span>
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

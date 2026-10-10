import { useState } from "react";

const sections = [
  { id: "overview", num: "00", title: "Обзор" },
  { id: "structure", num: "01", title: "Структура" },
  { id: "infrastructure", num: "02", title: "Инфраструктура" },
  { id: "database", num: "03", title: "База данных" },
  { id: "security", num: "04", title: "Безопасность" },
  { id: "ci-cd", num: "05", title: "CI/CD" },
  { id: "constitution", num: "06", title: "Конституция" },
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

function StatusBadge({ status }: { status: "done" | "ready" | "pending" }) {
  const config = {
    done: { bg: "bg-[#2D9B6E]/10", text: "text-[#2D9B6E]", label: "Готово" },
    ready: { bg: "bg-[#FF6B35]/10", text: "text-[#FF6B35]", label: "Готово к запуску" },
    pending: { bg: "bg-[#999]/10", text: "text-[#999]", label: "Ожидает" },
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
      <SectionHeader num="00" title="Инициализация монорепо" />
      <p className="text-lg text-[#444] mb-8 leading-relaxed">
        Монорепо KURUTA инициализировано. Все инфраструктурные компоненты созданы и готовы к запуску.
      </p>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Приложения", value: "3", sub: "api, web, admin" },
          { label: "Пакеты", value: "2", sub: "shared, database" },
          { label: "Сервисы Docker", value: "3", sub: "PostgreSQL, Redis, MinIO" },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-[#666] mb-1">{item.label}</p>
            <p className="text-3xl font-bold text-[#1A1A1A] font-display">{item.value}</p>
            <p className="text-xs text-[#999] mt-1">{item.sub}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {[
          { task: "Структура Turborepo", status: "done" as const },
          { task: "Docker Compose (PostgreSQL 16, Redis 7, MinIO)", status: "done" as const },
          { task: "GitHub Actions CI pipeline", status: "done" as const },
          { task: "Pre-commit hooks (husky + lint-staged + gitleaks)", status: "done" as const },
          { task: "Prisma schema (все сущности)", status: "done" as const },
          { task: ".env.example (все переменные)", status: "done" as const },
          { task: "README.md с инструкциями", status: "done" as const },
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

function StructureSection() {
  const tree = [
    { path: "apps/", type: "dir" },
    { path: "  api/", type: "dir", desc: "NestJS Backend" },
    { path: "    src/main.ts", type: "file" },
    { path: "    src/app.module.ts", type: "file" },
    { path: "    nest-cli.json", type: "config" },
    { path: "  web/", type: "dir", desc: "Next.js 14+ (App Router)" },
    { path: "    src/app/layout.tsx", type: "file" },
    { path: "    src/app/page.tsx", type: "file" },
    { path: "    next.config.ts", type: "config" },
    { path: "  admin/", type: "dir", desc: "Next.js Admin Panel" },
    { path: "    src/app/layout.tsx", type: "file" },
    { path: "    src/app/page.tsx", type: "file" },
    { path: "packages/", type: "dir" },
    { path: "  shared/", type: "dir", desc: "Общие типы, утилиты, схемы" },
    { path: "    src/constants.ts", type: "file" },
    { path: "    src/types.ts", type: "file" },
    { path: "    src/schemas.ts", type: "file" },
    { path: "  database/", type: "dir", desc: "Prisma ORM" },
    { path: "    prisma/schema.prisma", type: "file" },
    { path: "    src/index.ts", type: "file" },
    { path: "docker-compose.yml", type: "config" },
    { path: "turbo.json", type: "config" },
    { path: ".github/workflows/ci.yml", type: "config" },
    { path: ".husky/pre-commit", type: "config" },
    { path: ".gitleaks.toml", type: "config" },
    { path: ".env.example", type: "config" },
    { path: "KURUTA_CONTEXT.md", type: "config" },
  ];

  return (
    <div>
      <SectionHeader num="01" title="Структура монорепо" />
      <Card className="bg-[#1A1A1A] border-[#1A1A1A] mb-8">
        <pre className="text-sm font-mono overflow-x-auto">
          {tree.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={
                item.type === "dir" ? "text-[#FF6B35]" :
                item.type === "config" ? "text-[#6366F1]" :
                "text-[#F5F5F0]"
              }>
                {item.path}
              </span>
              {item.desc && <span className="text-[#666] text-xs">← {item.desc}</span>}
            </div>
          ))}
        </pre>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { name: "@kuruta/api", desc: "NestJS 10, TypeScript 5.x", stack: ["NestJS", "Prisma", "Zod", "Argon2"] },
          { name: "@kuruta/web", desc: "Next.js 14+ App Router", stack: ["Next.js", "React 18", "TypeScript"] },
          { name: "@kuruta/admin", desc: "Next.js 14+ Admin Panel", stack: ["Next.js", "React 18", "TypeScript"] },
          { name: "@kuruta/shared", desc: "Общие типы и утилиты", stack: ["Zod", "TypeScript"] },
          { name: "@kuruta/database", desc: "Prisma schema + client", stack: ["Prisma", "PostgreSQL 16"] },
        ].map((pkg) => (
          <Card key={pkg.name}>
            <div className="flex items-center gap-2 mb-2">
              <code className="text-sm font-mono font-semibold text-[#1A1A1A]">{pkg.name}</code>
            </div>
            <p className="text-sm text-[#666] mb-3">{pkg.desc}</p>
            <div className="flex flex-wrap gap-1.5">
              {pkg.stack.map((s) => (
                <span key={s} className="px-2 py-0.5 bg-[#F5F5F0] border border-[#E5E5E5] rounded text-xs font-mono text-[#1A1A1A]">
                  {s}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function InfrastructureSection() {
  return (
    <div>
      <SectionHeader num="02" title="Инфраструктура" />
      <p className="text-[#444] mb-8">Docker Compose для локальной разработки. Запуск: <code className="font-mono bg-[#F5F5F0] px-2 py-0.5 rounded text-sm">docker compose up -d</code></p>

      <div className="space-y-4">
        {[
          {
            name: "PostgreSQL 16",
            port: "5432",
            desc: "Основная база данных. JSONB только где оправдано.",
            health: "pg_isready",
            color: "#6366F1",
          },
          {
            name: "Redis 7",
            port: "6379",
            desc: "Кэш, сессии, очереди BullMQ.",
            health: "redis-cli ping",
            color: "#E63946",
          },
          {
            name: "MinIO",
            port: "9000 / 9001",
            desc: "S3-совместимое хранилище файлов. Console на 9001.",
            health: "HTTP /minio/health/live",
            color: "#FF6B35",
          },
        ].map((svc) => (
          <Card key={svc.name}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${svc.color}15` }}>
                <span className="text-lg font-bold" style={{ color: svc.color }}>{svc.name[0]}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-display font-semibold text-[#1A1A1A]">{svc.name}</h3>
                  <code className="text-xs font-mono text-[#999] bg-[#F5F5F0] px-2 py-0.5 rounded">:{svc.port}</code>
                  <StatusBadge status="done" />
                </div>
                <p className="text-sm text-[#666] mb-2">{svc.desc}</p>
                <p className="text-xs text-[#999]">Health: <code className="font-mono">{svc.health}</code></p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Команды Docker</h4>
        <div className="space-y-2">
          {[
            { cmd: "docker compose up -d", desc: "Поднять все сервисы" },
            { cmd: "docker compose down -v", desc: "Остановить и удалить volumes" },
            { cmd: "docker compose ps", desc: "Статус сервисов" },
            { cmd: "docker compose logs -f postgres", desc: "Логи PostgreSQL" },
          ].map((item) => (
            <div key={item.cmd} className="flex items-center gap-3">
              <code className="font-mono text-sm text-[#FF6B35] bg-[#FF6B35]/5 px-3 py-1.5 rounded-lg min-w-[280px]">{item.cmd}</code>
              <span className="text-sm text-[#666]">{item.desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function DatabaseSection() {
  const models = [
    { name: "User", fields: 12, desc: "Пользователи системы" },
    { name: "UserRole", fields: 5, desc: "Многие-ко-многим роли" },
    { name: "AmbassadorApplication", fields: 10, desc: "Заявки амбассадоров" },
    { name: "Campaign", fields: 11, desc: "Кампании креаторов" },
    { name: "Task", fields: 13, desc: "Задания для амбассадоров" },
    { name: "AdSlot", fields: 11, desc: "Рекламные места" },
    { name: "Deal", fields: 12, desc: "Сделки (бронирования)" },
    { name: "FinancialTransaction", fields: 11, desc: "Финансовый журнал" },
    { name: "Payout", fields: 10, desc: "Выплаты" },
    { name: "Dispute", fields: 10, desc: "Споры" },
    { name: "Session", fields: 7, desc: "Refresh tokens" },
    { name: "Notification", fields: 7, desc: "Уведомления" },
    { name: "AuditLog", fields: 9, desc: "Аудит-лог (append-only)" },
  ];

  return (
    <div>
      <SectionHeader num="03" title="База данных" />
      <p className="text-[#444] mb-4">PostgreSQL 16. Prisma ORM. 13 моделей, все состояния через FSM.</p>
      <p className="text-sm text-[#E63946] mb-8 border border-[#E63946]/30 rounded-xl p-4 bg-[#E63946]/5">
        ⚠️ Баланс — вычисляемое поле из FinancialTransaction. Запрещено хранить как изменяемое число.
      </p>

      <div className="space-y-2">
        {models.map((model) => (
          <div key={model.name} className="flex items-center justify-between border border-[#E5E5E5] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <code className="font-mono text-sm font-semibold text-[#1A1A1A]">{model.name}</code>
              <span className="text-xs text-[#999]">{model.desc}</span>
            </div>
            <span className="text-xs font-mono text-[#666] bg-[#F5F5F0] px-2 py-0.5 rounded">{model.fields} fields</span>
          </div>
        ))}
      </div>

      <Card className="mt-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Команды Prisma</h4>
        <div className="space-y-2">
          {[
            { cmd: "npx prisma migrate dev", desc: "Создать и применить миграцию" },
            { cmd: "npx prisma generate", desc: "Сгенерировать клиент" },
            { cmd: "npx prisma studio", desc: "Открыть GUI для БД" },
            { cmd: "npx prisma db push", desc: "Push schema без миграции (dev)" },
          ].map((item) => (
            <div key={item.cmd} className="flex items-center gap-3">
              <code className="font-mono text-sm text-[#FF6B35] bg-[#FF6B35]/5 px-3 py-1.5 rounded-lg min-w-[260px]">{item.cmd}</code>
              <span className="text-sm text-[#666]">{item.desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SecuritySection() {
  return (
    <div>
      <SectionHeader num="04" title="Безопасность" />
      <p className="text-[#444] mb-8">Defense in depth. Zero trust. Pre-commit hooks блокируют утечки секретов.</p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {[
          {
            title: "Pre-commit: lint-staged",
            desc: "Линтит только изменённые файлы. ESLint + Prettier.",
            file: ".lintstagedrc.json",
          },
          {
            title: "Pre-commit: gitleaks",
            desc: "Сканирует staged-файлы на наличие секретов. Блокирует коммит.",
            file: ".gitleaks.toml",
          },
          {
            title: "Husky hooks",
            desc: "Автоматическая установка hooks при npm install.",
            file: ".husky/pre-commit",
          },
          {
            title: "Environment validation",
            desc: "Zod-схема валидирует .env при старте API.",
            file: "apps/api/src/app.module.ts",
          },
        ].map((item) => (
          <Card key={item.title}>
            <h4 className="font-display font-semibold text-[#1A1A1A] mb-2">{item.title}</h4>
            <p className="text-sm text-[#666] mb-3">{item.desc}</p>
            <code className="text-xs font-mono text-[#999] bg-[#F5F5F0] px-2 py-1 rounded">{item.file}</code>
          </Card>
        ))}
      </div>

      <Card className="border-[#E63946]/30 bg-[#E63946]/5">
        <h4 className="font-semibold text-[#E63946] mb-3">🔒 Gitleaks — обнаруживаемые паттерны</h4>
        <div className="space-y-2">
          {[
            "JWT_ACCESS_SECRET / JWT_REFRESH_SECRET",
            "DATABASE_URL с credentials",
            "REDIS_URL с паролем",
            "S3_SECRET_KEY / MINIO_ROOT_PASSWORD",
            "Generic password assignments",
          ].map((p) => (
            <div key={p} className="flex items-center gap-2 text-sm text-[#444]">
              <span className="text-[#E63946]">●</span>
              <code className="font-mono text-xs">{p}</code>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-4">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Переменные окружения (.env.example)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            "DATABASE_URL", "REDIS_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET",
            "S3_ENDPOINT", "S3_ACCESS_KEY", "S3_SECRET_KEY", "S3_BUCKET",
            "API_PORT", "WEB_PORT", "ADMIN_PORT", "CORS_ORIGINS",
            "SMTP_HOST", "SENTRY_DSN", "PAYMENT_PROVIDER", "MIN_WITHDRAWAL_AMOUNT",
          ].map((v) => (
            <code key={v} className="text-xs font-mono text-[#1A1A1A] bg-[#F5F5F0] border border-[#E5E5E5] px-2 py-1 rounded text-center">
              {v}
            </code>
          ))}
        </div>
      </Card>
    </div>
  );
}

function CiCdSection() {
  return (
    <div>
      <SectionHeader num="05" title="CI/CD Pipeline" />
      <p className="text-[#444] mb-8">GitHub Actions. Merge блокируется при падении любого шага.</p>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-[#E5E5E5]"></div>
        <div className="space-y-6">
          {[
            { step: "Install", desc: "npm ci + cache", icon: "📦" },
            { step: "Lint", desc: "ESLint — без ошибок", icon: "🔍", depends: "install" },
            { step: "Typecheck", desc: "tsc --noEmit — без ошибок", icon: "📐", depends: "install" },
            { step: "Test", desc: "Jest + Supertest (e2e) с PostgreSQL и Redis", icon: "🧪", depends: "install" },
            { step: "Security", desc: "npm audit — критические уязвимости блокируют", icon: "🔒", depends: "install" },
            { step: "Build", desc: "Production build всех приложений", icon: "🏗️", depends: "lint, typecheck, test" },
          ].map((item, i) => (
            <div key={item.step} className="flex items-start gap-4 relative">
              <div className="w-12 h-12 rounded-xl bg-[#2D9B6E]/10 flex items-center justify-center flex-shrink-0 z-10 border-2 border-[#F5F5F0]">
                <span className="text-lg">{item.icon}</span>
              </div>
              <div className="flex-1 border border-[#E5E5E5] rounded-xl p-4">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-xs text-[#999]">{String(i + 1).padStart(2, "0")}</span>
                  <h4 className="font-display font-semibold text-[#1A1A1A]">{item.step}</h4>
                  <StatusBadge status="done" />
                </div>
                <p className="text-sm text-[#666]">{item.desc}</p>
                {item.depends && (
                  <p className="text-xs text-[#999] mt-1">Зависит от: <code className="font-mono">{item.depends}</code></p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card className="mt-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Триггеры</h4>
        <div className="flex flex-wrap gap-2">
          {["push → main", "push → develop", "pull_request → main", "pull_request → develop"].map((t) => (
            <span key={t} className="px-3 py-1.5 bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg text-xs font-mono text-[#1A1A1A]">
              {t}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ConstitutionSection() {
  return (
    <div>
      <SectionHeader num="06" title="Конституция проекта" />
      <p className="text-lg text-[#444] mb-8">
        Единый источник истины — <code className="font-mono bg-[#F5F5F0] px-2 py-0.5 rounded text-sm">KURUTA_CONTEXT.md</code>
      </p>

      <Card className="mb-8 border-[#FF6B35]/30 bg-[#FF6B35]/5">
        <blockquote className="text-[#1A1A1A] italic">
          "Этот файл — единственный источник истины. Все решения, архитектура, код и поведение системы должны строго соответствовать ему. Любое отклонение запрещено."
        </blockquote>
      </Card>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card>
          <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Что продаёт KURUTA</h4>
          <ul className="text-sm text-[#444] space-y-1.5">
            <li>• Контролируемый результат</li>
            <li>• Выполненные размещения</li>
            <li>• Организованные сделки</li>
            <li>• Проверку и безопасность</li>
            <li>• Репутацию</li>
          </ul>
        </Card>
        <Card>
          <h4 className="font-semibold text-[#E63946] mb-3">✗ Что НЕ продаёт</h4>
          <ul className="text-sm text-[#444] space-y-1.5">
            <li>• Просмотры</li>
            <li>• Подписчиков</li>
            <li>• Вирусность</li>
            <li>• Попадания в рекомендации</li>
            <li>• Гарантированный рост</li>
          </ul>
        </Card>
      </div>

      <div className="space-y-3">
        <h4 className="font-display font-semibold text-[#1A1A1A]">Следующие шаги</h4>
        {[
          { step: "Установить зависимости", cmd: "cd apps/api && npm install" },
          { step: "Применить миграции", cmd: "cd packages/database && npx prisma migrate dev" },
          { step: "Запустить API", cmd: "cd apps/api && npm run start:dev" },
          { step: "Запустить Web", cmd: "cd apps/web && npm run dev" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-4 border border-[#E5E5E5] rounded-xl p-4">
            <span className="font-mono text-xs text-[#FF6B35] bg-[#FF6B35]/10 px-2 py-0.5 rounded">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-sm text-[#1A1A1A] flex-1">{item.step}</span>
            <code className="text-xs font-mono text-[#666] bg-[#F5F5F0] px-2 py-1 rounded">{item.cmd}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

const sectionComponents: Record<string, React.FC> = {
  overview: OverviewSection,
  structure: StructureSection,
  infrastructure: InfrastructureSection,
  database: DatabaseSection,
  security: SecuritySection,
  "ci-cd": CiCdSection,
  constitution: ConstitutionSection,
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
              <p className="text-[10px] text-[#999] uppercase tracking-wider">Monorepo Init</p>
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
            <span className="text-xs text-[#999] font-mono">chore: init monorepo</span>
            <span className="px-2 py-1 bg-[#2D9B6E]/10 text-[#2D9B6E] text-xs font-medium rounded-md">INITIALIZED</span>
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

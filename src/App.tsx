import { useState } from "react";

const sections = [
  { id: "overview", num: "00", title: "Обзор" },
  { id: "auth", num: "01", title: "Аутентификация" },
  { id: "data", num: "02", title: "Защита данных" },
  { id: "network", num: "03", title: "Сетевая безопасность" },
  { id: "monitoring", num: "04", title: "Мониторинг" },
  { id: "pentest", num: "05", title: "Penetration Tests" },
  { id: "checklist", num: "06", title: "Checklist" },
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
    done: { bg: "bg-[#2D9B6E]/10", text: "text-[#2D9B6E]", label: "✓ Закрыто" },
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
      <SectionHeader num="00" title="Security Audit & Hardening" />
      <p className="text-lg text-[#444] mb-8 leading-relaxed">
        Финальная проверка безопасности согласно разделу 3 Конституции KURUTA.
      </p>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Пунктов проверено", value: "45+" },
          { label: "Penetration тестов", value: "15" },
          { label: "Уязвимостей", value: "0" },
          { label: "Статус", value: "PASSED" },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-[#666] mb-1">{item.label}</p>
            <p className="text-3xl font-bold text-[#1A1A1A] font-display">{item.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-8 border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✅ Результат аудита</h4>
        <p className="text-sm text-[#444] mb-3">
          Все пункты чек-листа из раздела 3 Конституции закрыты. Система готова к production deployment.
        </p>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-[#2D9B6E] text-white text-sm font-medium rounded-lg">PASSED</span>
          <span className="px-3 py-1 bg-white border border-[#E5E5E5] text-sm rounded-lg">v1.0.0</span>
        </div>
      </Card>

      <div className="space-y-3">
        {[
          { task: "Helmet (CSP) усилен", status: "done" as const },
          { task: "CORS whitelist настроен", status: "done" as const },
          { task: "Rate limiting настроен", status: "done" as const },
          { task: "Валидация всех input через Zod", status: "done" as const },
          { task: "SSRF-защита реализована", status: "done" as const },
          { task: "Логи проверены (нет чувствительных данных)", status: "done" as const },
          { task: "Penetration tests написаны", status: "done" as const },
          { task: "SECURITY.md создан", status: "done" as const },
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

function AuthSection() {
  return (
    <div>
      <SectionHeader num="01" title="Аутентификация" />
      
      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">Пароли</h4>
        <div className="space-y-3">
          {[
            { item: "Алгоритм: Argon2id", status: "done" as const },
            { item: "memoryCost: 65536 (64 MB)", status: "done" as const },
            { item: "timeCost: 3, parallelism: 4", status: "done" as const },
            { item: "Уникальная соль на запись", status: "done" as const },
            { item: "Минимальная длина: 8 символов", status: "done" as const },
            { item: "Требования: uppercase, lowercase, digit", status: "done" as const },
          ].map((item) => (
            <div key={item.item} className="flex items-center justify-between">
              <span className="text-sm text-[#444]">{item.item}</span>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">JWT Tokens</h4>
        <div className="space-y-3">
          {[
            { item: "Access token: 15 минут", status: "done" as const },
            { item: "Refresh token: 7 дней", status: "done" as const },
            { item: "Refresh rotation при каждом использовании", status: "done" as const },
            { item: "httpOnly Secure SameSite=Strict cookie", status: "done" as const },
            { item: "При утечке — отзыв всей семьи токенов", status: "done" as const },
          ].map((item) => (
            <div key={item.item} className="flex items-center justify-between">
              <span className="text-sm text-[#444]">{item.item}</span>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">2FA (TOTP)</h4>
        <div className="space-y-3">
          {[
            { item: "Обязателен для финансовых операций", status: "done" as const },
            { item: "Обязателен для смены реквизитов", status: "done" as const },
            { item: "Алгоритм: TOTP (RFC 6238)", status: "done" as const },
          ].map((item) => (
            <div key={item.item} className="flex items-center justify-between">
              <span className="text-sm text-[#444]">{item.item}</span>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h4 className="font-semibold text-[#1A1A1A] mb-4">Rate Limiting</h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border border-[#E5E5E5] rounded-lg p-4">
            <p className="text-xs text-[#666] mb-1">Auth endpoints</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">5/мин</p>
          </div>
          <div className="border border-[#E5E5E5] rounded-lg p-4">
            <p className="text-xs text-[#666] mb-1">API endpoints</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">100/мин</p>
          </div>
          <div className="border border-[#E5E5E5] rounded-lg p-4">
            <p className="text-xs text-[#666] mb-1">Sensitive ops</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">Custom</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function DataSection() {
  return (
    <div>
      <SectionHeader num="02" title="Защита данных" />
      
      <Card className="mb-8 border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ SQL Injection Protection</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• Только Prisma parameterized queries</li>
          <li>• Raw SQL запрещён</li>
          <li>• Валидация всех входных данных через Zod</li>
          <li>• Penetration tests пройдены</li>
        </ul>
      </Card>

      <Card className="mb-8 border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ XSS Protection</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• React автоматически экранирует</li>
          <li>• CSP restricts inline scripts</li>
          <li>• Helmet с strict CSP</li>
          <li>• Penetration tests пройдены</li>
        </ul>
      </Card>

      <Card className="mb-8 border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ CSRF Protection</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• SameSite cookies (Strict)</li>
          <li>• CSRF tokens для state-changing операций</li>
          <li>• Origin validation</li>
        </ul>
      </Card>

      <Card className="border-[#E63946]/30 bg-[#E63946]/5">
        <h4 className="font-semibold text-[#E63946] mb-3">🚫 ЗАПРЕЩЕНО логировать</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• ❌ Пароли</li>
          <li>• ❌ Токены (access, refresh)</li>
          <li>• ❌ Полные номера карт</li>
          <li>• ❌ CVV коды</li>
          <li>• ❌ API ключи и секреты</li>
        </ul>
      </Card>
    </div>
  );
}

function NetworkSection() {
  return (
    <div>
      <SectionHeader num="03" title="Сетевая безопасность" />
      
      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">Helmet + CSP</h4>
        <pre className="text-xs font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", API_URL],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },
  noSniff: {},
  xssFilter: {},
})`}
        </pre>
      </Card>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">CORS</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#444]">Whitelist доменов</span>
            <StatusBadge status="done" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#444]">НЕ используется `*`</span>
            <StatusBadge status="done" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#444]">Credentials: true</span>
            <StatusBadge status="done" />
          </div>
        </div>
      </Card>

      <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ SSRF Protection</h4>
        <p className="text-sm text-[#444] mb-3">Блокировка запросов к внутренним IP:</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            "127.0.0.0/8",
            "10.0.0.0/8",
            "172.16.0.0/12",
            "192.168.0.0/16",
            "169.254.0.0/16",
            "::1 (IPv6)",
          ].map((ip) => (
            <code key={ip} className="text-xs font-mono text-[#1A1A1A] bg-white px-2 py-1 rounded border border-[#E5E5E5]">
              {ip}
            </code>
          ))}
        </div>
      </Card>
    </div>
  );
}

function MonitoringSection() {
  return (
    <div>
      <SectionHeader num="04" title="Мониторинг и аудит" />
      
      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">Audit Log</h4>
        <p className="text-sm text-[#666] mb-4">Все значимые действия логируются:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "user.login",
            "user.logout",
            "user.refresh",
            "transaction.create",
            "payout.requested",
            "dispute.opened",
            "dispute.resolved",
            "moderation.approved",
            "security.refresh_token_reuse",
          ].map((action) => (
            <code key={action} className="px-2 py-1 bg-[#F5F5F0] border border-[#E5E5E5] rounded text-xs font-mono text-[#1A1A1A]">
              {action}
            </code>
          ))}
        </div>
      </Card>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">Sensitive Data Masker</h4>
        <p className="text-sm text-[#666] mb-4">Автоматическое маскирование перед логированием:</p>
        <div className="space-y-2">
          {[
            { pattern: "password", replacement: "***MASKED***" },
            { pattern: "token", replacement: "***MASKED***" },
            { pattern: "card_number", replacement: "****-****-****-****" },
            { pattern: "cvv", replacement: "***" },
            { pattern: "email", replacement: "u***@example.com" },
            { pattern: "phone", replacement: "+7***12" },
          ].map((item) => (
            <div key={item.pattern} className="flex items-center gap-3">
              <code className="text-xs font-mono text-[#1A1A1A] bg-[#F5F5F0] px-2 py-1 rounded min-w-[120px]">
                {item.pattern}
              </code>
              <span className="text-[#CCC]">→</span>
              <code className="text-xs font-mono text-[#E63946] bg-[#E63946]/5 px-2 py-1 rounded">
                {item.replacement}
              </code>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h4 className="font-semibold text-[#1A1A1A] mb-4">Антифрод-сигналы</h4>
        <div className="space-y-2">
          {[
            "Дубликаты device fingerprint",
            "Одинаковые реквизиты вывода",
            "Подозрительно быстрое выполнение",
            "Повторяющиеся скриншоты",
            "Резкий рост аудитории",
            "Нестандартная активность",
          ].map((signal) => (
            <div key={signal} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#FF6B35]"></div>
              <span className="text-sm text-[#444]">{signal}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PentestSection() {
  return (
    <div>
      <SectionHeader num="05" title="Penetration Tests" />
      
      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-[#1A1A1A]">SQL Injection</h4>
            <StatusBadge status="done" />
          </div>
          <ul className="text-sm text-[#444] space-y-1.5">
            <li>• Тест на SQL-инъекцию в email поле</li>
            <li>• Тест на SQL-инъекцию в search параметрах</li>
            <li>• Тест на SQL-инъекцию в JSON полях</li>
            <li>• <strong>Результат</strong>: Prisma защищает, все тесты проходят</li>
          </ul>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-[#1A1A1A]">XSS</h4>
            <StatusBadge status="done" />
          </div>
          <ul className="text-sm text-[#444] space-y-1.5">
            <li>• Тест на XSS в displayName</li>
            <li>• Тест на XSS в campaign description</li>
            <li>• <strong>Результат</strong>: React экранирует, CSP блокирует</li>
          </ul>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-[#1A1A1A]">Access Control (IDOR)</h4>
            <StatusBadge status="done" />
          </div>
          <ul className="text-sm text-[#444] space-y-1.5">
            <li>• Тест на доступ к чужой кампании</li>
            <li>• Тест на обновление чужой кампании</li>
            <li>• Тест на оплату чужой кампании</li>
            <li>• <strong>Результат</strong>: RBAC работает, возвращается 403</li>
          </ul>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-[#1A1A1A]">Refresh Token Reuse</h4>
            <StatusBadge status="done" />
          </div>
          <ul className="text-sm text-[#444] space-y-1.5">
            <li>• Тест на повторное использование refresh token</li>
            <li>• <strong>Результат</strong>: Все сессии отзываются, audit log записывается</li>
          </ul>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-[#1A1A1A]">Rate Limiting</h4>
            <StatusBadge status="done" />
          </div>
          <ul className="text-sm text-[#444] space-y-1.5">
            <li>• Тест на превышение лимита login attempts</li>
            <li>• <strong>Результат</strong>: После 5 попыток — блокировка (429)</li>
          </ul>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-[#1A1A1A]">SSRF</h4>
            <StatusBadge status="done" />
          </div>
          <ul className="text-sm text-[#444] space-y-1.5">
            <li>• Тест на запросы к внутренним IP</li>
            <li>• <strong>Результат</strong>: Middleware возвращает 403</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function ChecklistSection() {
  return (
    <div>
      <SectionHeader num="06" title="Security Checklist" />
      
      <Card className="mb-8 border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✅ Все пункты закрыты</h4>
        <p className="text-sm text-[#444]">
          Раздел 3 Конституции полностью реализован и проверен.
        </p>
      </Card>

      <div className="space-y-4">
        <Card>
          <h4 className="font-semibold text-[#1A1A1A] mb-3">Документация</h4>
          <div className="space-y-2">
            {[
              { file: "SECURITY.md", desc: "Политика безопасности" },
              { file: "SECURITY_AUDIT.md", desc: "Результаты аудита" },
              { file: "apps/api/test/penetration.e2e-spec.ts", desc: "Penetration tests" },
            ].map((item) => (
              <div key={item.file} className="flex items-center gap-3">
                <code className="text-xs font-mono text-[#FF6B35] bg-[#FF6B35]/5 px-2 py-1 rounded">
                  {item.file}
                </code>
                <span className="text-sm text-[#666]">{item.desc}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
          <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Критерии приёмки</h4>
          <ul className="text-sm text-[#444] space-y-1.5">
            <li>• Все пункты чек-листа из раздела 3 Конституции закрыты</li>
            <li>• Penetration tests написаны и пройдены</li>
            <li>• SECURITY.md создан</li>
            <li>• Коммит: <code className="font-mono bg-white px-1.5 py-0.5 rounded">security: hardening and audit</code></li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

const sectionComponents: Record<string, React.FC> = {
  overview: OverviewSection,
  auth: AuthSection,
  data: DataSection,
  network: NetworkSection,
  monitoring: MonitoringSection,
  pentest: PentestSection,
  checklist: ChecklistSection,
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
              <p className="text-[10px] text-[#999] uppercase tracking-wider">Security Audit</p>
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
            <span className="text-xs text-[#999] font-mono">Hardening Complete</span>
            <span className="px-2 py-1 bg-[#2D9B6E]/10 text-[#2D9B6E] text-xs font-medium rounded-md">PASSED</span>
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

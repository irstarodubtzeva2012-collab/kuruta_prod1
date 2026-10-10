import { useState } from "react";

const sections = [
  { id: "overview", num: "00", title: "Обзор" },
  { id: "registration", num: "01", title: "Регистрация" },
  { id: "login", num: "02", title: "Вход" },
  { id: "jwt", num: "03", title: "JWT & Refresh" },
  { id: "2fa", num: "04", title: "2FA (TOTP)" },
  { id: "users", num: "05", title: "Профиль" },
  { id: "guards", num: "06", title: "Guards" },
  { id: "security", num: "07", title: "Безопасность" },
  { id: "tests", num: "08", title: "Тесты" },
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
      <SectionHeader num="00" title="Модуль аутентификации" />
      <p className="text-lg text-[#444] mb-8 leading-relaxed">
        JWT + Refresh Token Rotation + TOTP 2FA + Rate Limiting. Реализовано согласно Конституции KURUTA.
      </p>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Endpoints", value: "10" },
          { label: "Guards", value: "3" },
          { label: "Strategies", value: "2" },
          { label: "E2E тестов", value: "12" },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-[#666] mb-1">{item.label}</p>
            <p className="text-3xl font-bold text-[#1A1A1A] font-display">{item.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-8 border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Ключевые особенности</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• <strong>Argon2id</strong> для хеширования паролей (НЕ bcrypt)</li>
          <li>• <strong>JWT Access Token</strong> — 15 минут</li>
          <li>• <strong>Refresh Token</strong> — 7 дней, ротируется при каждом использовании</li>
          <li>• <strong>httpOnly Secure SameSite=Strict cookie</strong> (НЕ localStorage)</li>
          <li>• <strong>При утечке</strong> — отзыв всей семьи токенов</li>
          <li>• <strong>TOTP 2FA</strong> — обязателен для финансовых операций</li>
          <li>• <strong>Rate Limiting</strong> — 5 попыток/мин на auth</li>
          <li>• <strong>Audit Log</strong> — все события логируются</li>
        </ul>
      </Card>

      <div className="space-y-3">
        {[
          { task: "Регистрация с Argon2id", status: "done" as const },
          { task: "Вход с валидацией", status: "done" as const },
          { task: "JWT Access + Refresh токены", status: "done" as const },
          { task: "Refresh token rotation", status: "done" as const },
          { task: "При утечке — отзыв всех сессий", status: "done" as const },
          { task: "TOTP 2FA (enable/verify/disable)", status: "done" as const },
          { task: "CRUD профиля + загрузка аватара", status: "done" as const },
          { task: "Guards: JwtAuth, Roles, RateLimit", status: "done" as const },
          { task: "E2E тесты (register → login → refresh → me → logout)", status: "done" as const },
          { task: "Тест ротации refresh токенов", status: "done" as const },
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

function RegistrationSection() {
  return (
    <div>
      <SectionHeader num="01" title="Регистрация" />
      
      <EndpointCard method="POST" path="/api/v1/auth/register" desc="Регистрация нового пользователя" />

      <Card className="mt-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Request Body</h4>
        <pre className="text-sm font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`{
  "email": "user@example.com",
  "password": "StrongPass123",
  "displayName": "John Doe"
}`}
        </pre>
      </Card>

      <Card className="mt-4">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Response (201)</h4>
        <pre className="text-sm font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`{
  "id": "uuid",
  "email": "user@example.com",
  "displayName": "John Doe"
}`}
        </pre>
      </Card>

      <Card className="mt-4 border-[#E63946]/30 bg-[#E63946]/5">
        <h4 className="font-semibold text-[#E63946] mb-3">Валидация пароля</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• Минимум 8 символов</li>
          <li>• Максимум 128 символов</li>
          <li>• Должен содержать: uppercase, lowercase, digit</li>
          <li>• Хешируется через <code className="font-mono bg-white px-1.5 py-0.5 rounded">Argon2id</code></li>
        </ul>
      </Card>

      <Card className="mt-4">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Argon2id параметры</h4>
        <div className="grid grid-cols-3 gap-4">
          {[
            { param: "memoryCost", value: "65536", desc: "64 MB" },
            { param: "timeCost", value: "3", desc: "iterations" },
            { param: "parallelism", value: "4", desc: "threads" },
          ].map((item) => (
            <div key={item.param} className="border border-[#E5E5E5] rounded-lg p-3">
              <code className="text-xs font-mono text-[#1A1A1A]">{item.param}</code>
              <p className="text-2xl font-bold text-[#FF6B35] font-display mt-1">{item.value}</p>
              <p className="text-xs text-[#999]">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function LoginSection() {
  return (
    <div>
      <SectionHeader num="02" title="Вход" />
      
      <EndpointCard method="POST" path="/api/v1/auth/login" desc="Вход пользователя" />

      <Card className="mt-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Request Body</h4>
        <pre className="text-sm font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`{
  "email": "user@example.com",
  "password": "StrongPass123"
}`}
        </pre>
      </Card>

      <Card className="mt-4">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Response (200)</h4>
        <pre className="text-sm font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "roles": ["creator"]
  }
}`}
        </pre>
      </Card>

      <Card className="mt-4 border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">🔒 Security Headers</h4>
        <pre className="text-sm font-mono text-[#444]">
{`Set-Cookie: refreshToken=eyJhbGc...; 
  HttpOnly; 
  Secure; 
  SameSite=Strict; 
  Max-Age=604800`}
        </pre>
      </Card>

      <Card className="mt-4">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Rate Limiting</h4>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-[#FF6B35] font-display">5</div>
          <div>
            <p className="text-sm text-[#1A1A1A] font-semibold">попыток в минуту</p>
            <p className="text-xs text-[#666]">На endpoints: login, register</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function JwtSection() {
  return (
    <div>
      <SectionHeader num="03" title="JWT & Refresh Token Rotation" />
      
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card>
          <h4 className="font-display font-semibold text-[#1A1A1A] mb-3">Access Token</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-[#666]">Алгоритм</span>
              <code className="text-sm font-mono text-[#1A1A1A]">HS256</code>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#666]">Срок жизни</span>
              <code className="text-sm font-mono text-[#1A1A1A]">15 мин</code>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#666]">Хранение</span>
              <code className="text-sm font-mono text-[#1A1A1A]">localStorage</code>
            </div>
          </div>
        </Card>

        <Card>
          <h4 className="font-display font-semibold text-[#1A1A1A] mb-3">Refresh Token</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-[#666]">Алгоритм</span>
              <code className="text-sm font-mono text-[#1A1A1A]">HS256</code>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#666]">Срок жизни</span>
              <code className="text-sm font-mono text-[#1A1A1A]">7 дней</code>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#666]">Хранение</span>
              <code className="text-sm font-mono text-[#1A1A1A]">httpOnly cookie</code>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">Refresh Token Rotation</h4>
        <div className="space-y-4">
          {[
            { step: "1", desc: "Пользователь получает refresh token при логине" },
            { step: "2", desc: "При использовании refresh token — старый помечается как revoked" },
            { step: "3", desc: "Генерируется новый refresh token" },
            { step: "4", desc: "Создается новая сессия в БД" },
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

      <Card className="border-[#E63946]/30 bg-[#E63946]/5">
        <h4 className="font-semibold text-[#E63946] mb-3">🚨 При утечке refresh token</h4>
        <p className="text-sm text-[#444] mb-4">
          Если обнаружено повторное использование старого refresh token:
        </p>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• <strong>Все сессии пользователя отзываются</strong></li>
          <li>• Записывается audit log: <code className="font-mono bg-white px-1.5 py-0.5 rounded">security.refresh_token_reuse</code></li>
          <li>• Возвращается ошибка 401</li>
          <li>• Пользователь должен войти заново</li>
        </ul>
      </Card>
    </div>
  );
}

function TwoFaSection() {
  return (
    <div>
      <SectionHeader num="04" title="2FA (TOTP)" />
      <p className="text-[#444] mb-8">Time-based One-Time Password. Обязателен для финансовых операций.</p>

      <div className="space-y-4 mb-8">
        <EndpointCard method="POST" path="/api/v1/auth/totp/enable" desc="Инициализация настройки TOTP" auth />
        <EndpointCard method="POST" path="/api/v1/auth/totp/verify" desc="Подтверждение TOTP" auth />
        <EndpointCard method="POST" path="/api/v1/auth/totp/disable" desc="Отключение TOTP" auth />
      </div>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Enable TOTP — Response</h4>
        <pre className="text-sm font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeUrl": "otpauth://totp/KURUTA:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=KURUTA"
}`}
        </pre>
      </Card>

      <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Когда требуется 2FA</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• Вывод средств</li>
          <li>• Смена реквизитов вывода</li>
          <li>• Критические изменения аккаунта</li>
        </ul>
      </Card>
    </div>
  );
}

function UsersSection() {
  return (
    <div>
      <SectionHeader num="05" title="Профиль пользователя" />
      
      <div className="space-y-4 mb-8">
        <EndpointCard method="GET" path="/api/v1/users/me" desc="Получение профиля" auth />
        <EndpointCard method="PUT" path="/api/v1/users/me" desc="Обновление профиля" auth />
        <EndpointCard method="POST" path="/api/v1/users/me/avatar" desc="Загрузка аватара" auth />
      </div>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Update Profile — Request</h4>
        <pre className="text-sm font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`{
  "displayName": "John Doe",
  "bio": "Software developer",
  "country": "Russia",
  "city": "Moscow",
  "timezone": "Europe/Moscow"
}`}
        </pre>
      </Card>

      <Card className="border-[#FF6B35]/30 bg-[#FF6B35]/5">
        <h4 className="font-semibold text-[#FF6B35] mb-3">📸 Загрузка аватара</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• Валидация MIME по содержимому (magic numbers)</li>
          <li>• Ограничение размера: 10 MB</li>
          <li>• Разрешенные типы: JPEG, PNG, WebP</li>
          <li>• Хранение в S3 (MinIO)</li>
          <li>• Audit log при загрузке</li>
        </ul>
      </Card>
    </div>
  );
}

function GuardsSection() {
  return (
    <div>
      <SectionHeader num="06" title="Guards" />
      
      <div className="space-y-4">
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 flex items-center justify-center">
              <span className="text-[#6366F1] font-bold">🔐</span>
            </div>
            <h3 className="font-display font-semibold text-[#1A1A1A]">JwtAuthGuard</h3>
          </div>
          <p className="text-sm text-[#666] mb-3">Проверяет валидность JWT access token</p>
          <pre className="text-xs font-mono bg-[#F5F5F0] p-3 rounded-lg">
{`@UseGuards(JwtAuthGuard)
@Get('protected')
getProtected() {
  return 'Protected resource';
}`}
          </pre>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#2D9B6E]/10 flex items-center justify-center">
              <span className="text-[#2D9B6E] font-bold">👥</span>
            </div>
            <h3 className="font-display font-semibold text-[#1A1A1A]">RolesGuard</h3>
          </div>
          <p className="text-sm text-[#666] mb-3">Проверяет наличие необходимых ролей</p>
          <pre className="text-xs font-mono bg-[#F5F5F0] p-3 rounded-lg">
{`@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
@Get('admin')
getAdmin() {
  return 'Admin resource';
}`}
          </pre>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#E63946]/10 flex items-center justify-center">
              <span className="text-[#E63946] font-bold">⚡</span>
            </div>
            <h3 className="font-display font-semibold text-[#1A1A1A]">RateLimitGuard</h3>
          </div>
          <p className="text-sm text-[#666] mb-3">Ограничивает частоту запросов</p>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="border border-[#E5E5E5] rounded-lg p-3">
              <p className="text-xs text-[#666]">Auth endpoints</p>
              <p className="text-lg font-bold text-[#1A1A1A]">5/мин</p>
            </div>
            <div className="border border-[#E5E5E5] rounded-lg p-3">
              <p className="text-xs text-[#666]">API endpoints</p>
              <p className="text-lg font-bold text-[#1A1A1A]">100/мин</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SecuritySection() {
  return (
    <div>
      <SectionHeader num="07" title="Безопасность" />
      
      <div className="space-y-4">
        <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
          <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Хеширование паролей</h4>
          <ul className="text-sm text-[#444] space-y-1.5">
            <li>• Алгоритм: <code className="font-mono bg-white px-1.5 py-0.5 rounded">Argon2id</code></li>
            <li>• Уникальная соль на каждую запись</li>
            <li>• Memory: 64 MB, Time: 3, Parallelism: 4</li>
          </ul>
        </Card>

        <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
          <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ JWT Security</h4>
          <ul className="text-sm text-[#444] space-y-1.5">
            <li>• Access: короткоживущий (15 мин)</li>
            <li>• Refresh: ротируется при каждом использовании</li>
            <li>• Refresh хранится в httpOnly Secure SameSite=Strict cookie</li>
            <li>• При утечке — отзыв всей семьи токенов</li>
          </ul>
        </Card>

        <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
          <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Audit Log</h4>
          <p className="text-sm text-[#444] mb-3">Все события аутентификации логируются:</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              "user.register",
              "user.login",
              "user.logout",
              "user.refresh",
              "user.totp_initiated",
              "user.totp_enabled",
              "user.totp_disabled",
              "user.profile_updated",
              "user.avatar_updated",
              "security.refresh_token_reuse",
            ].map((event) => (
              <code key={event} className="px-2 py-1 bg-white border border-[#E5E5E5] rounded text-xs font-mono text-[#1A1A1A]">
                {event}
              </code>
            ))}
          </div>
        </Card>

        <Card className="border-[#E63946]/30 bg-[#E63946]/5">
          <h4 className="font-semibold text-[#E63946] mb-3">🚫 ЗАПРЕЩЕНО</h4>
          <ul className="text-sm text-[#444] space-y-1.5">
            <li>• ❌ Использовать bcrypt</li>
            <li>• ❌ Хранить refresh token в localStorage</li>
            <li>• ❌ Логировать пароли/токены</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function TestsSection() {
  return (
    <div>
      <SectionHeader num="08" title="Тестирование" />
      
      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">E2E тесты</h4>
        <pre className="text-sm font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`cd apps/api
npm run test:e2e`}
        </pre>
      </Card>

      <div className="space-y-3 mb-8">
        {[
          { test: "Регистрация (успех, дубликат, слабый пароль)", count: 3 },
          { test: "Вход (успех, неверный пароль, несуществующий)", count: 3 },
          { test: "Получение текущего пользователя", count: 2 },
          { test: "Refresh token (успех, ротация, повторное использование)", count: 3 },
          { test: "Logout", count: 1 },
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
          <li>• E2E тесты: register → login → refresh → me → logout</li>
          <li>• Тест ротации refresh токенов</li>
          <li>• Тест отзыва всех сессий при утечке</li>
          <li>• Коммит: <code className="font-mono bg-white px-1.5 py-0.5 rounded">feat(api): auth module with 2FA and rate limiting</code></li>
        </ul>
      </Card>
    </div>
  );
}

const sectionComponents: Record<string, React.FC> = {
  overview: OverviewSection,
  registration: RegistrationSection,
  login: LoginSection,
  jwt: JwtSection,
  "2fa": TwoFaSection,
  users: UsersSection,
  guards: GuardsSection,
  security: SecuritySection,
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
              <p className="text-[10px] text-[#999] uppercase tracking-wider">Auth Module</p>
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
            <span className="text-xs text-[#999] font-mono">JWT + TOTP + Rate Limit</span>
            <span className="px-2 py-1 bg-[#2D9B6E]/10 text-[#2D9B6E] text-xs font-medium rounded-md">SECURE</span>
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

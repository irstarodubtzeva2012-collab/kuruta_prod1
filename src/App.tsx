import { useState } from "react";

const sections = [
  { id: "overview", num: "00", title: "Обзор" },
  { id: "docker", num: "01", title: "Docker" },
  { id: "cicd", num: "02", title: "CI/CD" },
  { id: "monitoring", num: "03", title: "Мониторинг" },
  { id: "backups", num: "04", title: "Бэкапы" },
  { id: "docs", num: "05", title: "Документация" },
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
    done: { bg: "bg-[#2D9B6E]/10", text: "text-[#2D9B6E]", label: "✓ Готово" },
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
      <SectionHeader num="00" title="Production Deploy" />
      <p className="text-lg text-[#444] mb-8 leading-relaxed">
        Production-деплой для KURUTA с multi-stage builds, CI/CD, мониторингом и бэкапами.
      </p>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Dockerfiles", value: "3" },
          { label: "CI/CD Jobs", value: "5" },
          { label: "Backup Scripts", value: "2" },
          { label: "Docs", value: "2" },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-[#666] mb-1">{item.label}</p>
            <p className="text-3xl font-bold text-[#1A1A1A] font-display">{item.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-8 border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Что реализовано</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• <strong>Multi-stage builds</strong> для минимизации размера образов</li>
          <li>• <strong>Non-root user</strong> для безопасности</li>
          <li>• <strong>Healthchecks</strong> для всех сервисов</li>
          <li>• <strong>Resource limits</strong> для предотвращения OOM</li>
          <li>• <strong>CI/CD pipeline</strong> с автоматическим деплоем</li>
          <li>• <strong>Автоматические бэкапы</strong> PostgreSQL и S3</li>
          <li>• <strong>Мониторинг</strong> через health endpoints и Sentry</li>
          <li>• <strong>Полная документация</strong> DEPLOY.md и RUNBOOK.md</li>
        </ul>
      </Card>

      <div className="space-y-3">
        {[
          { task: "docker-compose.prod.yml", status: "done" as const },
          { task: "Multi-stage Dockerfiles (API, Web, Admin)", status: "done" as const },
          { task: "Caddyfile для reverse proxy", status: "done" as const },
          { task: "GitHub Actions CI/CD pipeline", status: "done" as const },
          { task: "Backup scripts (PostgreSQL, S3)", status: "done" as const },
          { task: "DEPLOY.md", status: "done" as const },
          { task: "RUNBOOK.md", status: "done" as const },
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

function DockerSection() {
  return (
    <div>
      <SectionHeader num="01" title="Docker Configuration" />
      
      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">Multi-stage Build</h4>
        <pre className="text-xs font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S kuruta -u 1001
COPY --from=builder --chown=kuruta:nodejs /app/dist ./dist
USER kuruta
HEALTHCHECK --interval=30s --timeout=10s \\
  CMD curl -f http://localhost:4000/health || exit 1
CMD ["node", "dist/main.js"]`}
        </pre>
      </Card>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">Resource Limits</h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border border-[#E5E5E5] rounded-lg p-4">
            <h5 className="font-semibold text-[#1A1A1A] mb-2">API</h5>
            <div className="text-sm text-[#666]">
              <p>CPU: 2 cores</p>
              <p>Memory: 2 GB</p>
            </div>
          </div>
          <div className="border border-[#E5E5E5] rounded-lg p-4">
            <h5 className="font-semibold text-[#1A1A1A] mb-2">Web</h5>
            <div className="text-sm text-[#666]">
              <p>CPU: 2 cores</p>
              <p>Memory: 2 GB</p>
            </div>
          </div>
          <div className="border border-[#E5E5E5] rounded-lg p-4">
            <h5 className="font-semibold text-[#1A1A1A] mb-2">PostgreSQL</h5>
            <div className="text-sm text-[#666]">
              <p>CPU: 2 cores</p>
              <p>Memory: 4 GB</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Безопасность</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• Non-root user (kuruta:1001)</li>
          <li>• Healthchecks для всех сервисов</li>
          <li>• Resource limits для предотвращения OOM</li>
          <li>• Ports exposed только на localhost (127.0.0.1)</li>
          <li>• Network isolation через kuruta-network</li>
        </ul>
      </Card>
    </div>
  );
}

function CICDSection() {
  return (
    <div>
      <SectionHeader num="02" title="CI/CD Pipeline" />
      
      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">Pipeline Stages</h4>
        <div className="space-y-4">
          {[
            { stage: "1. Test & Lint", desc: "npm test, npm run lint, npm run typecheck" },
            { stage: "2. Build & Push", desc: "Docker build, push to GHCR" },
            { stage: "3. Deploy Staging", desc: "Deploy to staging server (develop branch)" },
            { stage: "4. Deploy Production", desc: "Deploy to production server (main branch)" },
            { stage: "5. Security Scan", desc: "Trivy vulnerability scanner, npm audit" },
          ].map((item) => (
            <div key={item.stage} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[#FF6B35] font-bold text-sm">{item.stage[0]}</span>
              </div>
              <div>
                <h5 className="font-semibold text-[#1A1A1A]">{item.stage}</h5>
                <p className="text-sm text-[#666]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">Deployment Strategy</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-[#6366F1]/30 bg-[#6366F1]/5 rounded-lg p-4">
            <h5 className="font-semibold text-[#6366F1] mb-2">Staging</h5>
            <ul className="text-sm text-[#444] space-y-1">
              <li>• Branch: develop</li>
              <li>• Auto-deploy on push</li>
              <li>• Full deployment</li>
            </ul>
          </div>
          <div className="border border-[#2D9B6E]/30 bg-[#2D9B6E]/5 rounded-lg p-4">
            <h5 className="font-semibold text-[#2D9B6E] mb-2">Production</h5>
            <ul className="text-sm text-[#444] space-y-1">
              <li>• Branch: main</li>
              <li>• Auto-deploy on push</li>
              <li>• Zero downtime deployment</li>
              <li>• Backup before deploy</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Zero Downtime Deployment</h4>
        <pre className="text-xs font-mono bg-white p-3 rounded-lg overflow-x-auto">
{`# Update only specific services
docker-compose -f docker-compose.prod.yml \\
  up -d --no-deps --build api web admin`}
        </pre>
      </Card>
    </div>
  );
}

function MonitoringSection() {
  return (
    <div>
      <SectionHeader num="03" title="Мониторинг" />
      
      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">Health Endpoints</h4>
        <div className="space-y-2">
          {[
            { endpoint: "/api/v1/health", desc: "API health check" },
            { endpoint: "/health", desc: "Database health check" },
            { endpoint: "/minio/health/live", desc: "MinIO health check" },
          ].map((item) => (
            <div key={item.endpoint} className="flex items-center gap-3">
              <code className="text-xs font-mono text-[#FF6B35] bg-[#FF6B35]/5 px-2 py-1 rounded">
                {item.endpoint}
              </code>
              <span className="text-sm text-[#666]">{item.desc}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">Sentry Integration</h4>
        <p className="text-sm text-[#666] mb-3">Все ошибки автоматически отправляются в Sentry:</p>
        <pre className="text-xs font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`# .env
SENTRY_DSN=https://<key>@sentry.io/<project>

# Автоматическая отправка ошибок
# Структурированные JSON логи
# Performance monitoring`}
        </pre>
      </Card>

      <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Structured Logging</h4>
        <pre className="text-xs font-mono bg-white p-3 rounded-lg overflow-x-auto">
{`{
  "level": "info",
  "message": "User logged in",
  "timestamp": "2024-01-15T10:30:00Z",
  "userId": "uuid",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}`}
        </pre>
      </Card>
    </div>
  );
}

function BackupsSection() {
  return (
    <div>
      <SectionHeader num="04" title="Бэкапы" />
      
      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">PostgreSQL Backups</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#444]">Frequency</span>
            <span className="text-sm font-medium">Every 6 hours</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#444]">Retention</span>
            <span className="text-sm font-medium">30 days</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#444]">Format</span>
            <span className="text-sm font-medium">SQL dump (gzipped)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#444]">Storage</span>
            <span className="text-sm font-medium">Local + S3</span>
          </div>
        </div>
      </Card>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">S3 Backups</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#444]">Frequency</span>
            <span className="text-sm font-medium">Daily at 2:00 AM</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#444]">Retention</span>
            <span className="text-sm font-medium">30 days</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#444]">Format</span>
            <span className="text-sm font-medium">Tar archive (gzipped)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#444]">Storage</span>
            <span className="text-sm font-medium">Local + External S3</span>
          </div>
        </div>
      </Card>

      <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Manual Backup</h4>
        <pre className="text-xs font-mono bg-white p-3 rounded-lg overflow-x-auto">
{`# Backup PostgreSQL
docker exec kuruta-backup /usr/local/bin/backup-postgres.sh

# Backup S3
docker exec kuruta-backup /usr/local/bin/backup-s3.sh`}
        </pre>
      </Card>
    </div>
  );
}

function DocsSection() {
  return (
    <div>
      <SectionHeader num="05" title="Документация" />
      
      <div className="space-y-4">
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 flex items-center justify-center">
              <span className="text-[#6366F1] font-bold">📖</span>
            </div>
            <h3 className="font-display font-semibold text-[#1A1A1A]">DEPLOY.md</h3>
          </div>
          <p className="text-sm text-[#666] mb-3">Полное руководство по деплою:</p>
          <ul className="text-sm text-[#444] space-y-1">
            <li>• Требования к серверу</li>
            <li>• Подготовка сервера</li>
            <li>• Конфигурация</li>
            <li>• Деплой</li>
            <li>• Мониторинг</li>
            <li>• Бэкапы</li>
            <li>• Обновление и откат</li>
          </ul>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#E63946]/10 flex items-center justify-center">
              <span className="text-[#E63946] font-bold">🚨</span>
            </div>
            <h3 className="font-display font-semibold text-[#1A1A1A]">RUNBOOK.md</h3>
          </div>
          <p className="text-sm text-[#666] mb-3">Руководство для операций:</p>
          <ul className="text-sm text-[#444] space-y-1">
            <li>• Ежедневные операции</li>
            <li>• Мониторинг и метрики</li>
            <li>• Обработка инцидентов (5 сценариев)</li>
            <li>• Плановое обслуживание</li>
            <li>• Аварийное восстановление</li>
          </ul>
        </Card>

        <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
          <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Критерии приёмки</h4>
          <ul className="text-sm text-[#444] space-y-1.5">
            <li>• Проект собирается и запускается в production-конфигурации</li>
            <li>• Коммит: <code className="font-mono bg-white px-1.5 py-0.5 rounded">chore: production deploy and monitoring</code></li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

const sectionComponents: Record<string, React.FC> = {
  overview: OverviewSection,
  docker: DockerSection,
  cicd: CICDSection,
  monitoring: MonitoringSection,
  backups: BackupsSection,
  docs: DocsSection,
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
              <p className="text-[10px] text-[#999] uppercase tracking-wider">Production Deploy</p>
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
            <span className="text-xs text-[#999] font-mono">Production Ready</span>
            <span className="px-2 py-1 bg-[#2D9B6E]/10 text-[#2D9B6E] text-xs font-medium rounded-md">DEPLOYED</span>
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

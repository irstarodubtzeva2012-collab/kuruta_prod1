import { useState } from "react";

const sections = [
  { id: "overview", num: "00", title: "Обзор" },
  { id: "users", num: "01", title: "Пользователи" },
  { id: "direction-a", num: "02", title: "Направление A" },
  { id: "direction-b", num: "03", title: "Направление B" },
  { id: "finance", num: "04", title: "Финансы" },
  { id: "moderation", num: "05", title: "Модерация" },
  { id: "system", num: "06", title: "Системные" },
  { id: "indexes", num: "07", title: "Индексы" },
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

function ModelCard({ name, fields, relations, indexes, color }: { 
  name: string; 
  fields: string[]; 
  relations?: string[];
  indexes?: string[];
  color: string;
}) {
  return (
    <Card className="mb-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <span className="text-lg font-bold" style={{ color }}>{name[0]}</span>
        </div>
        <div>
          <h3 className="font-display font-semibold text-[#1A1A1A]">{name}</h3>
          <p className="text-xs text-[#999]">{fields.length} полей</p>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        {fields.map((field) => (
          <div key={field} className="flex items-center gap-2 text-sm">
            <code className="font-mono text-xs text-[#1A1A1A] bg-[#F5F5F0] px-2 py-1 rounded">{field}</code>
          </div>
        ))}
      </div>

      {relations && relations.length > 0 && (
        <div className="pt-4 border-t border-[#E5E5E5]">
          <p className="text-xs text-[#999] mb-2">Связи:</p>
          <div className="flex flex-wrap gap-1.5">
            {relations.map((rel) => (
              <span key={rel} className="px-2 py-1 bg-[#6366F1]/10 text-[#6366F1] text-xs rounded font-mono">
                {rel}
              </span>
            ))}
          </div>
        </div>
      )}

      {indexes && indexes.length > 0 && (
        <div className="pt-4 border-t border-[#E5E5E5]">
          <p className="text-xs text-[#999] mb-2">Индексы:</p>
          <div className="flex flex-wrap gap-1.5">
            {indexes.map((idx) => (
              <span key={idx} className="px-2 py-1 bg-[#F59E0B]/10 text-[#F59E0B] text-xs rounded font-mono">
                {idx}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function OverviewSection() {
  return (
    <div>
      <SectionHeader num="00" title="Схема базы данных" />
      <p className="text-lg text-[#444] mb-8 leading-relaxed">
        PostgreSQL 16. Prisma ORM. 18 моделей. Баланс вычисляется через FinancialTransaction.
      </p>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Моделей", value: "18" },
          { label: "Enum типов", value: "14" },
          { label: "Связей", value: "25+" },
          { label: "Индексов", value: "50+" },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-[#666] mb-1">{item.label}</p>
            <p className="text-3xl font-bold text-[#1A1A1A] font-display">{item.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-8 border-[#E63946]/30 bg-[#E63946]/5">
        <h4 className="font-semibold text-[#E63946] mb-2">⚠️ Критично: Финансовая модель</h4>
        <ul className="text-sm text-[#444] space-y-1">
          <li>• Баланс пользователя <strong>НЕ хранится</strong> как поле в User</li>
          <li>• Баланс вычисляется через агрегацию FinancialTransaction</li>
          <li>• Все операции в ACID-транзакциях</li>
          <li>• Идемпотентность через idempotencyKey (unique)</li>
          <li>• Double-entry: каждая транзакция имеет тип (debit/credit)</li>
        </ul>
      </Card>

      <div className="space-y-3">
        {[
          { task: "Все обязательные сущности", status: "done" as const },
          { task: "Decimal(14,2) для денег", status: "done" as const },
          { task: "Индексы на FK и составные", status: "done" as const },
          { task: "Cascade delete только где безопасно", status: "done" as const },
          { task: "AuditLog append-only (нет updatedAt)", status: "done" as const },
          { task: "FSM статусы из Конституции", status: "done" as const },
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

function UsersSection() {
  return (
    <div>
      <SectionHeader num="01" title="Пользователи и роли" />
      <p className="text-[#444] mb-8">Единый аккаунт с возможностью совмещения ролей. Баланс привязан к userId.</p>

      <ModelCard
        name="User"
        color="#6366F1"
        fields={[
          "id: uuid (PK)",
          "email: string (unique)",
          "phone: string? (unique)",
          "passwordHash: string",
          "status: UserStatus",
          "totpSecret: string? (encrypted)",
          "totpEnabled: boolean",
          "createdAt, updatedAt",
        ]}
        relations={["profile", "roles", "ambassadorProfile", "platformOwnerProfile", "campaigns", "tasks", "adSlots", "deals", "transactions", "payouts"]}
        indexes={["email", "phone", "status", "createdAt"]}
      />

      <ModelCard
        name="UserProfile"
        color="#6366F1"
        fields={[
          "id: uuid (PK)",
          "userId: string (unique, FK)",
          "displayName: string?",
          "avatarUrl: string?",
          "bio: string?",
          "country, city, timezone: string?",
          "createdAt, updatedAt",
        ]}
        relations={["user (Cascade)"]}
        indexes={["userId"]}
      />

      <ModelCard
        name="UserRoleAssignment"
        color="#6366F1"
        fields={[
          "id: uuid (PK)",
          "userId: string (FK)",
          "role: UserRole (enum)",
          "grantedAt: datetime",
          "grantedBy: string? (admin userId)",
        ]}
        relations={["user (Cascade)"]}
        indexes={["userId", "role", "unique(userId, role)"]}
      />

      <Card className="mt-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Роли (enum UserRole)</h4>
        <div className="flex flex-wrap gap-2">
          {["guest", "creator", "ambassador", "platform_owner", "moderator", "finance", "admin", "superadmin"].map((role) => (
            <code key={role} className="px-3 py-1.5 bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg text-xs font-mono text-[#1A1A1A]">
              {role}
            </code>
          ))}
        </div>
      </Card>
    </div>
  );
}

function DirectionASection() {
  return (
    <div>
      <SectionHeader num="02" title="Направление A: Задания" />
      <p className="text-[#444] mb-8">Креатор → Кампания → Задания → Амбассадоры выполняют → Проверка → Вознаграждение.</p>

      <ModelCard
        name="Campaign"
        color="#FF6B35"
        fields={[
          "id: uuid (PK)",
          "creatorId: string (FK)",
          "title, description: string",
          "status: CampaignStatus (FSM)",
          "budget: Decimal(14,2)",
          "taskCount: int",
          "taskReward: Decimal(14,2)",
          "requirements: jsonb?",
          "targetAudience: jsonb?",
          "startsAt, endsAt: datetime?",
          "createdAt, updatedAt",
        ]}
        relations={["creator (Restrict)", "tasks (Cascade)"]}
        indexes={["creatorId", "status", "createdAt", "startsAt+endsAt"]}
      />

      <ModelCard
        name="Task"
        color="#FF6B35"
        fields={[
          "id: uuid (PK)",
          "campaignId: string (FK)",
          "ambassadorId: string? (FK)",
          "status: TaskStatus (FSM)",
          "title, description: string",
          "requirements: jsonb?",
          "proofData: jsonb?",
          "reviewNotes: string?",
          "reviewedBy: string?",
          "takenAt, submittedAt, paidAt, dueAt: datetime?",
          "createdAt, updatedAt",
        ]}
        relations={["campaign (Cascade)", "ambassador (SetNull)"]}
        indexes={["campaignId", "ambassadorId", "status", "createdAt", "dueAt", "campaignId+status"]}
      />

      <ModelCard
        name="AmbassadorProfile"
        color="#2D9B6E"
        fields={[
          "id: uuid (PK)",
          "userId: string (unique, FK)",
          "isVerified: boolean",
          "socialLinks: jsonb?",
          "audienceSize: int?",
          "niches: string[]",
          "languages: string[]",
          "avgEngagement: Decimal(5,2)?",
          "rating: Decimal(3,2)?",
          "totalTasks, completedTasks: int",
          "createdAt, updatedAt",
        ]}
        relations={["user (Cascade)", "verifications", "tasks"]}
        indexes={["userId", "isVerified", "rating"]}
      />

      <ModelCard
        name="AmbassadorVerificationRequest"
        color="#2D9B6E"
        fields={[
          "id: uuid (PK)",
          "ambassadorId: string (FK)",
          "status: AmbassadorVerificationStatus",
          "socialLinks: jsonb?",
          "audienceProof: jsonb?",
          "niches: string[]",
          "documents: jsonb?",
          "reviewedBy: string?",
          "reviewedAt: datetime?",
          "rejectionReason: string?",
          "createdAt, updatedAt",
        ]}
        relations={["ambassador (Cascade)"]}
        indexes={["ambassadorId", "status", "createdAt"]}
      />
    </div>
  );
}

function DirectionBSection() {
  return (
    <div>
      <SectionHeader num="03" title="Направление B: Рекламные места" />
      <p className="text-[#444] mb-8">Владелец → Площадка → Рекламное место → Креатор бронирует → Сделка → Выполнение → Выплата.</p>

      <ModelCard
        name="PlatformOwnerProfile"
        color="#6366F1"
        fields={[
          "id: uuid (PK)",
          "userId: string (unique, FK)",
          "isVerified: boolean",
          "companyName: string?",
          "legalEntity: string?",
          "inn, ogrn: string? (Russian tax IDs)",
          "contactEmail, contactPhone: string?",
          "rating: Decimal(3,2)?",
          "totalDeals, completedDeals: int",
          "createdAt, updatedAt",
        ]}
        relations={["user (Cascade)", "platforms"]}
        indexes={["userId", "isVerified"]}
      />

      <ModelCard
        name="Platform"
        color="#6366F1"
        fields={[
          "id: uuid (PK)",
          "ownerId: string (FK)",
          "name: string",
          "type: string (telegram, instagram, etc.)",
          "url: string",
          "audienceSize: int",
          "audienceGeo: jsonb?",
          "audienceAge: jsonb?",
          "description: string?",
          "mediaKit: jsonb?",
          "isVerified: boolean",
          "createdAt, updatedAt",
        ]}
        relations={["owner (Cascade)", "adSlots"]}
        indexes={["ownerId", "type", "isVerified"]}
      />

      <ModelCard
        name="AdSlot"
        color="#FF6B35"
        fields={[
          "id: uuid (PK)",
          "platformId: string (FK)",
          "ownerId: string (FK, denormalized)",
          "title, description: string",
          "status: AdSlotStatus (FSM)",
          "pricePerDay: Decimal(14,2)",
          "currency: string (RUB)",
          "duration: string (1d, 3d, 7d)",
          "format: string (post, story, reel)",
          "availability: jsonb?",
          "requirements: jsonb?",
          "createdAt, updatedAt",
        ]}
        relations={["platform (Cascade)", "owner (Restrict)", "deals"]}
        indexes={["platformId", "ownerId", "status", "pricePerDay", "createdAt", "platformId+status"]}
      />

      <ModelCard
        name="Deal"
        color="#FF6B35"
        fields={[
          "id: uuid (PK)",
          "adSlotId: string (FK)",
          "buyerId: string (FK)",
          "status: DealStatus (FSM)",
          "startDate, endDate: datetime",
          "totalAmount: Decimal(14,2)",
          "commission: Decimal(14,2) (10%)",
          "contentBrief: string?",
          "proofData: jsonb?",
          "confirmedAt, completedAt: datetime?",
          "createdAt, updatedAt",
        ]}
        relations={["adSlot (Restrict)", "buyer (Restrict)"]}
        indexes={["adSlotId", "buyerId", "status", "startDate+endDate", "createdAt", "adSlotId+status"]}
      />
    </div>
  );
}

function FinanceSection() {
  return (
    <div>
      <SectionHeader num="04" title="Финансы" />
      <p className="text-[#444] mb-4">Double-entry journal. Все операции через FinancialTransaction.</p>
      <p className="text-sm text-[#E63946] mb-8 border border-[#E63946]/30 rounded-xl p-4 bg-[#E63946]/5">
        ⚠️ КРИТИЧНО: Баланс = SUM(deposit, reward, refund) − SUM(reserve, payout, fee). Запрещено хранить balance как поле.
      </p>

      <ModelCard
        name="FinancialTransaction"
        color="#E63946"
        fields={[
          "id: uuid (PK)",
          "idempotencyKey: string (unique)",
          "type: FinancialTransactionType (enum)",
          "userId: string (FK)",
          "amount: Decimal(14,2) (always positive)",
          "currency: string (RUB)",
          "status: FinancialTransactionStatus",
          "relatedEntityType: string?",
          "relatedEntityId: string?",
          "description: string?",
          "metadata: jsonb?",
          "createdAt: datetime",
        ]}
        relations={["user (Restrict)"]}
        indexes={["userId", "idempotencyKey", "type", "status", "createdAt", "userId+type", "userId+createdAt", "relatedEntityType+relatedEntityId"]}
      />

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Типы транзакций (enum)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { type: "deposit", desc: "Пополнение", sign: "+" },
            { type: "reward", desc: "Вознаграждение", sign: "+" },
            { type: "refund", desc: "Возврат", sign: "+" },
            { type: "reserve", desc: "Резервирование", sign: "−" },
            { type: "payout", desc: "Выплата", sign: "−" },
            { type: "fee", desc: "Комиссия", sign: "−" },
            { type: "release", desc: "Освобождение", sign: "+" },
            { type: "adjustment", desc: "Корректировка", sign: "±" },
          ].map((t) => (
            <div key={t.type} className="border border-[#E5E5E5] rounded-lg p-3">
              <code className="text-xs font-mono text-[#1A1A1A]">{t.type}</code>
              <p className="text-xs text-[#666] mt-1">{t.desc}</p>
              <p className={`text-sm font-bold mt-1 ${t.sign === "+" ? "text-[#2D9B6E]" : t.sign === "−" ? "text-[#E63946]" : "text-[#F59E0B]"}`}>
                {t.sign}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <ModelCard
        name="PayoutRequest"
        color="#E63946"
        fields={[
          "id: uuid (PK)",
          "userId: string (FK)",
          "amount: Decimal(14,2)",
          "currency: string (RUB)",
          "status: PayoutStatus (FSM)",
          "paymentMethod: string?",
          "requisites: jsonb? (masked)",
          "processedBy: string?",
          "processedAt: datetime?",
          "errorDetails: string?",
          "createdAt, updatedAt",
        ]}
        relations={["user (Restrict)"]}
        indexes={["userId", "status", "createdAt", "userId+status"]}
      />

      <Card className="mt-8 border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Правила финансовой безопасности</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• Все операции в ACID-транзакциях (prisma.$transaction)</li>
          <li>• Идемпотентность через idempotencyKey (unique)</li>
          <li>• Транзакции неизменяемы (immutable)</li>
          <li>• SELECT ... FOR UPDATE при работе с балансом</li>
          <li>• Минимальный вывод: 500 ₽</li>
          <li>• Ежедневная сверка (reconciliation cron)</li>
        </ul>
      </Card>
    </div>
  );
}

function ModerationSection() {
  return (
    <div>
      <SectionHeader num="05" title="Модерация и споры" />
      <p className="text-[#444] mb-8">Ручная проверка обязательна. Очередь модерации с приоритетами.</p>

      <ModelCard
        name="ModerationQueue"
        color="#F59E0B"
        fields={[
          "id: uuid (PK)",
          "entityType: ModerationQueueType (enum)",
          "entityId: string",
          "status: ModerationQueueStatus",
          "priority: int (higher = urgent)",
          "assignedTo: string? (moderator)",
          "assignedAt: datetime?",
          "reviewedAt: datetime?",
          "decision: string?",
          "decisionReason: string?",
          "metadata: jsonb?",
          "createdAt, updatedAt",
        ]}
        indexes={["entityType+entityId", "status", "priority+createdAt", "assignedTo", "createdAt"]}
      />

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Типы модерации (enum)</h4>
        <div className="flex flex-wrap gap-2">
          {[
            "ambassador_verification",
            "platform_owner_verification",
            "campaign",
            "task",
            "deal",
            "dispute",
            "payout",
          ].map((type) => (
            <code key={type} className="px-3 py-1.5 bg-[#F5F5F0] border border-[#E5E5E5] rounded-lg text-xs font-mono text-[#1A1A1A]">
              {type}
            </code>
          ))}
        </div>
      </Card>

      <ModelCard
        name="Dispute"
        color="#E63946"
        fields={[
          "id: uuid (PK)",
          "openedBy: string (FK)",
          "relatedType: string (task, deal)",
          "relatedId: string",
          "status: DisputeStatus (FSM)",
          "reason: string",
          "description: string?",
          "evidence: jsonb?",
          "resolution: string?",
          "resolvedBy: string?",
          "resolvedAt: datetime?",
          "createdAt, updatedAt",
        ]}
        relations={["opener (Restrict)"]}
        indexes={["openedBy", "relatedType+relatedId", "status", "createdAt"]}
      />
    </div>
  );
}

function SystemSection() {
  return (
    <div>
      <SectionHeader num="06" title="Системные сущности" />
      <p className="text-[#444] mb-8">Аудит, уведомления, антифрод, сессии.</p>

      <ModelCard
        name="AuditLog"
        color="#1A1A1A"
        fields={[
          "id: uuid (PK)",
          "userId: string? (FK)",
          "action: string",
          "entityType: string",
          "entityId: string",
          "before: jsonb? (previous state)",
          "after: jsonb? (new state)",
          "ip: string?",
          "userAgent: string?",
          "timestamp: datetime",
        ]}
        relations={["user (SetNull)"]}
        indexes={["userId", "entityType+entityId", "action", "timestamp", "userId+timestamp"]}
      />

      <Card className="mb-8 border-[#E63946]/30 bg-[#E63946]/5">
        <h4 className="font-semibold text-[#E63946] mb-2">⚠️ Append-only</h4>
        <p className="text-sm text-[#444]">AuditLog <strong>НЕ имеет updatedAt</strong>. Записи только добавляются, никогда не изменяются. Хранение — минимум 3 года.</p>
      </Card>

      <ModelCard
        name="Notification"
        color="#6366F1"
        fields={[
          "id: uuid (PK)",
          "userId: string (FK)",
          "type: NotificationType (enum)",
          "title: string",
          "body: string",
          "data: jsonb? (deep link, refs)",
          "readAt: datetime?",
          "createdAt: datetime",
        ]}
        relations={["user (Cascade)"]}
        indexes={["userId+readAt", "userId+createdAt", "type"]}
      />

      <ModelCard
        name="AntiFraudSignal"
        color="#E63946"
        fields={[
          "id: uuid (PK)",
          "userId: string? (FK)",
          "type: AntiFraudSignalType (enum)",
          "severity: AntiFraudSignalSeverity",
          "title: string",
          "description: string",
          "metadata: jsonb? (evidence)",
          "reviewedBy: string?",
          "reviewedAt: datetime?",
          "resolved: boolean",
          "resolution: string?",
          "createdAt, updatedAt",
        ]}
        relations={["user (SetNull)"]}
        indexes={["userId", "type", "severity", "resolved", "createdAt", "userId+type"]}
      />

      <ModelCard
        name="Session"
        color="#999"
        fields={[
          "id: uuid (PK)",
          "userId: string (FK)",
          "refreshToken: string (unique, hashed)",
          "userAgent: string?",
          "ip: string?",
          "expiresAt: datetime",
          "revokedAt: datetime?",
          "createdAt: datetime",
        ]}
        relations={["user (Cascade)"]}
        indexes={["userId", "expiresAt"]}
      />
    </div>
  );
}

function IndexesSection() {
  return (
    <div>
      <SectionHeader num="07" title="Индексы и оптимизация" />
      <p className="text-[#444] mb-8">Индексы на всех FK, email/phone (unique), составные индексы для частых запросов.</p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {[
          { category: "Unique индексы", items: ["User.email", "User.phone", "FinancialTransaction.idempotencyKey", "Session.refreshToken"] },
          { category: "Составные индексы", items: ["Task(campaignId, status)", "Deal(adSlotId, status)", "FinancialTransaction(userId, createdAt)", "AuditLog(userId, timestamp)"] },
          { category: "FK индексы", items: ["Все foreign key поля", "userId в связанных таблицах", "campaignId, adSlotId, etc."] },
          { category: "Статусные индексы", items: ["Все status поля", "createdAt для сортировки", "priority+createdAt для очереди"] },
        ].map((group) => (
          <Card key={group.category}>
            <h4 className="font-display font-semibold text-[#1A1A1A] mb-3 text-sm uppercase tracking-wider">{group.category}</h4>
            <div className="space-y-2">
              {group.items.map((item) => (
                <code key={item} className="block text-xs font-mono text-[#1A1A1A] bg-[#F5F5F0] px-2 py-1 rounded">
                  {item}
                </code>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Критерии приёмки</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• <code className="font-mono bg-white px-1.5 py-0.5 rounded">npx prisma validate</code> — без ошибок</li>
          <li>• <code className="font-mono bg-white px-1.5 py-0.5 rounded">npx prisma migrate dev --name init</code> — проходит</li>
          <li>• Все 18 сущностей присутствуют</li>
          <li>• Деньги только Decimal(14,2)</li>
          <li>• Баланс НЕ хранится в User</li>
          <li>• AuditLog append-only (нет updatedAt)</li>
          <li>• Cascade delete только где безопасно</li>
          <li>• Коммит: <code className="font-mono bg-white px-1.5 py-0.5 rounded">feat(database): initial schema</code></li>
        </ul>
      </Card>

      <Card className="mt-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Следующие шаги</h4>
        <div className="space-y-2">
          {[
            { step: "Применить миграцию", cmd: "cd packages/database && npx prisma migrate dev --name init" },
            { step: "Сгенерировать клиент", cmd: "npx prisma generate" },
            { step: "Открыть Studio", cmd: "npx prisma studio" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="font-mono text-xs text-[#FF6B35] bg-[#FF6B35]/10 px-2 py-0.5 rounded">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-sm text-[#1A1A1A] flex-1">{item.step}</span>
              <code className="text-xs font-mono text-[#666] bg-[#F5F5F0] px-2 py-1 rounded">{item.cmd}</code>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

const sectionComponents: Record<string, React.FC> = {
  overview: OverviewSection,
  users: UsersSection,
  "direction-a": DirectionASection,
  "direction-b": DirectionBSection,
  finance: FinanceSection,
  moderation: ModerationSection,
  system: SystemSection,
  indexes: IndexesSection,
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
              <p className="text-[10px] text-[#999] uppercase tracking-wider">Database Schema</p>
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
            <span className="text-xs text-[#999] font-mono">PostgreSQL 16 + Prisma</span>
            <span className="px-2 py-1 bg-[#2D9B6E]/10 text-[#2D9B6E] text-xs font-medium rounded-md">18 MODELS</span>
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

import { useState } from "react";

const sections = [
  { id: "overview", num: "00", title: "Обзор" },
  { id: "design", num: "01", title: "Дизайн-система" },
  { id: "roles", num: "02", title: "Переключение ролей" },
  { id: "pages", num: "03", title: "Страницы" },
  { id: "catalog", num: "04", title: "Единый маркетплейс" },
  { id: "tech", num: "05", title: "Технологии" },
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
      <SectionHeader num="00" title="Фронтенд KURUTA" />
      <p className="text-lg text-[#444] mb-8 leading-relaxed">
        Next.js 14+ фронтенд с дизайн-системой и бесшовным переключением ролей согласно Конституции KURUTA.
      </p>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Ролей", value: "3" },
          { label: "Страниц", value: "15+" },
          { label: "Компонентов", value: "20+" },
          { label: "Форм", value: "5+" },
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
          <li>• <strong>Дизайн-система</strong> строго по разделу 6 Конституции</li>
          <li>• <strong>Переключение ролей</strong> в один клик с изменением URL</li>
          <li>• <strong>Единый баланс</strong> для всех ролей</li>
          <li>• <strong>Единый маркетплейс</strong> с защитой от самопокупки</li>
          <li>• <strong>React Hook Form + Zod</strong> для валидации</li>
          <li>• <strong>TanStack Query</strong> для управления данными</li>
          <li>• <strong>Skeleton screens</strong> вместо спиннеров</li>
        </ul>
      </Card>

      <div className="space-y-3">
        {[
          { task: "Дизайн-система (цвета, шрифты, компоненты)", status: "done" as const },
          { task: "RoleContext и RoleSwitcher", status: "done" as const },
          { task: "Лейауты для каждой роли", status: "done" as const },
          { task: "Дашборды для Creator, Ambassador, Owner", status: "done" as const },
          { task: "Каталог рекламных мест с фильтрами", status: "done" as const },
          { task: "Бейдж 'Ваше место' для собственных слотов", status: "done" as const },
          { task: "React Hook Form + Zod для форм", status: "done" as const },
          { task: "TanStack Query для данных", status: "done" as const },
          { task: "Skeleton screens", status: "done" as const },
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

function DesignSection() {
  return (
    <div>
      <SectionHeader num="01" title="Дизайн-система" />
      <p className="text-[#444] mb-8">Строго следует разделу 6 Конституции KURUTA.</p>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">Цвета</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Primary", color: "#1A1A1A", usage: "Текст" },
            { name: "Background", color: "#F5F5F0", usage: "Фон" },
            { name: "Accent", color: "#FF6B35", usage: "Акцент" },
            { name: "Success", color: "#2D9B6E", usage: "Успех" },
            { name: "Error", color: "#E63946", usage: "Ошибка" },
            { name: "Warning", color: "#F59E0B", usage: "Предупреждение" },
            { name: "Info", color: "#6366F1", usage: "Информация" },
            { name: "Border", color: "#E5E5E5", usage: "Границы" },
          ].map((item) => (
            <div key={item.name} className="border border-[#E5E5E5] rounded-lg p-3">
              <div
                className="w-full h-12 rounded-lg mb-2"
                style={{ backgroundColor: item.color }}
              ></div>
              <div className="text-sm font-semibold">{item.name}</div>
              <div className="text-xs text-[#666]">{item.color}</div>
              <div className="text-xs text-[#999] mt-1">{item.usage}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">Шрифты</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-[#E5E5E5] rounded-lg p-4">
            <div className="text-3xl font-sans mb-2">Inter</div>
            <div className="text-sm text-[#666]">Основной шрифт (body)</div>
          </div>
          <div className="border border-[#E5E5E5] rounded-lg p-4">
            <div className="text-3xl font-display mb-2">Space Grotesk</div>
            <div className="text-sm text-[#666]">Заголовки (headings)</div>
          </div>
        </div>
      </Card>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">Компоненты</h4>
        <div className="space-y-4">
          <div>
            <h5 className="text-sm font-semibold mb-2">Карточки</h5>
            <div className="border border-[#E5E5E5] rounded-xl p-6 hover:border-[#1A1A1A]/20 transition-colors duration-200">
              <div className="text-sm text-[#666] mb-2">Пример карточки</div>
              <div className="text-lg font-semibold">Без box-shadow, border-radius: 12px</div>
            </div>
          </div>

          <div>
            <h5 className="text-sm font-semibold mb-2">Кнопки</h5>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#E55A2B] transition-colors duration-200">
                Primary
              </button>
              <button className="px-4 py-2 bg-white border border-[#E5E5E5] text-[#1A1A1A] rounded-lg font-medium hover:border-[#1A1A1A]/40 transition-colors duration-200">
                Secondary
              </button>
              <button className="px-4 py-2 bg-[#2D9B6E] text-white rounded-lg font-medium hover:bg-[#248058] transition-colors duration-200">
                Success
              </button>
            </div>
          </div>

          <div>
            <h5 className="text-sm font-semibold mb-2">Бейджи</h5>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-[#2D9B6E]/10 text-[#2D9B6E] text-xs rounded-lg font-medium">Success</span>
              <span className="px-2 py-1 bg-[#E63946]/10 text-[#E63946] text-xs rounded-lg font-medium">Error</span>
              <span className="px-2 py-1 bg-[#F59E0B]/10 text-[#F59E0B] text-xs rounded-lg font-medium">Warning</span>
              <span className="px-2 py-1 bg-[#6366F1]/10 text-[#6366F1] text-xs rounded-lg font-medium">Info</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-[#E63946]/30 bg-[#E63946]/5">
        <h4 className="font-semibold text-[#E63946] mb-3">🚫 ЗАПРЕЩЕНО</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• ❌ Glass-morphism (blur)</li>
          <li>• ❌ Градиенты на фонах</li>
          <li>• ❌ Box-shadow на карточках</li>
          <li>• ❌ Радиусы &gt; 16px</li>
          <li>• ❌ Stock-фото</li>
          <li>• ❌ Анимации &gt; 300ms</li>
        </ul>
      </Card>
    </div>
  );
}

function RolesSection() {
  return (
    <div>
      <SectionHeader num="02" title="Переключение ролей" />
      <p className="text-[#444] mb-8">Следует разделу 5 Конституции (Единый аккаунт).</p>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">Как работает</h4>
        <div className="space-y-4">
          {[
            { step: "1", desc: "Пользователь имеет массив ролей (creator, ambassador, owner)" },
            { step: "2", desc: "RoleContext хранит текущую выбранную роль" },
            { step: "3", desc: "RoleSwitcher в шапке показывает dropdown с доступными ролями" },
            { step: "4", desc: "При переключении URL меняется на /creator/..., /ambassador/..., /owner/..." },
            { step: "5", desc: "Навигация и дашборд перестраиваются под выбранную роль" },
            { step: "6", desc: "Баланс остаётся единым для всех ролей" },
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

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { role: "Креатор", icon: "🎨", color: "#FF6B35", desc: "Покупает рекламные места" },
          { role: "Амбассадор", icon: "🚀", color: "#2D9B6E", desc: "Выполняет задания" },
          { role: "Владелец", icon: "🏢", color: "#6366F1", desc: "Продаёт рекламные места" },
        ].map((item) => (
          <Card key={item.role}>
            <div className="text-center">
              <div className="text-4xl mb-3">{item.icon}</div>
              <h4 className="font-display font-semibold text-[#1A1A1A] mb-2">{item.role}</h4>
              <p className="text-sm text-[#666]">{item.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Единый баланс</h4>
        <p className="text-sm text-[#444]">
          Баланс привязан к userId, а не к роли. Деньги от продаж и покупок копятся на одном счёте, независимо от выбранной роли.
        </p>
      </Card>
    </div>
  );
}

function PagesSection() {
  return (
    <div>
      <SectionHeader num="03" title="Страницы по ролям" />
      
      <div className="space-y-8">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🎨</span>
            <h3 className="font-display font-semibold text-xl text-[#1A1A1A]">Креатор</h3>
          </div>
          <div className="space-y-2">
            {[
              { path: "/creator", desc: "Дашборд с балансом и статистикой" },
              { path: "/creator/catalog", desc: "Каталог рекламных мест" },
              { path: "/creator/deals", desc: "Мои сделки" },
              { path: "/creator/balance", desc: "Баланс и транзакции" },
            ].map((item) => (
              <div key={item.path} className="flex items-center gap-3 p-3 border border-[#E5E5E5] rounded-lg">
                <code className="text-sm font-mono text-[#FF6B35] bg-[#FF6B35]/5 px-2 py-1 rounded">{item.path}</code>
                <span className="text-sm text-[#666]">{item.desc}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🚀</span>
            <h3 className="font-display font-semibold text-xl text-[#1A1A1A]">Амбассадор</h3>
          </div>
          <div className="space-y-2">
            {[
              { path: "/ambassador", desc: "Дашборд с балансом и заданиями" },
              { path: "/ambassador/tasks", desc: "Доступные задания" },
              { path: "/ambassador/my-tasks", desc: "Мои задания" },
              { path: "/ambassador/balance", desc: "Баланс и транзакции" },
            ].map((item) => (
              <div key={item.path} className="flex items-center gap-3 p-3 border border-[#E5E5E5] rounded-lg">
                <code className="text-sm font-mono text-[#2D9B6E] bg-[#2D9B6E]/5 px-2 py-1 rounded">{item.path}</code>
                <span className="text-sm text-[#666]">{item.desc}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🏢</span>
            <h3 className="font-display font-semibold text-xl text-[#1A1A1A]">Владелец</h3>
          </div>
          <div className="space-y-2">
            {[
              { path: "/owner", desc: "Дашборд с балансом и сделками" },
              { path: "/owner/platforms", desc: "Мои площадки" },
              { path: "/owner/slots", desc: "Рекламные места" },
              { path: "/owner/deals", desc: "Сделки" },
              { path: "/owner/balance", desc: "Баланс и транзакции" },
            ].map((item) => (
              <div key={item.path} className="flex items-center gap-3 p-3 border border-[#E5E5E5] rounded-lg">
                <code className="text-sm font-mono text-[#6366F1] bg-[#6366F1]/5 px-2 py-1 rounded">{item.path}</code>
                <span className="text-sm text-[#666]">{item.desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function CatalogSection() {
  return (
    <div>
      <SectionHeader num="04" title="Единый маркетплейс" />
      <p className="text-[#444] mb-8">Каталог рекламных мест на странице /creator/catalog.</p>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">Фильтры</h4>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-[#666] mb-2 block">Платформа</label>
            <select className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm">
              <option>Все</option>
              <option>Telegram</option>
              <option>Instagram</option>
              <option>YouTube</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-[#666] mb-2 block">Мин. цена</label>
            <input type="number" className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm" placeholder="0" />
          </div>
          <div>
            <label className="text-sm text-[#666] mb-2 block">Макс. цена</label>
            <input type="number" className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm" placeholder="100000" />
          </div>
          <div>
            <label className="text-sm text-[#666] mb-2 block">Формат</label>
            <select className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm">
              <option>Все</option>
              <option>Пост</option>
              <option>Сторис</option>
              <option>Reels</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card>
          <div className="mb-3">
            <span className="px-2 py-1 bg-[#6366F1]/10 text-[#6366F1] text-xs rounded-lg font-medium">Telegram</span>
            <span className="text-sm text-[#666] ml-2">50,000 подписчиков</span>
          </div>
          <h4 className="font-display font-semibold text-[#1A1A1A] mb-2">Пост в канале о технологиях</h4>
          <p className="text-sm text-[#666] mb-4">Размещение поста в канале с аудиторией 50к</p>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold">5,000 ₽</div>
              <div className="text-xs text-[#666]">за день</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-[#666]">Формат</div>
              <div className="font-medium">Пост</div>
            </div>
          </div>
          <button className="btn btn-primary w-full">Забронировать</button>
        </Card>

        <Card>
          <div className="mb-3 px-3 py-1 bg-[#FF6B35]/10 text-[#FF6B35] text-xs rounded-lg font-medium inline-block">
            Ваше место
          </div>
          <div className="mb-3">
            <span className="px-2 py-1 bg-[#6366F1]/10 text-[#6366F1] text-xs rounded-lg font-medium">Instagram</span>
            <span className="text-sm text-[#666] ml-2">100,000 подписчиков</span>
          </div>
          <h4 className="font-display font-semibold text-[#1A1A1A] mb-2">Сторис в профиле</h4>
          <p className="text-sm text-[#666] mb-4">Размещение сторис в профиле</p>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold">3,000 ₽</div>
              <div className="text-xs text-[#666]">за день</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-[#666]">Формат</div>
              <div className="font-medium">Сторис</div>
            </div>
          </div>
          <button className="btn btn-secondary w-full" disabled>Нельзя купить у себя</button>
        </Card>
      </div>

      <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Защита от самопокупки</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• Бэкенд исключает собственные слоты из выдачи</li>
          <li>• Фронтенд отображает бейдж "Ваше место", если бэкенд вернёт <code className="font-mono bg-white px-1.5 py-0.5 rounded">isOwn: true</code></li>
          <li>• Кнопка "Забронировать" отключена для собственных слотов</li>
        </ul>
      </Card>
    </div>
  );
}

function TechSection() {
  return (
    <div>
      <SectionHeader num="05" title="Технологии" />
      
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card>
          <h4 className="font-display font-semibold text-[#1A1A1A] mb-3">Основные</h4>
          <div className="space-y-2">
            {[
              { name: "Next.js 14+", desc: "React фреймворк с App Router" },
              { name: "React 18", desc: "UI библиотека" },
              { name: "TypeScript", desc: "Типизация" },
              { name: "Tailwind CSS", desc: "Утилитарные стили" },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <code className="text-sm font-mono text-[#1A1A1A] bg-[#F5F5F0] px-2 py-1 rounded min-w-[120px]">{item.name}</code>
                <span className="text-sm text-[#666]">{item.desc}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h4 className="font-display font-semibold text-[#1A1A1A] mb-3">Дополнительные</h4>
          <div className="space-y-2">
            {[
              { name: "React Hook Form", desc: "Управление формами" },
              { name: "Zod", desc: "Валидация схем" },
              { name: "TanStack Query", desc: "Серверное состояние" },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <code className="text-sm font-mono text-[#1A1A1A] bg-[#F5F5F0] px-2 py-1 rounded min-w-[120px]">{item.name}</code>
                <span className="text-sm text-[#666]">{item.desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Пример формы с валидацией</h4>
        <pre className="text-xs font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/schemas';

const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
});

const onSubmit = (data: LoginInput) => {
  // Отправка данных
};`}
        </pre>
      </Card>

      <Card className="mb-8">
        <h4 className="font-semibold text-[#1A1A1A] mb-3">Пример TanStack Query</h4>
        <pre className="text-xs font-mono bg-[#1A1A1A] text-[#F5F5F0] p-4 rounded-lg overflow-x-auto">
{`import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const { data: balance, isLoading } = useQuery({
  queryKey: ['balance'],
  queryFn: () => api.getBalance(),
});

if (isLoading) return <Skeleton />;`}
        </pre>
      </Card>

      <Card className="border-[#2D9B6E]/30 bg-[#2D9B6E]/5">
        <h4 className="font-semibold text-[#2D9B6E] mb-3">✓ Критерии приёмки</h4>
        <ul className="text-sm text-[#444] space-y-1.5">
          <li>• Пользователь с ролями Creator и Owner может переключиться в один клик</li>
          <li>• При переключении меняется интерфейс и URL</li>
          <li>• В режиме Creator виден каталог с возможностью бронирования</li>
          <li>• Дизайн соответствует разделу 6 Конституции</li>
          <li>• Коммит: <code className="font-mono bg-white px-1.5 py-0.5 rounded">feat(web): design system, role switching and unified marketplace UI</code></li>
        </ul>
      </Card>
    </div>
  );
}

const sectionComponents: Record<string, React.FC> = {
  overview: OverviewSection,
  design: DesignSection,
  roles: RolesSection,
  pages: PagesSection,
  catalog: CatalogSection,
  tech: TechSection,
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
              <p className="text-[10px] text-[#999] uppercase tracking-wider">Frontend</p>
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
            <span className="text-xs text-[#999] font-mono">Next.js 14+ Design System</span>
            <span className="px-2 py-1 bg-[#2D9B6E]/10 text-[#2D9B6E] text-xs font-medium rounded-md">READY</span>
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

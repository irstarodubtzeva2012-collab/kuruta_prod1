# KURUTA Web — Frontend

> Next.js 14+ фронтенд с дизайн-системой и переключением ролей согласно Конституции KURUTA.

## 🎨 Дизайн-система

Следует **разделу 6** Конституции KURUTA:

### Цвета
- **Primary**: `#1A1A1A` (текст)
- **Background**: `#F5F5F0` (фон)
- **Accent**: `#FF6B35` (акцент)
- **Success**: `#2D9B6E`
- **Error**: `#E63946`
- **Warning**: `#F59E0B`
- **Info**: `#6366F1`
- **Border**: `#E5E5E5`

### Шрифты
- **Body**: Inter
- **Headings**: Space Grotesk

### Компоненты
- **Карточки**: `border: 1px solid #E5E5E5`, `border-radius: 12px`, БЕЗ box-shadow
- **Кнопки**: `border-radius: 8px`, без градиентов
- **Hover**: меняет цвет границы, а не добавляет тень

### ЗАПРЕЩЕНО
- ❌ Glass-morphism (blur)
- ❌ Градиенты на фонах
- ❌ Box-shadow на карточках
- ❌ Радиусы > 16px
- ❌ Stock-фото
- ❌ Анимации > 300ms

## 🔄 Переключение ролей

Следует **разделу 5** Конституции (Единый аккаунт):

### RoleContext
- Хранит текущую роль пользователя
- Сохраняет выбор в localStorage
- Меняет URL при переключении (`/creator/...`, `/ambassador/...`, `/owner/...`)

### RoleSwitcher
- Dropdown в шапке с доступными ролями
- Мгновенное переключение без перезагрузки
- Иконки и подписи для каждой роли

### Единый баланс
- Баланс привязан к userId, а не к роли
- Деньги от продаж и покупок копятся на одном счёте

## 📁 Структура

```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Корневой layout с провайдерами
│   │   ├── page.tsx                # Главная (редирект на дашборд)
│   │   ├── globals.css             # Глобальные стили + Tailwind
│   │   ├── login/
│   │   │   └── page.tsx            # Страница входа
│   │   ├── creator/
│   │   │   ├── layout.tsx          # Лейаут для креатора
│   │   │   ├── page.tsx            # Дашборд креатора
│   │   │   └── catalog/
│   │   │       └── page.tsx        # Каталог рекламных мест
│   │   ├── ambassador/
│   │   │   ├── layout.tsx          # Лейаут для амбассадора
│   │   │   └── page.tsx            # Дашборд амбассадора
│   │   └── owner/
│   │       ├── layout.tsx          # Лейаут для владельца
│   │       └── page.tsx            # Дашборд владельца
│   ├── components/
│   │   ├── Header.tsx              # Шапка с RoleSwitcher
│   │   ├── Sidebar.tsx             # Боковая навигация (зависит от роли)
│   │   ├── RoleSwitcher.tsx        # Переключатель ролей
│   │   └── Skeleton.tsx            # Skeleton компоненты
│   ├── contexts/
│   │   ├── AuthContext.tsx         # Контекст авторизации
│   │   └── RoleContext.tsx         # Контекст ролей
│   └── lib/
│       ├── api.ts                  # API клиент
│       └── schemas.ts              # Zod схемы для валидации
├── tailwind.config.js              # Конфигурация Tailwind
├── postcss.config.js               # PostCSS конфиг
└── package.json
```

## 🚀 Запуск

### Разработка

```bash
cd apps/web
npm install
npm run dev
```

Фронтенд будет доступен на `http://localhost:3000`

### Production

```bash
npm run build
npm run start
```

## 🔧 Переменные окружения

Создайте файл `.env.local` в `apps/web/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 📦 Зависимости

- **Next.js 14+** — React фреймворк с App Router
- **React 18** — UI библиотека
- **TypeScript** — Типизация
- **Tailwind CSS** — Утилитарные стили
- **React Hook Form** — Управление формами
- **Zod** — Валидация схем
- **TanStack Query** — Управление серверным состоянием

## 🎯 Ключевые страницы

### Для Креатора
- `/creator` — Дашборд с балансом и статистикой
- `/creator/catalog` — Каталог рекламных мест (Единый маркетплейс)
- `/creator/deals` — Мои сделки

### Для Амбассадора
- `/ambassador` — Дашборд с балансом и заданиями
- `/ambassador/tasks` — Доступные задания
- `/ambassador/my-tasks` — Мои задания

### Для Владельца
- `/owner` — Дашборд с балансом и сделками
- `/owner/platforms` — Мои площадки
- `/owner/slots` — Рекламные места
- `/owner/deals` — Сделки

## 🛡️ Единый маркетплейс

На странице `/creator/catalog`:
- Бэкенд исключает собственные слоты владельца из выдачи
- Фронтенд отображает бейдж "Ваше место", если бэкенд вернёт `isOwn: true`
- Кнопка "Забронировать" отключена для собственных слотов

## 📝 Формы с валидацией

Используется React Hook Form + Zod:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/schemas';

const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
});
```

## 🔄 TanStack Query

Для управления серверным состоянием:

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const { data: balance, isLoading } = useQuery({
  queryKey: ['balance'],
  queryFn: () => api.getBalance(),
});
```

## 🎨 Компоненты

### Skeleton
Заменяет спиннеры для лучшего UX:

```typescript
import { CardSkeleton, StatsSkeleton } from '@/components/Skeleton';

if (isLoading) return <CardSkeleton />;
```

### RoleSwitcher
Переключатель ролей в шапке:

```typescript
import { RoleSwitcher } from '@/components/RoleSwitcher';

<Header>
  <RoleSwitcher />
</Header>
```

## ✅ Критерии приёмки

- ✅ Дизайн-система строго по разделу 6 Конституции
- ✅ Переключение ролей в один клик с изменением URL
- ✅ Единый баланс для всех ролей
- ✅ Единый маркетплейс с защитой от самопокупки
- ✅ React Hook Form + Zod для валидации
- ✅ TanStack Query для управления данными
- ✅ Skeleton screens вместо спиннеров
- ✅ Лейауты для каждой роли
- ✅ Дашборды с ключевыми метриками
- ✅ Каталог с фильтрами
- ✅ Бейдж "Ваше место" для собственных слотов
- ✅ Коммит: `feat(web): design system, role switching and unified marketplace UI`

## 📦 Коммит

```
feat(web): design system, role switching and unified marketplace UI
```

## 🔗 Ссылки

- [KURUTA Constitution](../../KURUTA_CONTEXT.md) — разделы 5 и 6
- [API Documentation](../api/README.md)
- [Admin Panel](../admin/README.md)
- [Database Schema](../database/DATABASE_SCHEMA.md)

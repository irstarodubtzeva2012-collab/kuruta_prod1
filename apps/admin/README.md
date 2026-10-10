# KURUTA — Админ-панель

> Отдельное Next.js приложение для управления платформой KURUTA.

## 🎯 Возможности

### 🔐 Авторизация
- Доступ только для ролей: `moderator`, `admin`, `finance`
- JWT авторизация через cookies
- Middleware для защиты маршрутов

### 📊 Дашборд
- Статистика по очередям модерации
- Активные споры
- Заявки на вывод средств
- Антифрод сигналы
- Быстрый доступ ко всем разделам

### 🛡️ Модерация
- Универсальная очередь модерации
- Фильтрация по типу сущности и статусу
- Просмотр деталей сущностей (кампании, задания, споры)
- Одобрение/отклонение с комментариями
- Все действия записываются в AuditLog

### ⚖️ Споры
- Список всех споров с фильтрацией
- Детальный просмотр спора
- Разрешение споров:
  - В пользу креатора (полный возврат)
  - В пользу исполнителя (полная выплата)
  - Частичный возврат (настраиваемый процент)
- Автоматическое распределение денег через FinanceService

### 💰 Финансы
- Управление заявками на вывод средств
- Подтверждение выплат
- Фильтрация по статусам

### 🚨 Антифрод
- Мониторинг подозрительной активности
- Фильтрация по severity и статусу
- Проверка сигналов с метаданными
- Подтверждение/отклонение сигналов

### 👥 Пользователи
- Список всех пользователей
- Блокировка/разблокировка пользователей
- Просмотр ролей и статусов

## 🚀 Запуск

### Разработка

```bash
cd apps/admin
npm install
npm run dev
```

Админ-панель будет доступна на `http://localhost:3001`

### Production

```bash
npm run build
npm run start
```

## 🔧 Переменные окружения

Создайте файл `.env.local` в `apps/admin/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 📁 Структура

```
apps/admin/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Корневой layout с AuthProvider
│   │   ├── page.tsx                # Дашборд
│   │   ├── globals.css             # Глобальные стили
│   │   ├── login/
│   │   │   └── page.tsx            # Страница входа
│   │   ├── unauthorized/
│   │   │   └── page.tsx            # Страница отказа в доступе
│   │   ├── moderation/
│   │   │   ├── page.tsx            # Очередь модерации
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Детали задачи модерации
│   │   ├── disputes/
│   │   │   ├── page.tsx            # Список споров
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Детали спора
│   │   ├── users/
│   │   │   └── page.tsx            # Управление пользователями
│   │   ├── finance/
│   │   │   └── payouts/
│   │   │       └── page.tsx        # Заявки на вывод
│   │   └── anti-fraud/
│   │       └── page.tsx            # Антифрод сигналы
│   ├── contexts/
│   │   └── AuthContext.tsx         # Контекст авторизации
│   ├── lib/
│   │   └── api.ts                  # API клиент
│   └── middleware.ts               # Middleware для защиты маршрутов
├── package.json
├── tsconfig.json
└── next.config.ts
```

## 🔌 API интеграция

Админ-панель взаимодействует с backend через API клиент (`src/lib/api.ts`).

### Основные эндпоинты

- `/api/v1/auth/*` - Авторизация
- `/api/v1/moderation/*` - Модерация
- `/api/v1/disputes/*` - Споры
- `/api/v1/finance/*` - Финансы
- `/api/v1/anti-fraud/*` - Антифрод
- `/api/v1/users/*` - Пользователи

## 📝 Аудит

Все действия администраторов автоматически записываются в AuditLog на backend:

```typescript
await prisma.auditLog.create({
   {
    userId: moderatorId,
    action: 'moderation.approved',
    entityType: 'ModerationQueue',
    entityId: queueId,
    after: { decision, comment },
  },
});
```

## 🔒 Безопасность

### Middleware

Middleware (`src/middleware.ts`) проверяет:
1. Наличие access token в cookies
2. Валидность токена
3. Наличие требуемых ролей (moderator, admin, finance)

### Защищённые маршруты

Все маршруты защищены, кроме:
- `/login` - Страница входа
- `/unauthorized` - Страница отказа в доступе
- `/api/*` - API маршруты
- `/_next/*` - Next.js ресурсы

## 🎨 UI компоненты

Используются кастомные CSS компоненты без внешних библиотек:

- `.card` - Карточки
- `.btn` - Кнопки (primary, success, error, secondary)
- `.badge` - Бейджи (success, error, warning, info, neutral)
- `.form-input` - Поля ввода
- `.table` - Таблицы
- `.alert` - Алерты
- `.spinner` - Спиннер загрузки

## 🎨 Дизайн

Соответствует дизайн-системе KURUTA:
- Primary: `#FF6B35`
- Success: `#2D9B6E`
- Error: `#E63946`
- Warning: `#F59E0B`
- Info: `#6366F1`
- Background: `#F5F5F0`

Шрифт: Inter

## ✅ Критерии приёмки

- ✅ Отдельное Next.js приложение
- ✅ Auth только для ролей moderator/finance/admin
- ✅ Дашборд со статистикой
- ✅ Очереди модерации
- ✅ Управление пользователями
- ✅ Финансы (выплаты)
- ✅ Споры с распределением денег
- ✅ Антифрод сигналы
- ✅ Все действия пишутся в AuditLog
- ✅ Админ может одобрить кампанию через UI
- ✅ Админ может рассмотреть спор через UI
- ✅ Коммит: `feat(admin): admin panel`

## 📦 Коммит

```
feat(admin): admin panel
```

## 🔗 Ссылки

- [KURUTA Constitution](../../KURUTA_CONTEXT.md)
- [API Documentation](../api/README.md)
- [Database Schema](../database/DATABASE_SCHEMA.md)

# KURUTA — Модуль аутентификации

> JWT + Refresh Token Rotation + TOTP 2FA + Rate Limiting

## Обзор

Модуль аутентификации реализован согласно Конституции KURUTA (раздел 3).

### Ключевые особенности

1. **Argon2id** для хеширования паролей (НЕ bcrypt)
2. **JWT Access Token** — 15 минут
3. **Refresh Token** — 7 дней, ротируется при каждом использовании
4. **Refresh Token хранится** в httpOnly Secure SameSite=Strict cookie (НЕ в localStorage)
5. **При утечке** (повторное использование старого refresh) — отзыв всей семьи токенов
6. **TOTP 2FA** — обязателен для финансовых операций
7. **Rate Limiting** — 5 попыток/мин на auth endpoints
8. **Audit Log** — все события аутентификации логируются

## Архитектура

```
apps/api/src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── jwt-refresh.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── rate-limit.guard.ts
│   ├── decorators/
│   │   └── roles.decorator.ts
│   └── dto/
│       ├── register.dto.ts
│       └── login.dto.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
│       └── update-profile.dto.ts
└── common/
    └── decorators/
        ├── current-user.decorator.ts
        └── public.decorator.ts
```

## API Endpoints

### Аутентификация

#### POST /api/v1/auth/register
Регистрация нового пользователя.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "StrongPass123",
  "displayName": "John Doe"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "displayName": "John Doe"
}
```

**Валидация пароля:**
- Минимум 8 символов
- Максимум 128 символов
- Должен содержать: uppercase, lowercase, digit

#### POST /api/v1/auth/login
Вход пользователя.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "StrongPass123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "roles": ["creator"]
  }
}
```

**Headers:**
```
Set-Cookie: refreshToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

#### POST /api/v1/auth/refresh
Обновление access token.

**Request:**
```
Cookie: refreshToken=eyJhbGc...
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGc..."
}
```

**Headers:**
```
Set-Cookie: refreshToken=<new-token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

**Безопасность:**
- При повторном использовании старого refresh token — отзыв ВСЕХ сессий пользователя
- Audit log: `security.refresh_token_reuse`

#### POST /api/v1/auth/logout
Выход пользователя.

**Headers:**
```
Authorization: Bearer <access-token>
Cookie: refreshToken=<refresh-token>
```

**Response (200):**
```json
{
  "success": true
}
```

**Headers:**
```
Set-Cookie: refreshToken=; Max-Age=0
```

#### GET /api/v1/auth/me
Получение текущего пользователя.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "avatarUrl": "https://...",
  "roles": ["creator", "ambassador"],
  "totpEnabled": false
}
```

### TOTP 2FA

#### POST /api/v1/auth/totp/enable
Инициализация настройки TOTP.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (201):**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeUrl": "otpauth://totp/KURUTA:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=KURUTA"
}
```

#### POST /api/v1/auth/totp/verify
Подтверждение TOTP.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request:**
```json
{
  "token": "123456"
}
```

**Response (200):**
```json
{
  "success": true
}
```

#### POST /api/v1/auth/totp/disable
Отключение TOTP.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request:**
```json
{
  "token": "123456"
}
```

**Response (200):**
```json
{
  "success": true
}
```

### Профиль пользователя

#### GET /api/v1/users/me
Получение профиля.

**Headers:**
```
Authorization: Bearer <access-token>
```

#### PUT /api/v1/users/me
Обновление профиля.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request:**
```json
{
  "displayName": "John Doe",
  "bio": "Software developer",
  "country": "Russia",
  "city": "Moscow",
  "timezone": "Europe/Moscow"
}
```

#### POST /api/v1/users/me/avatar
Загрузка аватара.

**Headers:**
```
Authorization: Bearer <access-token>
Content-Type: multipart/form-data
```

**Request:**
```
avatar: <file>
```

## Guards

### JwtAuthGuard
Проверяет валидность JWT access token.

**Использование:**
```typescript
@UseGuards(JwtAuthGuard)
@Get('protected')
getProtected() {
  return 'Protected resource';
}
```

### RolesGuard
Проверяет наличие необходимых ролей.

**Использование:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
@Get('admin')
getAdmin() {
  return 'Admin resource';
}
```

### RateLimitGuard
Ограничивает частоту запросов.

**Лимиты:**
- Auth endpoints (login, register): 5 попыток/мин
- API endpoints: 100 запросов/мин

## Безопасность

### Хеширование паролей
- **Алгоритм**: Argon2id
- **Параметры**:
  - memoryCost: 65536 (64 MB)
  - timeCost: 3
  - parallelism: 4

### JWT Tokens
- **Access Token**:
  - Алгоритм: HS256
  - Срок жизни: 15 минут
  - Хранение: localStorage или memory
- **Refresh Token**:
  - Алгоритм: HS256
  - Срок жизни: 7 дней
  - Хранение: httpOnly Secure SameSite=Strict cookie
  - Ротация: при каждом использовании

### Refresh Token Rotation
1. Пользователь получает refresh token при логине
2. При использовании refresh token:
   - Старый token помечается как revoked
   - Генерируется новый refresh token
   - Создается новая сессия
3. При повторном использовании старого token:
   - Все сессии пользователя отзываются
   - Записывается audit log: `security.refresh_token_reuse`
   - Возвращается ошибка 401

### Audit Log
Все события аутентификации логируются:
- `user.register` — регистрация
- `user.login` — вход
- `user.logout` — выход
- `user.refresh` — обновление токена
- `user.totp_initiated` — инициализация TOTP
- `user.totp_enabled` — включение TOTP
- `user.totp_disabled` — отключение TOTP
- `user.profile_updated` — обновление профиля
- `user.avatar_updated` — загрузка аватара
- `security.refresh_token_reuse` — попытка повторного использования refresh token

## Тестирование

### E2E тесты
```bash
cd apps/api
npm run test:e2e
```

**Покрытие:**
- ✅ Регистрация (успех, дубликат, слабый пароль)
- ✅ Вход (успех, неверный пароль, несуществующий пользователь)
- ✅ Получение текущего пользователя
- ✅ Refresh token (успех, ротация, повторное использование)
- ✅ Logout
- ✅ TOTP 2FA (включение, подтверждение)

### Запуск тестов
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## Коммит

```
feat(api): auth module with 2FA and rate limiting
```

## Ссылки

- [KURUTA Constitution](../../../KURUTA_CONTEXT.md) — раздел 3 (Безопасность)
- [Argon2 Documentation](https://github.com/ranisalt/node-argon2/wiki/Options)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [TOTP RFC](https://tools.ietf.org/html/rfc6238)

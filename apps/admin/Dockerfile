# Multi-stage build для KURUTA Admin
# Stage 1: Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Установка зависимостей для сборки
RUN apk add --no-cache python3 make g++

# Копирование package.json
COPY package.json package-lock.json ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/shared/package.json ./packages/shared/

# Установка зависимостей
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Сборка Admin
RUN cd apps/admin && npm run build

# Stage 3: Production
FROM node:20-alpine AS production

WORKDIR /app

# Создание non-root пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S kuruta -u 1001

# Установка curl для healthcheck
RUN apk add --no-cache curl

# Копирование package.json
COPY package.json package-lock.json ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/shared/package.json ./packages/shared/

# Установка production зависимостей
RUN npm ci --only=production && npm cache clean --force

# Копирование скомпилированного кода
COPY --from=builder --chown=kuruta:nodejs /app/apps/admin/.next ./apps/admin/.next
COPY --from=builder --chown=kuruta:nodejs /app/apps/admin/public ./apps/admin/public
COPY --from=builder --chown=kuruta:nodejs /app/apps/admin/next.config.ts ./apps/admin/
COPY --from=builder --chown=kuruta:nodejs /app/packages/shared ./packages/shared

# Переключение на non-root пользователя
USER kuruta

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001 || exit 1

# Expose port
EXPOSE 3001

# Запуск приложения
CMD ["npm", "run", "start", "--prefix", "apps/admin"]

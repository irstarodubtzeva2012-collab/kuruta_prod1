# Multi-stage build для KURUTA API
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Установка зависимостей для сборки
RUN apk add --no-cache python3 make g++

# Копирование package.json
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

# Установка зависимостей
RUN npm ci

# Копирование исходного кода
COPY . .

# Генерация Prisma Client
RUN cd packages/database && npx prisma generate

# Сборка API
RUN cd apps/api && npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Создание non-root пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S kuruta -u 1001

# Установка curl для healthcheck
RUN apk add --no-cache curl

# Копирование package.json
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

# Установка production зависимостей
RUN npm ci --only=production && npm cache clean --force

# Копирование скомпилированного кода
COPY --from=builder --chown=kuruta:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=kuruta:nodejs /app/packages/database ./packages/database
COPY --from=builder --chown=kuruta:nodejs /app/packages/shared ./packages/shared

# Переключение на non-root пользователя
USER kuruta

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Expose port
EXPOSE 4000

# Запуск приложения
CMD ["node", "apps/api/dist/main.js"]

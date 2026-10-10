// ─────────────────────────────────────────────────────────────────
// KURUTA API — Entry point
// ─────────────────────────────────────────────────────────────────

import { NestFactory } from "@nestjs/core";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { SsrfProtectionMiddleware } from "./common/middleware/ssrf-protection.middleware";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("API_PORT", 4000);

  // ─── Cookie Parser ────────────────────────────────────────────
  app.use(cookieParser());

  // ─── Security ─────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // Для Tailwind
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          connectSrc: ["'self'", configService.get<string>("API_URL", "http://localhost:4000")],
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
    }),
  );

  // ─── SSRF Protection ──────────────────────────────────────────
  app.use(new SsrfProtectionMiddleware().use);

  // ─── CORS ─────────────────────────────────────────────────────
  const corsOrigins = configService
    .get<string>("CORS_ORIGINS", "")
    .split(",")
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  });

  // ─── Versioning ───────────────────────────────────────────────
  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  // ─── Validation ───────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(port);
  console.log(`🚀 KURUTA API running on http://localhost:${port}`);
}

bootstrap();

// ─────────────────────────────────────────────────────────────────
// KURUTA API — Root Module
// ─────────────────────────────────────────────────────────────────

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { z } from "zod";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { FinanceModule } from "./finance/finance.module";
import { CampaignsModule } from "./campaigns/campaigns.module";
import { AdSlotsModule } from "./ad-slots/ad-slots.module";

// ─── Environment validation schema ──────────────────────────────
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  API_PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  CORS_ORIGINS: z.string().optional(),
});

@Module({
  imports: [
    // ─── Config ───────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        const result = envSchema.safeParse(config);
        if (!result.success) {
          console.error("❌ Invalid environment variables:");
          console.error(result.error.format());
          throw new Error("Invalid environment variables");
        }
        return result.data;
      },
    }),

    // ─── Rate Limiting ────────────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),

    // ─── Feature Modules ──────────────────────────────────────────
    AuthModule,
    UsersModule,
    FinanceModule,
    CampaignsModule,
    AdSlotsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

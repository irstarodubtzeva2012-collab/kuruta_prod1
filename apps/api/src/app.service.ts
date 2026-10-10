// ─────────────────────────────────────────────────────────────────
// KURUTA API — Health Check Service
// ─────────────────────────────────────────────────────────────────

import { Injectable } from "@nestjs/common";
import { APP_NAME } from "@kuruta/shared";

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: "ok",
      service: APP_NAME,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}

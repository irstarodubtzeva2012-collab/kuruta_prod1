// ─────────────────────────────────────────────────────────────────
// @kuruta/shared — Constants
// ─────────────────────────────────────────────────────────────────

export const APP_NAME = "KURUTA";

// ─── Commission ───────────────────────────────────────────────────
export const COMMISSION_RATE = 0.10; // 10% for Direction B

// ─── Currency ─────────────────────────────────────────────────────
export const DEFAULT_CURRENCY = "RUB";

// ─── Financial ────────────────────────────────────────────────────
export const MIN_WITHDRAWAL_AMOUNT = 500; // ₽

// ─── JWT ──────────────────────────────────────────────────────────
export const JWT_ACCESS_EXPIRES_IN = "15m";
export const JWT_REFRESH_EXPIRES_IN = "7d";

// ─── Rate Limits ──────────────────────────────────────────────────
export const RATE_LIMIT_AUTH_MAX = 5;
export const RATE_LIMIT_AUTH_WINDOW_MS = 60_000;
export const RATE_LIMIT_API_MAX = 100;
export const RATE_LIMIT_API_WINDOW_MS = 60_000;

// ─── File Upload ──────────────────────────────────────────────────
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

// ─── Pagination ───────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ─── Audit ────────────────────────────────────────────────────────
export const AUDIT_LOG_RETENTION_YEARS = 3;

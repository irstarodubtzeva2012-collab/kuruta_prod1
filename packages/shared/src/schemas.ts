// ─────────────────────────────────────────────────────────────────
// @kuruta/shared — Zod validation schemas
// ─────────────────────────────────────────────────────────────────

import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────

export const emailSchema = z
  .string()
  .email("Invalid email format")
  .max(255);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain uppercase, lowercase, and a digit"
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().min(2).max(100).optional(),
});

// ─── Pagination ───────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Idempotency ──────────────────────────────────────────────────

export const idempotencyKeySchema = z
  .string()
  .uuid("Must be a valid UUID")
  .max(36);

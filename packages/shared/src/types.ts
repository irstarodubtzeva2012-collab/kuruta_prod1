// ─────────────────────────────────────────────────────────────────
// @kuruta/shared — Types (DTOs, interfaces)
// ─────────────────────────────────────────────────────────────────

// ─── User ─────────────────────────────────────────────────────────

export type UserRoleType =
  | "guest"
  | "creator"
  | "ambassador"
  | "platform_owner"
  | "moderator"
  | "finance"
  | "admin"
  | "superadmin";

export type UserStatusType = "active" | "limited" | "blocked" | "deleted";

export interface UserPublic {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  roles: UserRoleType[];
}

// ─── Auth ─────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthTokens {
  accessToken: string;
  // refresh token is httpOnly cookie
}

// ─── Pagination ───────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── API Error ────────────────────────────────────────────────────

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  details?: Record<string, string[]>;
}

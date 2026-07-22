// ─── User Role ────────────────────────────────────────────────────────────────

export const UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// ─── User ─────────────────────────────────────────────────────────────────────

/** Full user as stored — never expose passwordHash outside of core/auth */
export interface ICurrentUser {
  id: string;
  email: string;
  role: UserRole;
}

/** Safe public representation of a user (no sensitive fields) */
export interface IPublicUser {
  id: string;
  email: string;
  role: UserRole;
}

// ─── Auth Tokens ──────────────────────────────────────────────────────────────

export interface ITokenPayload {
  /** Subject — user id */
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}

// ─── Session ──────────────────────────────────────────────────────────────────

export interface ISessionPayload {
  jti: string;
  userId: string;
  email: string;
  role: UserRole;
  expiresAt: Date;
}

// ─── API Shapes ───────────────────────────────────────────────────────────────

export interface ApiResponse<TData> {
  data: TData;
  message?: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}

export interface PaginatedResponse<TData> {
  data: TData[];
  total: number;
  page: number;
  pageSize: number;
}

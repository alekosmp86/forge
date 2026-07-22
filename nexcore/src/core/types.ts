import type { ICurrentUser, IPublicUser, ISessionPayload, UserRole } from '@forge/shared-types';

// Re-export shared contracts for internal use
export type { ICurrentUser, IPublicUser, ISessionPayload, UserRole };

// ─── API Helpers ──────────────────────────────────────────────────────────────

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

// ─── Form State ───────────────────────────────────────────────────────────────

export type FormState<TData = undefined> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: TData }
  | { status: 'error'; message: string };

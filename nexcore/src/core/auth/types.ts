import type { ISessionPayload, UserRole } from '@forge/shared-types';

// ─── Auth Type Re-exports and Extensions ──────────────────────────────────────

export type { ISessionPayload };

/** Input for creating/validating a user login */
export interface AuthCredentials {
  email: string;
  password: string;
}

/** Result returned after successful authentication */
export interface AuthResult {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

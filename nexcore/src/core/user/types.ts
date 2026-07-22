import type { UserRole } from '@forge/shared-types';

// ─── User DTOs ────────────────────────────────────────────────────────────────

export interface UserDTO {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Safe public representation — no sensitive fields */
export interface PublicUserDTO {
  id: string;
  email: string;
  role: UserRole;
}

// ─── Mutation Inputs ──────────────────────────────────────────────────────────

export interface CreateUserInput {
  email: string;
  /** Plain-text password — will be hashed by the service */
  password: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  email?: string;
  isActive?: boolean;
  role?: UserRole;
}

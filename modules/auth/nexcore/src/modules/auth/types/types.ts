import type { ISessionPayload, UserRole } from '@forge/shared-types';

export type { ISessionPayload };

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshTokenRecord {
  id: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface AuthPrismaDelegate {
  user: {
    findUnique(args: unknown): Promise<UserRecord | null>;
    create(args: unknown): Promise<UserRecord>;
    update(args: unknown): Promise<UserRecord>;
  };
  refreshToken: {
    create(args: unknown): Promise<RefreshTokenRecord>;
    findUnique(args: unknown): Promise<RefreshTokenRecord | null>;
    updateMany(args: unknown): Promise<{ count: number }>;
  };
}

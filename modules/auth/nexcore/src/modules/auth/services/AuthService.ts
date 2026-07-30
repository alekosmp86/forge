import 'server-only';
import bcrypt from 'bcryptjs';
import { prisma } from '@/core/db/client';
import { createSession, deleteSession, validateSession } from './session';
import { InvalidCredentialsError, UserAlreadyExistsError } from '../errors/errors';
import type { IAuthService } from './IAuthService';
import type { AuthCredentials, AuthResult, ISessionPayload, AuthPrismaDelegate } from '../types/types';

const db = prisma as unknown as AuthPrismaDelegate;
const DUMMY_HASH = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKyDAl4sPPZpFxK';

export const authService: IAuthService = {
  async login(credentials: AuthCredentials): Promise<AuthResult> {
    const rawUser = await db.user.findUnique({ where: { email: credentials.email } });

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      rawUser?.passwordHash ?? DUMMY_HASH
    );

    if (!rawUser || !isPasswordValid || !rawUser.isActive) {
      throw new InvalidCredentialsError();
    }

    await createSession({
      userId: rawUser.id,
      email: rawUser.email,
      role: rawUser.role,
    });

    return {
      user: {
        id: rawUser.id,
        email: rawUser.email,
        role: rawUser.role,
      },
    };
  },

  async register(credentials: AuthCredentials): Promise<AuthResult> {
    const existing = await db.user.findUnique({ where: { email: credentials.email } });
    if (existing) {
      throw new UserAlreadyExistsError(credentials.email);
    }

    const passwordHash = await bcrypt.hash(credentials.password, 12);
    const newUser = await db.user.create({
      data: {
        email: credentials.email,
        passwordHash,
      },
    });

    await createSession({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    };
  },

  async logout(): Promise<void> {
    await deleteSession();
  },

  async validateSession(): Promise<ISessionPayload | null> {
    return validateSession();
  },
};

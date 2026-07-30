import 'server-only';
import { cookies } from 'next/headers';
import { signSessionToken, verifySessionToken, hashTokenId, SESSION_DURATION_MS } from './tokens';
import { prisma } from '@/core/db/client';
import type { ISessionPayload, AuthPrismaDelegate } from '../types/types';
import type { UserRole } from '@forge/shared-types';

const SESSION_COOKIE_NAME = 'nexcore_session';
const db = prisma as unknown as AuthPrismaDelegate;

export async function createSession(params: {
  userId: string;
  email: string;
  role: UserRole;
}): Promise<void> {
  const jti = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const tokenHash = await hashTokenId(jti);

  await db.refreshToken.create({
    data: {
      tokenHash,
      userId: params.userId,
      expiresAt,
    },
  });

  const payload: ISessionPayload = {
    jti,
    userId: params.userId,
    email: params.email,
    role: params.role,
    expiresAt,
  };

  const token = await signSessionToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const session = await verifySessionToken(token);
    if (session?.jti) {
      const tokenHash = await hashTokenId(session.jti);
      await db.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function validateSession(): Promise<ISessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session || !session.jti) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  const tokenHash = await hashTokenId(session.jti);

  const tokenRecord = await db.refreshToken.findUnique({
    where: { tokenHash },
    select: { revokedAt: true, expiresAt: true, userId: true },
  });

  if (!tokenRecord || tokenRecord.revokedAt !== null || tokenRecord.expiresAt < new Date()) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isActive: true },
  });

  if (!user || !user.isActive) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  return session;
}

export { SESSION_COOKIE_NAME };

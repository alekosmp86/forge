import 'server-only';
import { cookies } from 'next/headers';
import { signSessionToken, verifySessionToken, hashTokenId, SESSION_DURATION_MS } from './tokens';
import { prisma } from '@/core/db/client';
import type { ISessionPayload } from './types';
import type { UserRole } from '@forge/shared-types';

// ─── Cookie Configuration ─────────────────────────────────────────────────────

const SESSION_COOKIE_NAME = 'nexcore_session';

// ─── Session Operations ───────────────────────────────────────────────────────

/**
 * Creates a signed session JWT and records the token in the DB (RefreshToken table).
 * Sets the httpOnly cookie. Called after successful login.
 */
export async function createSession(params: {
  userId: string;
  email: string;
  role: UserRole;
}): Promise<void> {
  const jti = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const tokenHash = await hashTokenId(jti);

  // Store active session token hash in DB for revocation tracking
  await prisma.refreshToken.create({
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

/**
 * Invalidates the session token in the database (revokedAt = now)
 * AND clears the session cookie.
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const session = await verifySessionToken(token);
    if (session?.jti) {
      const tokenHash = await hashTokenId(session.jti);
      // Invalidate the token in the database
      await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Reads, verifies, and checks DB revocation status of the session token.
 * If token signature is invalid, user is deleted, OR token is revoked in DB,
 * deletes cookie and returns null.
 */
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

  // Verify token is in DB and NOT revoked
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    select: { revokedAt: true, expiresAt: true, userId: true },
  });

  if (!tokenRecord || tokenRecord.revokedAt !== null || tokenRecord.expiresAt < new Date()) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  // Verify user still exists and is active
  const user = await prisma.user.findUnique({
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

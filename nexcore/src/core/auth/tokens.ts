import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import type { ISessionPayload } from './types';

// ─── Token Configuration ──────────────────────────────────────────────────────

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SESSION_DURATION_JWT = '7d';
const JWT_ALGORITHM = 'HS256';

function getEncodedSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Computes a SHA-256 hash of a JWT ID (jti) for secure database storage/lookup.
 * Uses Web Crypto API for universal Edge + Node.js compatibility.
 */
export async function hashTokenId(jti: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(jti);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ─── Token Operations ─────────────────────────────────────────────────────────

/**
 * Signs a new session JWT token.
 * Includes jti, userId, email, role, expiresAt in the payload.
 */
export async function signSessionToken(payload: ISessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION_JWT)
    .sign(getEncodedSecret());
}

/**
 * Verifies and decodes a session JWT token signature and expiration.
 * Returns the decoded payload or null if invalid.
 */
export async function verifySessionToken(token: string): Promise<ISessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getEncodedSecret(), {
      algorithms: [JWT_ALGORITHM],
    });
    return payload as unknown as ISessionPayload;
  } catch {
    return null;
  }
}

export { SESSION_DURATION_MS };

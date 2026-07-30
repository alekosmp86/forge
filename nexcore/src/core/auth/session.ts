import 'server-only';
import type { ISessionPayload } from '@forge/shared-types';

export type SessionProvider = () => Promise<ISessionPayload | null>;

let activeSessionProvider: SessionProvider = async () => null;

/**
 * Registers an active session provider (called when the auth module is initialized).
 */
export function registerSessionProvider(provider: SessionProvider): void {
  activeSessionProvider = provider;
}

/**
 * Validates the current user session.
 * Defaults to returning null (guest/public mode) if no auth module is installed.
 */
export async function validateSession(): Promise<ISessionPayload | null> {
  return activeSessionProvider();
}

export const SESSION_COOKIE_NAME = 'nexcore_session';

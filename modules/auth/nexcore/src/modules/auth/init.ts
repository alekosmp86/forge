import { registerSessionProvider } from '@/core/auth/session';
import { validateSession } from './services/session';

/**
 * Initializes the auth module by registering its JWT session validator into the kernel's auth slot.
 */
export function initAuthModule(): void {
  registerSessionProvider(validateSession);
}

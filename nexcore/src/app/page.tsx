import { redirect } from 'next/navigation';
import { validateSession } from '@/core/auth/session';

/**
 * Root page — check session and redirect appropriately.
 * Authenticated users go to the dashboard; others go to login.
 */
export default async function RootPage() {
  const session = await validateSession();

  if (!session) {
    redirect('/login');
  }

  // Redirect to the main app page (replace with your actual home route)
  redirect('/dashboard');
}

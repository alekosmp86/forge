import { redirect } from 'next/navigation';
import { validateSession } from '@/core/auth/session';

/**
 * Protected app shell layout.
 * Any page under (app)/ will hit this layout and be required to have a valid session.
 * Unauthenticated users are redirected to /login.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateSession();

  if (!session) {
    redirect('/login');
  }

  return <>{children}</>;
}

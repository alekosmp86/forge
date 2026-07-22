import { validateSession } from '@/core';
import { LogoutButton } from '@/components/ui';
import { UserProfile } from './components/UserProfile';
import styles from './page.module.css';

export default async function DashboardPage() {
  const session = await validateSession();

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo}>nexcore</span>
          <span className={styles.badge}>Kernel Shell</span>
        </div>

        <LogoutButton />
      </header>

      <section className={styles.content}>
        <div className={styles.card}>
          <h1 className={styles.welcome}>Welcome back!</h1>
          <UserProfile />

          <div className={styles.infoBox}>
            <h2>System Status</h2>
            <ul>
              <li>✓ Kernel Auth: Active</li>
              <li>✓ Session Cookie: Encrypted JWT (jose)</li>
              <li>✓ Database: PostgreSQL (Prisma 7 adapter)</li>
              <li>✓ Session ID: {session?.jti}</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

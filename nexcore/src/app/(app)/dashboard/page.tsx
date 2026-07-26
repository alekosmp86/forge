import { validateSession } from '@/core';
import { LogoutButton } from '@/components/ui';
import { CheckCircle2 } from 'lucide-react';
import { UserProfile } from './components/UserProfile';
import { DashboardInteractiveDemo } from './components/DashboardInteractiveDemo';
import styles from './page.module.css';

export default async function DashboardPage() {
  const session = await validateSession();

  return (
    <main className={styles.container}>
      <section className={styles.content}>
        <div className={styles.card}>
          <h1 className={styles.welcome}>Welcome back!</h1>
          <UserProfile />

          <div className={styles.infoBox}>
            <h2>System Status</h2>
            <ul>
              <li className={styles.statusItem}>
                <CheckCircle2 size={16} className={styles.statusIcon} />
                <span>Kernel Auth: Active</span>
              </li>
              <li className={styles.statusItem}>
                <CheckCircle2 size={16} className={styles.statusIcon} />
                <span>Session Cookie: Encrypted JWT (jose)</span>
              </li>
              <li className={styles.statusItem}>
                <CheckCircle2 size={16} className={styles.statusIcon} />
                <span>Database: PostgreSQL (Prisma 7 adapter)</span>
              </li>
              <li className={styles.statusItem}>
                <CheckCircle2 size={16} className={styles.statusIcon} />
                <span>Session ID: {session?.jti}</span>
              </li>
            </ul>
          </div>

          <DashboardInteractiveDemo />
        </div>
      </section>
    </main>
  );
}

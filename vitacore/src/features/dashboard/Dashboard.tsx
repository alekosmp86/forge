import { CheckCircle2 } from 'lucide-react';
import type { ICurrentUser } from '@forge/shared-types';
import { LogoutButton } from '../../components/ui/LogoutButton/LogoutButton';
import styles from './Dashboard.module.css';

interface DashboardProps {
  currentUser: ICurrentUser;
}

export function Dashboard({ currentUser }: DashboardProps) {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo}>vitacore</span>
          <span className={styles.badge}>Vite Kernel</span>
        </div>

        <LogoutButton />
      </header>

      <section className={styles.content}>
        <div className={styles.card}>
          <h1 className={styles.welcome}>Welcome back!</h1>
          
          <p className={styles.subtitle}>
            Signed in as <strong>{currentUser.email}</strong> with role{' '}
            <code className={styles.role}>{currentUser.role}</code>.
          </p>

          <div className={styles.infoBox}>
            <h2>System Status</h2>
            <ul>
              <li className={styles.statusItem}>
                <CheckCircle2 size={16} className={styles.statusIcon} />
                <span>Kernel Auth: Active</span>
              </li>
              <li className={styles.statusItem}>
                <CheckCircle2 size={16} className={styles.statusIcon} />
                <span>Session Cookie: Encrypted JWT</span>
              </li>
              <li className={styles.statusItem}>
                <CheckCircle2 size={16} className={styles.statusIcon} />
                <span>Backend API: Spring Boot (javacore)</span>
              </li>
              <li className={styles.statusItem}>
                <CheckCircle2 size={16} className={styles.statusIcon} />
                <span>User ID: {currentUser.id}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

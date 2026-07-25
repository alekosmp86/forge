import { useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import type { ICurrentUser } from '@forge/shared-types';
import { LogoutButton } from '../../components/ui/LogoutButton/LogoutButton';
import { Button } from '../../components/ui/Button/Button';
import { ButtonVariant } from '../../components/ui/Button/types';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal/ConfirmationModal';
import { ModalVariant } from '../../components/ui/ConfirmationModal/types';
import styles from './Dashboard.module.css';

interface DashboardProps {
  currentUser: ICurrentUser;
}

export function Dashboard({ currentUser }: DashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleConfirm = () => {
    setIsActionLoading(true);
    setTimeout(() => {
      setIsActionLoading(false);
      setIsModalOpen(false);
    }, 1000);
  };

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

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <h2>UI Components Demo</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
              Test cross-stack ConfirmationModal component:
            </p>
            <Button
              variant={ButtonVariant.DANGER}
              leftIcon={<AlertTriangle size={16} />}
              onClick={() => setIsModalOpen(true)}
            >
              Test Confirmation Modal
            </Button>
          </div>
        </div>
      </section>

      <ConfirmationModal
        isOpen={isModalOpen}
        title="Delete Project Workspace"
        message="Are you sure you want to delete this workspace? This action cannot be undone and will permanently remove all associated metadata."
        variant={ModalVariant.DANGER}
        confirmLabel="Delete Workspace"
        cancelLabel="Cancel"
        isLoading={isActionLoading}
        onConfirm={handleConfirm}
        onCancel={() => setIsModalOpen(false)}
      />
    </main>
  );
}

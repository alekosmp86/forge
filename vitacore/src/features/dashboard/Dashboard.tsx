import { useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import type { ICurrentUser } from '@forge/shared-types';
import { Button } from '../../components/ui/Button/Button';
import { ButtonVariant } from '../../components/ui/Button/types';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal/ConfirmationModal';
import { ModalVariant } from '../../components/ui/ConfirmationModal/types';
import { useToast } from '../../components/ui/Toast/useToast';
import { AppShell } from '../../components/layout/AppShell/AppShell';
import { FileUploader } from '../../components/ui/FileUploader/FileUploader';
import styles from './Dashboard.module.css';

interface DashboardProps {
  currentUser: ICurrentUser;
}

export function Dashboard({ currentUser }: DashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const toast = useToast();

  const handleConfirm = () => {
    setIsActionLoading(true);
    setTimeout(() => {
      setIsActionLoading(false);
      setIsModalOpen(false);
      toast.success('Workspace deleted successfully!', 'Action Completed');
    }, 1000);
  };

  return (
    <AppShell currentUser={currentUser} brandName="vitacore" brandBadge="Vite Kernel">
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
              Test cross-stack ConfirmationModal and Toaster Notification system:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <Button
                variant={ButtonVariant.DANGER}
                leftIcon={<AlertTriangle size={16} />}
                onClick={() => setIsModalOpen(true)}
              >
                Test Confirmation Modal
              </Button>
              <Button
                variant={ButtonVariant.PRIMARY}
                leftIcon={<CheckCircle2 size={16} />}
                onClick={() => toast.success('Operation completed successfully!', 'Success')}
              >
                Success Toast
              </Button>
              <Button
                variant={ButtonVariant.SECONDARY}
                leftIcon={<AlertCircle size={16} />}
                onClick={() => toast.warning('Storage reaching capacity limit.', 'Warning')}
              >
                Warning Toast
              </Button>
              <Button
                variant={ButtonVariant.GHOST}
                leftIcon={<Info size={16} />}
                onClick={() => toast.info('New kernel update available.', 'Information')}
              >
                Info Toast
              </Button>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
              <h2>File Upload Service Demo</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                Test drag-and-drop file uploader with progress tracking (SOLID Strategy pattern):
              </p>
              <FileUploader
                label="Attachment Uploader"
                hint="Upload any file up to 10MB (Saved via Storage Service)"
                onUploadSuccess={(file) => toast.success(`File "${file.originalName}" uploaded successfully!`, 'File Uploaded')}
                onDeleteSuccess={(filename) => toast.info(`File ${filename} removed.`, 'File Removed')}
              />
            </div>
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
    </AppShell>
  );
}

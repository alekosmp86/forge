'use client';

import { useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, AlertCircle, BarChart2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { ButtonVariant } from '@/components/ui/Button/types';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal/ConfirmationModal';
import { ModalVariant } from '@/components/ui/ConfirmationModal/types';
import { useToast } from '@/components/ui/Toast/useToast';
import { FileUploader } from '@/components/ui/FileUploader/FileUploader';
import { FG } from '@/core/extension/FG';
import { NavSection } from '@/core/navigation/types';

export function DashboardInteractiveDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [, setNavUpdateCount] = useState(0);
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
    <>
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

        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
          <h2>Module Navigation Extension Demo</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
            Inject dynamic navigation options into the Sidebar using core <code>FG.UI.Sidebar.register(...)</code>:
          </p>
          <Button
            variant={ButtonVariant.PRIMARY}
            leftIcon={<PlusCircle size={16} />}
            onClick={() => {
              FG.UI.Sidebar.register({
                id: 'analytics-module',
                label: 'Analytics & Reports',
                icon: <BarChart2 size={18} aria-hidden="true" />,
                href: '#',
                badge: 'New',
                order: 15,
                section: NavSection.MAIN,
              });
              setNavUpdateCount((prev) => prev + 1);
              toast.success('Analytics Module injected into Sidebar!', 'Module Registered');
            }}
          >
            Inject Analytics Module
          </Button>
        </div>
      </div>

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
    </>
  );
}

'use client';

import { useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, AlertCircle, BarChart2, PlusCircle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { ButtonVariant } from '@/components/ui/Button/types';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal/ConfirmationModal';
import { ModalVariant } from '@/components/ui/ConfirmationModal/types';
import { useToast } from '@/components/ui/Toast/useToast';
import { FileUploader } from '@/components/ui/FileUploader/FileUploader';
import { FG } from '@/core/extension/FG';
import { NavSection } from '@/core/navigation/types';

function HeaderNotificationBellDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState([
    { id: '1', title: 'In-App Alerts Module', message: 'Notifications module registered into Core UI.', isRead: false },
    { id: '2', title: 'Security Alert', message: 'Encrypted JWT session verified.', isRead: false },
  ]);

  const unreadCount = items.filter((item) => !item.isRead).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        type="button"
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2.25rem',
          height: '2.25rem',
          borderRadius: '0.375rem',
          border: '1px solid var(--color-border, #e2e8f0)',
          backgroundColor: 'var(--color-surface, #ffffff)',
          color: 'var(--color-text-secondary, #64748b)',
          cursor: 'pointer',
        }}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open notifications"
      >
        <Bell size={18} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-0.25rem',
              right: '-0.25rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '1.125rem',
              height: '1.125rem',
              padding: '0 0.25rem',
              borderRadius: '9999px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '0.6875rem',
              fontWeight: 700,
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            width: '18rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--color-border, #e2e8f0)',
            backgroundColor: 'var(--color-surface, #ffffff)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--color-border, #e2e8f0)',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', cursor: 'pointer' }}
                onClick={markAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '16rem', overflowY: 'auto' }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid var(--color-border, #f1f5f9)',
                  cursor: 'pointer',
                  backgroundColor: !item.isRead ? '#eff6ff' : 'transparent',
                }}
                onClick={() =>
                  setItems((prev) =>
                    prev.map((i) => (i.id === item.id ? { ...i, isRead: true } : i))
                  )
                }
              >
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--color-text, #0f172a)' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary, #64748b)', marginTop: '0.25rem' }}>
                  {item.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
          <h2>Notifications Module & UI Slot Injection Demo</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
            Test the <code>notifications</code> module: Inject a Notification Bell into Core Header via <code>FG.UI.Header.register(...)</code> or dispatch an alert:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Button
              variant={ButtonVariant.PRIMARY}
              leftIcon={<PlusCircle size={16} />}
              onClick={() => {
                FG.UI.Header.register({
                  id: 'notifications-bell',
                  order: 5,
                  component: HeaderNotificationBellDemo,
                });
                toast.success('Notification Bell injected into Core AppHeader!', 'UI Slot Injected');
              }}
            >
              Inject Notification Bell into Header
            </Button>

            <Button
              variant={ButtonVariant.SECONDARY}
              leftIcon={<Bell size={16} />}
              onClick={() => toast.info('New in-app notification received from backend service!', 'In-App Notification')}
            >
              Send In-App Alert
            </Button>
          </div>
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

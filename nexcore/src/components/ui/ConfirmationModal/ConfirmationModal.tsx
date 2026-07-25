'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { Button } from '../Button/Button';
import { ButtonVariant } from '../Button/types';
import styles from './ConfirmationModal.module.css';
import { ModalVariant, type ConfirmationModalProps } from './types';

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = ModalVariant.INFO,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isLoading) {
      onCancel();
    }
  };

  const getVariantIcon = () => {
    switch (variant) {
      case ModalVariant.DANGER:
        return <AlertTriangle size={20} aria-hidden="true" />;
      case ModalVariant.WARNING:
        return <AlertCircle size={20} aria-hidden="true" />;
      case ModalVariant.INFO:
      default:
        return <Info size={20} aria-hidden="true" />;
    }
  };

  const getConfirmButtonVariant = (): ButtonVariant => {
    switch (variant) {
      case ModalVariant.DANGER:
        return ButtonVariant.DANGER;
      case ModalVariant.WARNING:
      case ModalVariant.INFO:
      default:
        return ButtonVariant.PRIMARY;
    }
  };

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className={[styles.modal, styles[`variant-${variant}`]].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        aria-describedby="confirmation-modal-description"
      >
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <span className={styles.iconWrapper}>{getVariantIcon()}</span>
            <h3 id="confirmation-modal-title" className={styles.title}>
              {title}
            </h3>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Close modal"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.body}>
          <div id="confirmation-modal-description" className={styles.message}>
            {message}
          </div>
        </div>

        <div className={styles.footer}>
          <Button
            type="button"
            variant={ButtonVariant.GHOST}
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={getConfirmButtonVariant()}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

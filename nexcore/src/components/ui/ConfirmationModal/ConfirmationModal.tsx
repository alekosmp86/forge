'use client';

import React, { useEffect, useRef } from 'react';
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === dialog && !isLoading) {
        onCancelRef.current();
      }
    };

    dialog.addEventListener('click', handleBackdropClick);
    return () => dialog.removeEventListener('click', handleBackdropClick);
  }, [isLoading]);

  const handleCancelClick = () => {
    if (!isLoading) {
      onCancelRef.current();
    }
  };

  const handleDialogCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    if (!isLoading) {
      onCancelRef.current();
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
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onCancel={handleDialogCancel}
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-description"
    >
      <div className={[styles.modal, styles[`variant-${variant}`]].join(' ')}>
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
            onClick={handleCancelClick}
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
            onClick={handleCancelClick}
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
    </dialog>
  );
}

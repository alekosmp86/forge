import React from 'react';

export const ModalVariant = {
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export type ModalVariant = (typeof ModalVariant)[keyof typeof ModalVariant];

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ModalVariant;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

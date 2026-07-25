import React from 'react';

export const ToastVariant = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export type ToastVariant = (typeof ToastVariant)[keyof typeof ToastVariant];

export interface ToastOptions {
  title?: string;
  message: React.ReactNode;
  variant?: ToastVariant;
  duration?: number; // Duration in milliseconds, default 5000ms
}

export interface IToast extends ToastOptions {
  id: string;
}

export interface ToastContextType {
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
  success: (message: React.ReactNode, title?: string, duration?: number) => string;
  error: (message: React.ReactNode, title?: string, duration?: number) => string;
  warning: (message: React.ReactNode, title?: string, duration?: number) => string;
  info: (message: React.ReactNode, title?: string, duration?: number) => string;
}

'use client';

import { useMemo, useCallback, useState } from 'react';
import { ToastContainer } from './ToastContainer';
import { ToastContext } from './ToastContext';
import { ToastVariant, type IToast, type ToastOptions } from './types';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<IToast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: IToast = {
      id,
      duration: 5000,
      variant: ToastVariant.INFO,
      ...options,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const success = useCallback(
    (message: React.ReactNode, title?: string, duration?: number) => {
      return showToast({ message, title, duration, variant: ToastVariant.SUCCESS });
    },
    [showToast]
  );

  const error = useCallback(
    (message: React.ReactNode, title?: string, duration?: number) => {
      return showToast({ message, title, duration, variant: ToastVariant.ERROR });
    },
    [showToast]
  );

  const warning = useCallback(
    (message: React.ReactNode, title?: string, duration?: number) => {
      return showToast({ message, title, duration, variant: ToastVariant.WARNING });
    },
    [showToast]
  );

  const info = useCallback(
    (message: React.ReactNode, title?: string, duration?: number) => {
      return showToast({ message, title, duration, variant: ToastVariant.INFO });
    },
    [showToast]
  );

  const contextValue = useMemo(
    () => ({
      showToast,
      dismissToast,
      success,
      error,
      warning,
      info,
    }),
    [showToast, dismissToast, success, error, warning, info]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

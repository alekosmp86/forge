import { useEffect, useState, useRef } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';
import { ToastVariant, type IToast } from './types';

interface ToastItemProps {
  toast: IToast;
  onDismiss: (id: string) => void;
}

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const duration = toast.duration ?? 5000;
  const [remainingTime, setRemainingTime] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (remainingTime <= 0) {
      onDismissRef.current(toast.id);
    }
  }, [remainingTime, toast.id]);

  useEffect(() => {
    if (isPaused || remainingTime <= 0) return;

    const tickInterval = 50;
    const timer = setInterval(() => {
      setRemainingTime((prev) => Math.max(0, prev - tickInterval));
    }, tickInterval);

    return () => clearInterval(timer);
  }, [isPaused, remainingTime]);

  const progressPercent = Math.max(0, Math.min(100, (remainingTime / duration) * 100));
  const variant = toast.variant ?? ToastVariant.INFO;

  const getVariantIcon = () => {
    switch (variant) {
      case ToastVariant.SUCCESS:
        return <CheckCircle2 size={18} aria-hidden="true" />;
      case ToastVariant.ERROR:
        return <AlertTriangle size={18} aria-hidden="true" />;
      case ToastVariant.WARNING:
        return <AlertCircle size={18} aria-hidden="true" />;
      case ToastVariant.INFO:
      default:
        return <Info size={18} aria-hidden="true" />;
    }
  };

  return (
    <div
      className={[styles.item, styles[`variant-${variant}`]].join(' ')}
      role="status"
      aria-live="polite"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={styles.content}>
        <span className={styles.iconWrapper}>{getVariantIcon()}</span>
        <div className={styles.textWrapper}>
          {toast.title && <h4 className={styles.title}>{toast.title}</h4>}
          <div className={styles.message}>{toast.message}</div>
        </div>
        <button
          type="button"
          className={styles.dismissButton}
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

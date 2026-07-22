import { Loader2 } from 'lucide-react';
import styles from './Button.module.css';
import { ButtonVariant, ButtonSize, type ButtonProps } from './types';

// ─── Button Component (Component-only export for Fast Refresh compliance) ─────

export function Button({
  variant = ButtonVariant.PRIMARY,
  size = ButtonSize.MD,
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        styles.button,
        styles[`variant-${variant}`],
        styles[`size-${size}`],
        isLoading ? styles.loading : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isLoading ? (
        <Loader2 className={styles.spinner} size={16} aria-hidden="true" />
      ) : (
        leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>
      )}
      <span className={styles.label}>{children}</span>
      {!isLoading && rightIcon && (
        <span className={styles.iconRight}>{rightIcon}</span>
      )}
    </button>
  );
}

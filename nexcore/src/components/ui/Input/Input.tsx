import React, { forwardRef } from 'react';
import styles from './Input.module.css';

// ─── Input Props ──────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hasError?: boolean;
}

// ─── Input Component ──────────────────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { leftIcon, rightIcon, hasError, className, ...props },
  ref
) {
  return (
    <div className={styles.wrapper}>
      {leftIcon && (
        <span className={styles.iconLeft} aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        {...props}
        className={[
          styles.input,
          leftIcon ? styles.withLeftIcon : '',
          rightIcon ? styles.withRightIcon : '',
          hasError ? styles.hasError : '',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
      />
      {rightIcon && (
        <span className={styles.iconRight} aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </div>
  );
});

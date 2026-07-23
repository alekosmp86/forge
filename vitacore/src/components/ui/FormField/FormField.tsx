import React from 'react';
import { AlertCircle } from 'lucide-react';
import styles from './FormField.module.css';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true">*</span>}
      </label>

      {children}

      {error && (
        <span className={styles.error} role="alert" id={`${htmlFor}-error`}>
          <AlertCircle size={13} aria-hidden="true" />
          {error}
        </span>
      )}

      {!error && hint && (
        <span className={styles.hint} id={`${htmlFor}-hint`}>
          {hint}
        </span>
      )}
    </div>
  );
}

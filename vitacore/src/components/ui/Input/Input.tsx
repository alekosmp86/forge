import React, { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input: React.FC<InputProps> = ({ error = false, className = '', ...props }) => {
  return (
    <input
      className={`${styles.input} ${error ? styles.error : ''} ${className}`}
      {...props}
    />
  );
};

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import styles from './LoginForm.module.css';

// ─── Form State ────────────────────────────────────────────────────────────────

interface LoginFormState {
  email: string;
  password: string;
}

// ─── LoginForm Component ───────────────────────────────────────────────────────

export function LoginForm() {
  const router = useRouter();

  const [formValues, setFormValues] = useState<LoginFormState>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<LoginFormState>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ─── Handlers ─────────────────────────────────────────────────────────────────

  function handleFieldChange(field: keyof LoginFormState) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormValues((previous) => ({ ...previous, [field]: event.target.value }));
      // Clear field error on change
      if (errors[field]) {
        setErrors((previous) => ({ ...previous, [field]: undefined }));
      }
      if (globalError) setGlobalError(null);
    };
  }

  function validateForm(): boolean {
    const newErrors: Partial<LoginFormState> = {};

    if (!formValues.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formValues.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setGlobalError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setGlobalError(errorData.error ?? 'Login failed. Please try again.');
        return;
      }

      // Redirect to the protected app shell on success
      router.push('/');
      router.refresh();
    } catch {
      setGlobalError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function togglePasswordVisibility() {
    setShowPassword((previous) => !previous);
  }

  // ─── Render ────────────────────────────────────────────────────────────────────

  return (
    <form
      id="login-form"
      onSubmit={handleSubmit}
      className={styles.form}
      noValidate
    >
      {/* Global Error */}
      {globalError && (
        <div className={styles.globalError} role="alert" aria-live="polite">
          {globalError}
        </div>
      )}

      <div className={styles.fields}>
        {/* Email */}
        <FormField
          label="Email address"
          htmlFor="login-email"
          error={errors.email}
          required
        >
          <Input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={formValues.email}
            onChange={handleFieldChange('email')}
            hasError={!!errors.email}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            disabled={isLoading}
            leftIcon={<Mail size={16} />}
          />
        </FormField>

        {/* Password */}
        <FormField
          label="Password"
          htmlFor="login-password"
          error={errors.password}
          required
        >
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={formValues.password}
            onChange={handleFieldChange('password')}
            hasError={!!errors.password}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            disabled={isLoading}
            leftIcon={<Lock size={16} />}
            rightIcon={
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={styles.passwordToggle}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword
                  ? <EyeOff size={16} />
                  : <Eye size={16} />
                }
              </button>
            }
          />
        </FormField>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        id="login-submit"
        isLoading={isLoading}
        className={styles.submitButton}
      >
        {isLoading ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}

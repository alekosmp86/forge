import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import { FormField } from '../../components/ui/FormField/FormField';
import styles from './LoginForm.module.css';

interface LoginFormState {
  email: string;
  password: string;
}

export function LoginForm() {
  const queryClient = useQueryClient();

  const [formValues, setFormValues] = useState<LoginFormState>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<LoginFormState>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginFormState) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        let errorMessage = 'Login failed. Please try again.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Fallback message when JSON parse fails
        }
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error: Error) => {
      setGlobalError(error.message);
    },
  });

  function handleFieldChange(field: keyof LoginFormState) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormValues((previous) => ({ ...previous, [field]: event.target.value }));
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

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) return;

    setGlobalError(null);
    loginMutation.mutate(formValues);
  }

  function togglePasswordVisibility() {
    setShowPassword((previous) => !previous);
  }

  return (
    <div className={styles.page}>
      <div className={styles.backgroundBlob} />
      <div className={styles.backgroundBlob2} />

      <div className={styles.card}>
        <div className={styles.brand}>
          <ShieldCheck className={styles.logoMark} size={32} />
          <span className={styles.logoText}>Forge</span>
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to your account to continue</p>
        </div>

        <form
          id="login-form"
          onSubmit={handleSubmit}
          className={styles.form}
          noValidate
        >
          {globalError && (
            <div className={styles.globalError} role="alert" aria-live="polite">
              {globalError}
            </div>
          )}

          <div className={styles.fields}>
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
                disabled={loginMutation.isPending}
                leftIcon={<Mail size={16} />}
              />
            </FormField>

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
                disabled={loginMutation.isPending}
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className={styles.passwordToggle}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
            </FormField>
          </div>

          <Button
            type="submit"
            id="login-submit"
            isLoading={loginMutation.isPending}
            className={styles.submitButton}
          >
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}

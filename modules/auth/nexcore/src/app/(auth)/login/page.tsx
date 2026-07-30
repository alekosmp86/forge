import type { Metadata } from 'next';
import { LoginForm } from './components/LoginForm';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Sign In — nexcore',
  description: 'Sign in to your nexcore application.',
};

export default function LoginPage() {
  return (
    <main className={styles.page}>
      {/* Background decoration */}
      <div className={styles.backgroundBlob} aria-hidden="true" />
      <div className={styles.backgroundBlob2} aria-hidden="true" />

      <div className={styles.card}>
        {/* Logo / Brand */}
        <div className={styles.brand}>
          <div className={styles.logoMark} aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="currentColor" />
              <path
                d="M8 14L12 10L16 14L20 10"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 18L12 14L16 18L20 14"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
              />
            </svg>
          </div>
          <span className={styles.logoText}>nexcore</span>
        </div>

        {/* Heading */}
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to your account to continue</p>
        </div>

        {/* Form */}
        <LoginForm />
      </div>
    </main>
  );
}

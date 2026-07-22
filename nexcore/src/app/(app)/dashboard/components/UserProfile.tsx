'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import styles from '../page.module.css';

export function UserProfile() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <p className={styles.subtitle}>Loading profile data...</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <p className={styles.subtitle}>
      Signed in as <strong>{user.email}</strong> with role{' '}
      <code className={styles.role}>{user.role}</code>.
    </p>
  );
}

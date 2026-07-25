import { Menu, User as UserIcon } from 'lucide-react';
import { LogoutButton } from '../../ui/LogoutButton/LogoutButton';
import styles from './AppShell.module.css';
import type { AppHeaderProps } from './types';

export function AppHeader({
  title = 'Dashboard',
  subtitle,
  onOpenMobileNav,
  currentUser,
}: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button
          type="button"
          className={styles.mobileMenuButton}
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        <div className={styles.titleContainer}>
          <h1 className={styles.headerTitle}>{title}</h1>
          {subtitle && <span className={styles.headerSubtitle}>{subtitle}</span>}
        </div>
      </div>

      <div className={styles.headerRight}>
        {currentUser && (
          <div className={styles.userBadge}>
            <UserIcon size={14} aria-hidden="true" />
            <span>{currentUser.email}</span>
          </div>
        )}
        <LogoutButton />
      </div>
    </header>
  );
}

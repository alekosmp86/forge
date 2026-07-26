import { useState } from 'react';
import styles from './AppShell.module.css';
import { Sidebar } from './Sidebar';
import { AppHeader } from './AppHeader';
import { useNavItems } from '../../../core/navigation/navRegistry';
import { initCoreNavigation } from '../../../core/navigation/initNavigation';
import type { AppShellProps } from './types';

// Initialize core navigation items into registry
initCoreNavigation();

export function AppShell({
  children,
  navItems,
  title = 'Dashboard',
  subtitle = 'Kernel Management Shell',
  currentUser,
  brandName = 'forge',
  brandBadge = 'Kernel',
}: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const registeredNavItems = useNavItems(currentUser?.role);
  const effectiveNavItems = navItems ?? registeredNavItems;

  const shellClasses = [
    styles.shell,
    isCollapsed ? styles.collapsed : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClasses}>
      <Sidebar
        items={effectiveNavItems}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        currentUser={currentUser}
        brandName={brandName}
        brandBadge={brandBadge}
      />

      <AppHeader
        title={title}
        subtitle={subtitle}
        onOpenMobileNav={() => setIsMobileOpen(true)}
        currentUser={currentUser}
      />

      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}

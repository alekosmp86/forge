'use client';

import { useState } from 'react';
import { LayoutDashboard, Layers, Settings, ShieldCheck } from 'lucide-react';
import styles from './AppShell.module.css';
import { Sidebar } from './Sidebar';
import { AppHeader } from './AppHeader';
import type { AppShellProps, NavItem } from './types';

const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={18} aria-hidden="true" />,
    href: '#',
    isActive: true,
  },
  {
    id: 'modules',
    label: 'Modules',
    icon: <Layers size={18} aria-hidden="true" />,
    href: '#',
    badge: 'Core',
  },
  {
    id: 'security',
    label: 'Security & Auth',
    icon: <ShieldCheck size={18} aria-hidden="true" />,
    href: '#',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings size={18} aria-hidden="true" />,
    href: '#',
  },
];

export function AppShell({
  children,
  navItems = DEFAULT_NAV_ITEMS,
  title = 'Dashboard',
  subtitle = 'Kernel Shell Management',
  currentUser,
  brandName = 'nexcore',
  brandBadge = 'Kernel Shell',
}: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const shellClasses = [
    styles.shell,
    isCollapsed ? styles.collapsed : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClasses}>
      <Sidebar
        items={navItems}
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

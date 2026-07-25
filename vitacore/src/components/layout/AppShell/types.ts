import React from 'react';
import type { ICurrentUser } from '@forge/shared-types';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  isActive?: boolean;
  badge?: string;
}

export interface SidebarProps {
  items: NavItem[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  currentUser?: ICurrentUser;
  brandName?: string;
  brandBadge?: string;
}

export interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  onOpenMobileNav: () => void;
  currentUser?: ICurrentUser;
}

export interface AppShellProps {
  children: React.ReactNode;
  navItems?: NavItem[];
  title?: string;
  subtitle?: string;
  currentUser?: ICurrentUser;
  brandName?: string;
  brandBadge?: string;
}

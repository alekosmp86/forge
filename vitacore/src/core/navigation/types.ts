import React from 'react';
import type { UserRole } from '@forge/shared-types';

export const NavSection = {
  MAIN: 'main',
  ADMIN: 'admin',
  SETTINGS: 'settings',
} as const;

export type NavSection = (typeof NavSection)[keyof typeof NavSection];

export interface ModuleNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  isActive?: boolean;
  badge?: string;
  order?: number; // Sort weight: lower numbers appear first (default: 100)
  section?: NavSection;
  requiredRole?: UserRole;
}

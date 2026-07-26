'use client';

import { LayoutDashboard, Layers, Settings, ShieldCheck, ShoppingCart } from 'lucide-react';
import { navRegistry } from './navRegistry';
import { NavSection } from './types';

let isInitialized = false;

export function initCoreNavigation(): void {
  if (isInitialized) return;
  isInitialized = true;

  navRegistry.registerMany([
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} aria-hidden="true" />,
      href: '#',
      isActive: true,
      order: 10,
      section: NavSection.MAIN,
    },
    {
      id: 'sales-module',
      label: 'Sales & Orders',
      icon: <ShoppingCart size={18} aria-hidden="true" />,
      href: '#',
      badge: 'Module',
      order: 20,
      section: NavSection.MAIN,
    },
    {
      id: 'modules',
      label: 'Modules',
      icon: <Layers size={18} aria-hidden="true" />,
      href: '#',
      badge: 'Core',
      order: 30,
      section: NavSection.MAIN,
    },
    {
      id: 'security',
      label: 'Security & Auth',
      icon: <ShieldCheck size={18} aria-hidden="true" />,
      href: '#',
      order: 40,
      section: NavSection.SETTINGS,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={18} aria-hidden="true" />,
      href: '#',
      order: 50,
      section: NavSection.SETTINGS,
    },
  ]);
}

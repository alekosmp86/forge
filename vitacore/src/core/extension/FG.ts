'use client';

import { navRegistry } from '../navigation/navRegistry';
import { headerRegistry } from './headerRegistry';

/**
 * Forge Extension SDK (`FG`).
 * Centralized namespace for all application and UI extension points.
 */
export const FG = {
  UI: {
    Sidebar: navRegistry,
    Header: headerRegistry,
  },
} as const;

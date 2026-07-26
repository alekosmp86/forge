import { navRegistry } from '../navigation/navRegistry';

/**
 * Forge Extension SDK (`FG`).
 * Centralized namespace for all application and UI extension points.
 */
export const FG = {
  UI: {
    Sidebar: navRegistry,
    // Future expansion points:
    // Footer: footerRegistry,
    // HeaderActions: headerActionsRegistry,
  },
} as const;

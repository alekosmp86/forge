import { useSyncExternalStore, useCallback } from 'react';
import type { UserRole } from '@forge/shared-types';
import { navRegistry } from './navRegistry';
import type { ModuleNavItem } from './types';

/**
 * Custom React hook to reactively subscribe to navRegistry changes in Client Components.
 */
export function useNavItems(userRole?: UserRole): ModuleNavItem[] {
  const subscribe = useCallback(
    (onStoreChange: () => void) => navRegistry.subscribe(onStoreChange),
    []
  );

  const getSnapshot = useCallback(
    () => navRegistry.getItems(userRole),
    [userRole]
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

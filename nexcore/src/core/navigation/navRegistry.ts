import { useSyncExternalStore, useCallback } from 'react';
import { UserRole } from '@forge/shared-types';
import type { ModuleNavItem } from './types';

export class NavigationRegistry {
  private itemsMap = new Map<string, ModuleNavItem>();
  private listeners = new Set<() => void>();
  private cachedSnapshot: ModuleNavItem[] | null = null;
  private cachedRole: UserRole | undefined = undefined;

  subscribe = (listener: () => void): () => void => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify(): void {
    this.cachedSnapshot = null;
    this.listeners.forEach((listener) => listener());
  }

  register(item: ModuleNavItem): void {
    this.itemsMap.set(item.id, item);
    this.notify();
  }

  registerMany(items: ModuleNavItem[]): void {
    items.forEach((item) => this.itemsMap.set(item.id, item));
    this.notify();
  }

  unregister(id: string): void {
    if (this.itemsMap.delete(id)) {
      this.notify();
    }
  }

  getItems = (userRole?: UserRole): ModuleNavItem[] => {
    if (this.cachedSnapshot && this.cachedRole === userRole) {
      return this.cachedSnapshot;
    }

    const items = Array.from(this.itemsMap.values());

    const result = items
      .filter((item) => {
        if (!item.requiredRole) return true;
        if (!userRole) return false;
        if (item.requiredRole === UserRole.ADMIN && userRole !== UserRole.ADMIN) return false;
        return true;
      })
      .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));

    this.cachedSnapshot = result;
    this.cachedRole = userRole;
    return result;
  };

  reset(): void {
    this.itemsMap.clear();
    this.notify();
  }
}

export const navRegistry = new NavigationRegistry();

/**
 * Custom React hook to reactively subscribe to navRegistry changes.
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

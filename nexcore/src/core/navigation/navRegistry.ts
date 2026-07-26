import type { UserRole } from '@forge/shared-types';
import type { ModuleNavItem } from './types';

export class NavigationRegistry {
  private itemsMap = new Map<string, ModuleNavItem>();

  register(item: ModuleNavItem): void {
    this.itemsMap.set(item.id, item);
  }

  registerMany(items: ModuleNavItem[]): void {
    items.forEach((item) => this.register(item));
  }

  unregister(id: string): void {
    this.itemsMap.delete(id);
  }

  getItems(userRole?: UserRole): ModuleNavItem[] {
    const items = Array.from(this.itemsMap.values());

    return items
      .filter((item) => {
        if (!item.requiredRole) return true;
        if (!userRole) return false;
        if (item.requiredRole === 'ADMIN' && userRole !== 'ADMIN') return false;
        return true;
      })
      .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
  }

  reset(): void {
    this.itemsMap.clear();
  }
}

export const navRegistry = new NavigationRegistry();

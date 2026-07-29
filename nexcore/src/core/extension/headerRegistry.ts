'use client';

import { useSyncExternalStore, useCallback } from 'react';
import type { ComponentType } from 'react';

export interface HeaderExtensionSlot {
  id: string;
  order?: number;
  component: ComponentType;
}

class HeaderRegistry {
  private slots: Map<string, HeaderExtensionSlot> = new Map();
  private listeners: Set<() => void> = new Set();
  private cachedSnapshot: HeaderExtensionSlot[] | null = null;

  register(slot: HeaderExtensionSlot): void {
    this.slots.set(slot.id, slot);
    this.notify();
  }

  unregister(id: string): void {
    this.slots.delete(id);
    this.notify();
  }

  getSlots = (): HeaderExtensionSlot[] => {
    if (!this.cachedSnapshot) {
      this.cachedSnapshot = Array.from(this.slots.values()).sort((a, b) => (a.order || 10) - (b.order || 10));
    }
    return this.cachedSnapshot;
  };

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
}

export const headerRegistry = new HeaderRegistry();

export function useHeaderSlots(): HeaderExtensionSlot[] {
  const subscribe = useCallback(
    (onStoreChange: () => void) => headerRegistry.subscribe(onStoreChange),
    []
  );

  const getSnapshot = useCallback(
    () => headerRegistry.getSlots(),
    []
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

"use client";
import { useCallback, useSyncExternalStore } from "react";

/**
 * A per-visitor list persisted in localStorage (every access in try/catch), read through
 * useSyncExternalStore like components/home/calculator/useArchive.ts so there is no
 * setState-in-effect and no hydration flash: the server snapshot is always an empty list.
 * Used by the history/tape panels (scientific-calculator, dice-roller).
 */
const listeners = new Map<string, Set<() => void>>();
const cache = new Map<string, { raw: string | null; items: unknown[] }>();
const EMPTY: unknown[] = [];

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function snapshot<T>(key: string): T[] {
  const raw = read(key);
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.items as T[];
  let items: unknown[] = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) items = parsed;
    } catch {
      items = [];
    }
  }
  cache.set(key, { raw, items });
  return items as T[];
}

function write<T>(key: string, items: T[]) {
  const raw = JSON.stringify(items);
  try {
    localStorage.setItem(key, raw);
  } catch {
    // storage unavailable — keep the list for this page view only.
  }
  cache.set(key, { raw: read(key) ?? raw, items });
  listeners.get(key)?.forEach((cb) => cb());
}

export function usePersistedList<T extends { id: string }>(key: string, limit = 50) {
  const subscribe = useCallback(
    (cb: () => void) => {
      const set = listeners.get(key) ?? new Set();
      set.add(cb);
      listeners.set(key, set);
      const onStorage = (e: StorageEvent) => e.key === key && cb();
      window.addEventListener("storage", onStorage);
      return () => {
        set.delete(cb);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key],
  );
  const items = useSyncExternalStore(subscribe, () => snapshot<T>(key), () => EMPTY as T[]);

  const add = useCallback((item: T) => write(key, [item, ...snapshot<T>(key)].slice(0, limit)), [key, limit]);
  const remove = useCallback((id: string) => write(key, snapshot<T>(key).filter((i) => i.id !== id)), [key]);
  const clear = useCallback(() => write<T>(key, []), [key]);

  return { items, add, remove, clear };
}

export function newEntryId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

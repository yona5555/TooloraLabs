"use client";
import { useCallback, useSyncExternalStore } from "react";
import type { HistoryEntry } from "./homeCalculatorReducer";

const STORAGE_KEY = "tooloralabs:home-calculator-archive";
const ARCHIVE_LIMIT = 200;

/**
 * Persists entries the user explicitly "saves" from the live History tab
 * into a separate, localStorage-backed Archive tab that survives reloads —
 * distinct from `state.history`, which is just the in-memory running log for
 * the current session. Saved entries get freshly stamped ids rather than
 * reusing the reducer's `historySeq`-derived ones, since that counter
 * restarts at 0 every session and would otherwise collide with ids already
 * sitting in a previous session's archive.
 *
 * Reads localStorage through useSyncExternalStore (the same pattern
 * ThemeToggle.tsx already uses for its own browser-only state) rather than
 * state+effect, so the store is the single source of truth and there's no
 * synchronous setState-in-effect to cause a hydration-mismatch flash.
 */
function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parseArchive(raw: string | null): HistoryEntry[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeArchive(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage full/unavailable — nothing to persist, but subscribers still see the update below.
  }
  notify();
}

const listeners = new Set<() => void>();
function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
function notify() {
  listeners.forEach((callback) => callback());
}

// getSnapshot must return a referentially stable value when the underlying
// data hasn't changed, or useSyncExternalStore re-renders in a loop —
// re-parsing is skipped unless the raw string itself changed since last read.
let lastRaw: string | null | undefined;
let lastParsed: HistoryEntry[] = [];
function getSnapshot(): HistoryEntry[] {
  const raw = readRaw();
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastParsed = parseArchive(raw);
  }
  return lastParsed;
}

// A shared, module-level constant — not a fresh `[]` literal per call, which would fail
// useSyncExternalStore's referential-stability check and log a "should be cached" warning
// (and re-render) on every single invocation, since `[] !== []` in every comparison.
const EMPTY_ARCHIVE: HistoryEntry[] = [];
function getServerSnapshot(): HistoryEntry[] {
  return EMPTY_ARCHIVE;
}

export function useArchive() {
  const archive = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const saveEntries = useCallback((entries: HistoryEntry[]) => {
    if (entries.length === 0) return;
    const stamped = entries.map((entry, i) => ({ ...entry, id: Date.now() + i }));
    const next = [...stamped, ...parseArchive(readRaw())].slice(0, ARCHIVE_LIMIT);
    writeArchive(next);
  }, []);

  return { archive, saveEntries };
}

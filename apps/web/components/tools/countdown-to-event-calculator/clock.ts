/**
 * A live wall-clock "now" exposed via useSyncExternalStore, following the same pattern used
 * elsewhere in this project for browser-only, time-varying values. A plain useState+useEffect
 * that calls setState synchronously on mount would be flagged by this project's stricter
 * react-hooks/set-state-in-effect rule; useSyncExternalStore is the sanctioned alternative,
 * and it's also the React-recommended way to avoid an SSR/client hydration mismatch for a
 * value (the current time) that's inherently unknowable at server-render time.
 */
export function subscribeToClock(callback: () => void): () => void {
  const id = setInterval(callback, 1000);
  return () => clearInterval(id);
}

export function getNowSnapshot(): number {
  return Date.now();
}

export function getServerNowSnapshot(): number {
  return 0;
}

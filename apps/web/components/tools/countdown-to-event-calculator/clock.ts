/**
 * A live wall-clock "now" exposed via useSyncExternalStore, following the same pattern used
 * elsewhere in this project for browser-only, time-varying values. A plain useState+useEffect
 * that calls setState synchronously on mount would be flagged by this project's stricter
 * react-hooks/set-state-in-effect rule; useSyncExternalStore is the sanctioned alternative,
 * and it's also the React-recommended way to avoid an SSR/client hydration mismatch for a
 * value (the current time) that's inherently unknowable at server-render time.
 *
 * getSnapshot must return the same value between calls until the store actually changes
 * (per useSyncExternalStore's contract) — returning Date.now() directly makes every call
 * produce a new value, which React reads as a permanent tear and re-renders forever
 * ("Maximum update depth exceeded"). Caching the timestamp here and only updating it from
 * the subscribed tick itself keeps the snapshot stable except on the once-per-second tick.
 */
let cachedNow = 0;

export function subscribeToClock(callback: () => void): () => void {
  const tick = () => {
    cachedNow = Date.now();
    callback();
  };
  tick();
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}

export function getNowSnapshot(): number {
  return cachedNow;
}

export function getServerNowSnapshot(): number {
  return 0;
}

"use client";
import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
/** useSyncExternalStore -- not useState+useEffect -- is the hydration-safe, lint-clean way to
 * read a browser media query: the server snapshot is always false, so SSR and first client
 * render always agree (no mismatch), and React itself (not an effect body) handles reconciling
 * the real value right after. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(REDUCED_MOTION_QUERY).matches, () => false);
}

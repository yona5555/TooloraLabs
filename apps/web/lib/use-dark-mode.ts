"use client";
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}
function getServerSnapshot() {
  return false;
}

/** Whether the site's dark theme is currently active — same detection ThemeToggle.tsx uses to flip its own icon, shared here for any client component whose colors can't be handled by `dark:` classes alone (e.g. a color string passed as a prop to a canvas library like Mafs). */
export function useIsDarkMode(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

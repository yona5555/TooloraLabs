"use client";
import { useLayoutEffect, type RefObject } from "react";

/**
 * The result table box scrolls inside a fixed height (fill mode at lg: whatever height the column
 * leaves; below lg: the 520px cap), so its bottom edge would usually slice a row in half. Pull the
 * bottom up to the last row that fits whole (the rest stays reachable by scrolling): fill mode
 * moves the absolute box's bottom, the capped box gets a lower max-height. Runs after every
 * render and on every resize of the wrapper. Does nothing when the box does not scroll.
 * Shared by the health tools' Result tables.
 */
export function useSnapTableRows(wrapRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = wrapRef.current;
    const box = root?.querySelector("table")?.closest<HTMLElement>(".overflow-auto");
    if (!root || !box) return;
    const snap = () => {
      box.style.bottom = "";
      box.style.maxHeight = "";
      if (box.scrollHeight <= box.clientHeight + 1) return;
      const absolute = getComputedStyle(box).position === "absolute";
      const top = box.getBoundingClientRect().top + box.clientTop - box.scrollTop;
      const limit = box.clientHeight;
      let fit = 0;
      box.querySelectorAll("tr").forEach((tr) => {
        const bottom = tr.getBoundingClientRect().bottom - top;
        if (bottom <= limit + 0.5 && bottom > fit) fit = bottom;
      });
      if (fit <= 0 || limit - fit <= 0.5) return;
      if (absolute) box.style.bottom = `${Math.floor(limit - fit)}px`;
      else box.style.maxHeight = `${Math.ceil(fit) + box.offsetHeight - box.clientHeight}px`;
    };
    snap();
    const ro = new ResizeObserver(snap);
    ro.observe(root);
    return () => ro.disconnect();
  });
}

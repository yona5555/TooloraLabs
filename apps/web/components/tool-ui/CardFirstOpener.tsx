"use client";
import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { openFirstCard } from "./cardPrepaint";

/** Re-picks the first open card after a client-side navigation (the inline script covers the first load). */
export default function CardFirstOpener() {
  const pathname = usePathname();
  const firstLoad = useRef(true);
  useLayoutEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    openFirstCard();
  }, [pathname]);
  return null;
}

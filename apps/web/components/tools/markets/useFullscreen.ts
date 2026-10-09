"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Fullscreen for one element. The browser owns the state (Esc exits natively), so it is mirrored
 * from `fullscreenchange` rather than tracked from clicks.
 */
export function useFullscreen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement === ref.current && ref.current !== null);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  function toggle() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void ref.current?.requestFullscreen();
  }

  return { ref, isFullscreen, toggle };
}

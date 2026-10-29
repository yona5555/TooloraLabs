"use client";
import { useEffect, useState } from "react";

// Canvas 2D (`ctx.font`) does not read CSS variables, and it draws with a web font only once that font has
// loaded. These two helpers give a canvas the same self-hosted stacks as the page (lib/fonts.ts) and redraw
// it when a font arrives, so a canvas never paints in a system font.

const resolved = new Map<string, string>();

/** A font-family value with its var() references resolved on this page (per <html lang>, whose stacks differ). */
export function resolveFontFamily(value: string): string {
  const key = `${document.documentElement.lang}\n${value}`;
  let family = resolved.get(key);
  if (family === undefined) {
    const el = document.createElement("span");
    el.style.fontFamily = value;
    el.style.display = "none";
    document.body.appendChild(el);
    family = getComputedStyle(el).fontFamily;
    el.remove();
    resolved.set(key, family);
  }
  return family;
}

/** A number that changes each time the page finishes loading web fonts: a dependency for canvas drawing. */
export function useFontsVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    document.fonts.addEventListener("loadingdone", bump);
    return () => document.fonts.removeEventListener("loadingdone", bump);
  }, []);
  return version;
}

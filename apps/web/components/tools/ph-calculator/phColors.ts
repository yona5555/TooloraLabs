"use client";
import { useEffect, useState } from "react";

/**
 * Reads the pH colour tokens (glass-tokens.css) at runtime for the 3D scenes, which can't use
 * var(). Tailwind v4 tokens are OKLCH / color-mix values, so each one is resolved by painting it onto
 * a 1×1 canvas and reading the sRGB pixel back. Re-reads whenever the site theme class changes.
 */
let probe: CanvasRenderingContext2D | null = null;

function resolve(css: string): string {
  if (!probe) {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    probe = c.getContext("2d", { willReadFrequently: true });
  }
  const el = document.createElement("span");
  el.style.color = css;
  el.style.display = "none";
  document.body.appendChild(el);
  const computed = getComputedStyle(el).color;
  el.remove();
  if (!probe) return computed;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = computed;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

export type PhColors = Record<string, string>;

export const UI_TOKENS = Array.from({ length: 15 }, (_, i) => `--ph-ui-${i}`);

/** Resolves CSS custom properties (or any CSS colour expression) to hex; null until mounted. */
export function usePhColors(tokens: string[]): PhColors | null {
  const key = tokens.join("|");
  const [colors, setColors] = useState<PhColors | null>(null);
  useEffect(() => {
    const list = key.split("|");
    const read = () => setColors(Object.fromEntries(list.map((t) => [t, resolve(t.startsWith("--") ? `var(${t})` : t)])));
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => obs.disconnect();
  }, [key]);
  return colors;
}

/** Linear sRGB-ish blend of two hex colours (for the universal-indicator liquid in 3D). */
export function mixHex(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((x, i) => Math.round(x + (pb[i] - x) * t).toString(16).padStart(2, "0")).join("")}`;
}

/** Universal-indicator colour at a pH from resolved tokens. */
export function uiHex(colors: PhColors, pH: number): string {
  const p = Math.min(14, Math.max(0, pH));
  const lo = Math.floor(p);
  const hi = Math.min(14, lo + 1);
  return mixHex(colors[`--ph-ui-${lo}`], colors[`--ph-ui-${hi}`], p - lo);
}

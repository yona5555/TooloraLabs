"use client";

import { useEffect, useState } from "react";

/** Palette shared by every live 3D drawing; follows the site's `.dark` class on <html>. */
export type Palette3D = {
  dark: boolean;
  bg: string;
  grid: string;
  text: string;
  muted: string;
  primary: string;
  accent: string;
  positive: string;
  warning: string;
  danger: string;
  faces: string[];
};

const LIGHT: Palette3D = {
  dark: false,
  bg: "#f8fafc",
  grid: "#cbd5e1",
  text: "#0f172a",
  muted: "#64748b",
  primary: "#2563eb",
  accent: "#7c3aed",
  positive: "#059669",
  warning: "#d97706",
  danger: "#dc2626",
  faces: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"],
};

const DARK: Palette3D = {
  dark: true,
  bg: "#18181b",
  grid: "#3f3f46",
  text: "#f4f4f5",
  muted: "#a1a1aa",
  primary: "#60a5fa",
  accent: "#a78bfa",
  positive: "#34d399",
  warning: "#fbbf24",
  danger: "#f87171",
  faces: ["#60a5fa", "#a78bfa", "#34d399", "#fbbf24", "#f87171", "#22d3ee"],
};

export function usePalette3D(): Palette3D {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setDark(root.classList.contains("dark"));
    read();
    const obs = new MutationObserver(read);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark ? DARK : LIGHT;
}

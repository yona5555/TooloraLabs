"use client";
import { Polyline } from "mafs";
import type { RealFunction } from "@tooloralabs/tools";

type V2 = [number, number];

/** Grid spacing of 1, 2 or 5 × 10ⁿ giving about `target` lines over the span. */
export function niceStep(span: number, target = 6): number {
  const raw = Math.max(1e-9, span / target);
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

/** Sampled curve split at undefined points, jumps and the visible y-window (data coordinates). */
export function curvePieces(f: RealFunction, xMin: number, xMax: number, yLo: number, yHi: number, n = 400): V2[][] {
  const pieces: V2[][] = [];
  const span = yHi - yLo;
  const pad = span * 0.15;
  let cur: V2[] = [];
  let prev: number | null = null;
  for (let i = 0; i <= n; i++) {
    const x = xMin + ((xMax - xMin) * i) / n;
    const y = f(x);
    const out = y === null || y < yLo - pad || y > yHi + pad || (prev !== null && Math.abs(y - prev) > span * 0.6);
    if (out) {
      if (cur.length > 1) pieces.push(cur);
      cur = [];
      if (y !== null && y >= yLo - pad && y <= yHi + pad) cur.push([x, y]);
    } else cur.push([x, y]);
    prev = y;
  }
  if (cur.length > 1) pieces.push(cur);
  return pieces;
}

/** The live function drawn as open polylines inside a Mafs view. */
export function MafsCurve({ f, xMin, xMax, yLo, yHi, color }: { f: RealFunction; xMin: number; xMax: number; yLo: number; yHi: number; color: string }) {
  return (
    <>
      {curvePieces(f, xMin, xMax, yLo, yHi).map((pts, i) => (
        <Polyline key={i} points={pts} color={color} weight={2.5} fillOpacity={0} svgPolylineProps={{ fill: "none" }} />
      ))}
    </>
  );
}

export const MAFS_COLORS = {
  light: { curve: "#2563eb", point: "#dc2626", tangent: "#d97706", fill: "#10b981", neg: "#e11d48", muted: "#64748b" },
  dark: { curve: "#60a5fa", point: "#f87171", tangent: "#fbbf24", fill: "#34d399", neg: "#fb7185", muted: "#a1a1aa" },
};

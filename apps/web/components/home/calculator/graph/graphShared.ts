import type { CompiledGraph, GraphXY } from "@tooloralabs/tools";

export type GraphView = { xMin: number; xMax: number; yMin: number; yMax: number };

export const DEFAULT_VIEW: GraphView = { xMin: -6, xMax: 6, yMin: -4, yMax: 4 };

export const MAX_FUNCTIONS = 4;

export const FUNCTION_COLORS = {
  light: ["#2563eb", "#dc2626", "#059669", "#7c3aed"],
  dark: ["#60a5fa", "#f87171", "#34d399", "#a78bfa"],
};

/** One plotted function as the graph views receive it (only valid, compiled entries). */
export type PlotFunction = {
  id: number;
  color: string;
  graph: CompiledGraph;
  active: boolean;
};

export type KeyPointKind = "root" | "yIntercept" | "maximum" | "minimum" | "intersection";

export type MarkedPoint = GraphXY & { kind: KeyPointKind; fnId: number; color: string; otherId?: number };

/** Short, sign-correct number for labels: up to 4 decimals, scientific beyond 1e5 / below 1e-3. */
export function fmt(v: number | null | undefined, digits = 4): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return "—";
  if (Math.abs(v) < 1e-10) return "0";
  const a = Math.abs(v);
  const s = a >= 1e5 || a < 1e-3 ? v.toExponential(2) : String(Number(v.toFixed(digits)));
  return s.replace(/^-/, "−");
}

/** Tick label with just enough decimals for the tick step. */
export function fmtTick(v: number, step: number): string {
  if (Math.abs(v) < 1e-12) return "0";
  const a = Math.abs(v);
  if (a >= 1e5 || step < 1e-4) return v.toExponential(1).replace(/^-/, "−");
  const decimals = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
  return v.toFixed(decimals).replace(/^-/, "−");
}

/** Height colormap (deep blue → cyan → green → yellow → red) for surfaces. */
const STOPS: [number, number, number][] = [
  [30, 58, 138],
  [37, 99, 235],
  [6, 182, 212],
  [16, 185, 129],
  [250, 204, 21],
  [249, 115, 22],
  [220, 38, 38],
];

export function heightColor(t: number): [number, number, number] {
  const u = Math.min(1, Math.max(0, t)) * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(u));
  const f = u - i;
  const a = STOPS[i];
  const b = STOPS[i + 1];
  return [(a[0] + (b[0] - a[0]) * f) / 255, (a[1] + (b[1] - a[1]) * f) / 255, (a[2] + (b[2] - a[2]) * f) / 255];
}

export const HEIGHT_GRADIENT_CSS = `linear-gradient(to right, ${STOPS.map((c) => `rgb(${c.join(",")})`).join(", ")})`;

"use client";
import { useMemo } from "react";
import { formatLocalizedNumber, parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import {
  analyzeKinematics,
  KinematicsCalculator as KinematicsCalculatorTool,
  type KinematicsAnalysis,
  type KinematicsCalculatorOutput,
} from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";
import { resolveDigitStyle } from "@/lib/digit-style";
import type { KinematicsMode, KinematicsSolveForDistance, KinematicsSolveForTime } from "./types";

export type KinDraft = {
  mode: KinematicsMode;
  tSolve: KinematicsSolveForTime;
  dSolve: KinematicsSolveForDistance;
  v0: string;
  v: string;
  a: string;
  t: string;
  dx: string;
};

export const KIN_DEFAULTS: KinDraft = { mode: "timeBased", tSolve: "v", dSolve: "v", v0: "0", v: "10", a: "2", t: "5", dx: "25" };

export const { LiveProvider: KinLiveProvider, useLiveState: useKinLive } = createLiveToolState<KinDraft>();

const tool = new KinematicsCalculatorTool();

const num = (s: string) => parseLocalizedNumber(s) || 0;

export function computeKinematics(d: KinDraft): KinematicsCalculatorOutput {
  return tool.execute(
    { mode: d.mode, solveForTime: d.tSolve, solveForDistance: d.dSolve, v0: num(d.v0), v: num(d.v), a: num(d.a), t: num(d.t), dx: num(d.dx) },
    { locale: "en-US" },
  ).data;
}

export type KinModel = {
  draft: KinDraft;
  result: KinematicsCalculatorOutput;
  /** Full analysis of the solved motion, or null when the inputs have no solution. */
  k: KinematicsAnalysis | null;
  /** The quantity being solved for in the active mode. */
  solved: "v" | "v0" | "a" | "t" | "dx";
  digitStyle: DigitStyle;
  /** Localized number (digit style follows the inputs). */
  f: (v: number, max?: number) => string;
};

export function buildKinModel(d: KinDraft): KinModel {
  const result = computeKinematics(d);
  const digitStyle = resolveDigitStyle(d.v0, d.v, d.a, d.t, d.dx);
  const f = (v: number, max = 2) => (Number.isFinite(v) ? formatLocalizedNumber(Math.abs(v) < 1e-9 ? 0 : v, digitStyle, { maximumFractionDigits: max }) : "∞");
  return {
    draft: d,
    result,
    k: result.error ? null : analyzeKinematics(result),
    solved: d.mode === "timeBased" ? d.tSolve : d.dSolve,
    digitStyle,
    f,
  };
}

/** The live motion and its full analysis, shared by the Result card and every indicator. */
export function useKinModel(): KinModel {
  const { dims } = useKinLive();
  return useMemo(() => buildKinModel(dims), [dims]);
}

/** The equation that produced the solved quantity, with the current numbers substituted. */
export function solvedFormula({ draft, result: r, solved, f }: KinModel): string {
  const [v0, v, a, t, dx] = [f(r.v0), f(r.v), f(r.a), f(r.t), f(r.dx)];
  if (draft.mode === "timeBased") {
    if (solved === "v") return `v = v₀ + a t = ${v0} + ${a} × ${t}`;
    if (solved === "v0") return `v₀ = v − a t = ${v} − ${a} × ${t}`;
    if (solved === "a") return `a = (v − v₀) / t = (${v} − ${v0}) / ${t}`;
    return `t = (v − v₀) / a = (${v} − ${v0}) / ${a}`;
  }
  if (solved === "v") return `v = √(v₀² + 2aΔx) = √(${v0}² + 2 × ${a} × ${dx})`;
  if (solved === "v0") return `v₀ = √(v² − 2aΔx) = √(${v}² − 2 × ${a} × ${dx})`;
  if (solved === "a") return `a = (v² − v₀²) / (2Δx) = (${v}² − ${v0}²) / (2 × ${dx})`;
  return `Δx = (v² − v₀²) / (2a) = (${v}² − ${v0}²) / (2 × ${a})`;
}

/** Rounds SVG coordinates so server and browser math never differ in the last digit (hydration). */
export const r2 = (v: number) => Math.round(v * 100) / 100;

/** Three significant figures, written back into an input as plain text (used by the sliders). */
export function toInput(v: number): string {
  return String(Number(v.toPrecision(3)));
}

/** A round axis ceiling (1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10 × 10ⁿ). */
export function niceCeil(v: number): number {
  if (!(v > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const m = v / p;
  return (m <= 1 ? 1 : m <= 1.2 ? 1.2 : m <= 1.5 ? 1.5 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 3 ? 3 : m <= 4 ? 4 : m <= 5 ? 5 : m <= 6 ? 6 : m <= 8 ? 8 : 10) * p;
}

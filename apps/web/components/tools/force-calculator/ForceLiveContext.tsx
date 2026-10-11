"use client";
import { useMemo } from "react";
import { formatLocalizedNumber, parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import {
  analyzeGravitation,
  analyzeSecondLaw,
  ForceCalculator as ForceCalculatorTool,
  toScientific,
  type ForceCalculatorOutput,
  type GravitationAnalysis,
  type SecondLawAnalysis,
} from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";
import { resolveDigitStyle } from "@/lib/digit-style";
import type { ForceMode, GravitationSolveFor, SecondLawSolveFor } from "./types";

export type ForceDraft = {
  mode: ForceMode;
  slSolve: SecondLawSolveFor;
  gSolve: GravitationSolveFor;
  force: string;
  mass: string;
  acceleration: string;
  mass1: string;
  mass2: string;
  distance: string;
};

export const FORCE_DEFAULTS: ForceDraft = {
  mode: "secondLaw",
  slSolve: "force",
  gSolve: "force",
  force: "10",
  mass: "2",
  acceleration: "5",
  mass1: "5.972e24",
  mass2: "1",
  distance: "6.371e6",
};

export const { LiveProvider: ForceLiveProvider, useLiveState: useForceLive } = createLiveToolState<ForceDraft>();

const tool = new ForceCalculatorTool();

function num(s: string): number {
  return parseLocalizedNumber(s) || 0;
}

export function computeForce(d: ForceDraft, mode: ForceMode = d.mode): ForceCalculatorOutput {
  return tool.execute(
    {
      mode,
      secondLawSolveFor: d.slSolve,
      gravitationSolveFor: d.gSolve,
      force: num(d.force),
      mass: num(d.mass),
      acceleration: num(d.acceleration),
      mass1: num(d.mass1),
      mass2: num(d.mass2),
      distance: num(d.distance),
    },
    { locale: "en-US" },
  ).data;
}

const SUP: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };

/** Number formatter: plain localized digits in [10⁻³, 10⁶), otherwise "m × 10ⁿ". */
export function makeFormatter(ds: DigitStyle) {
  return (v: number, max = 4): string => {
    if (!Number.isFinite(v)) return "∞";
    if (Math.abs(v) < 1e-300) return formatLocalizedNumber(0, ds);
    const av = Math.abs(v);
    if (av >= 1e6 || av < 1e-3) {
      const { mantissa, exponent } = toScientific(v, 4);
      const e = String(exponent)
        .split("")
        .map((c) => SUP[c] ?? c)
        .join("");
      // Non-breaking spaces keep "m × 10ⁿ" on one line in table cells and labels.
      return `${formatLocalizedNumber(mantissa, ds, { maximumFractionDigits: 3 })}\u00a0×\u00a010${e}`;
    }
    return formatLocalizedNumber(v, ds, { maximumFractionDigits: max });
  };
}

export type ForceModel = {
  draft: ForceDraft;
  /** Result of the active mode (what the Result card headlines). */
  result: ForceCalculatorOutput;
  secondLaw: ForceCalculatorOutput;
  gravitation: ForceCalculatorOutput;
  sl: SecondLawAnalysis | null;
  gr: GravitationAnalysis | null;
  digitStyle: DigitStyle;
  f: (v: number, max?: number) => string;
};

export function buildForceModel(d: ForceDraft): ForceModel {
  const secondLaw = computeForce(d, "secondLaw");
  const gravitation = computeForce(d, "gravitation");
  const digitStyle = resolveDigitStyle(d.force, d.mass, d.acceleration, d.mass1, d.mass2, d.distance);
  return {
    draft: d,
    result: d.mode === "secondLaw" ? secondLaw : gravitation,
    secondLaw,
    gravitation,
    sl: secondLaw.error ? null : analyzeSecondLaw(secondLaw.force, secondLaw.mass, secondLaw.acceleration),
    gr: gravitation.error ? null : analyzeGravitation(gravitation.mass1, gravitation.mass2, gravitation.distance, gravitation.force),
    digitStyle,
    f: makeFormatter(digitStyle),
  };
}

/** The live inputs of both laws and their full analysis, shared by the Result card and every indicator. */
export function useForceModel(): ForceModel {
  const { dims } = useForceLive();
  return useMemo(() => buildForceModel(dims), [dims]);
}

/** "10ⁿ" with a superscript exponent (n rounded to 2 decimals). */
export function pow10(e: number): string {
  const n = String(Math.round(e * 100) / 100);
  return `10${n
    .split("")
    .map((c) => SUP[c] ?? (c === "." ? "·" : c))
    .join("")}`;
}

/** Three significant figures, written back into an input as plain text (used by the sliders). */
export function toInput(v: number): string {
  return String(Number(v.toPrecision(3)));
}

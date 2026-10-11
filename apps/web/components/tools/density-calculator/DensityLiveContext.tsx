"use client";
import { useMemo } from "react";
import { formatLocalizedNumber, parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import {
  analyzeDensity,
  DensityCalculator as DensityCalculatorTool,
  toScientific,
  type DensityAnalysis,
  type DensityCalculatorOutput,
} from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";
import { resolveDigitStyle } from "@/lib/digit-style";
import type { DensityOperation } from "./types";

export type DensityDraft = {
  operation: DensityOperation;
  mass: string;
  volume: string;
  density: string;
};

export const DENSITY_DEFAULTS: DensityDraft = { operation: "solveDensity", mass: "100", volume: "50", density: "2.7" };

export const { LiveProvider: DensityLiveProvider, useLiveState: useDensityLive } = createLiveToolState<DensityDraft>();

const tool = new DensityCalculatorTool();

function num(s: string): number {
  return parseLocalizedNumber(s) || 0;
}

export function computeDensity(d: DensityDraft): DensityCalculatorOutput {
  return tool.execute({ operation: d.operation, mass: num(d.mass), volume: num(d.volume), density: num(d.density) }, { locale: "en-US" }).data;
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
      return `${formatLocalizedNumber(mantissa, ds, { maximumFractionDigits: 3 })} × 10${e}`;
    }
    return formatLocalizedNumber(v, ds, { maximumFractionDigits: max });
  };
}

export type DensityModel = {
  draft: DensityDraft;
  result: DensityCalculatorOutput;
  /** Full analysis of the solved state; null when the result is an error or not a positive body. */
  a: DensityAnalysis | null;
  digitStyle: DigitStyle;
  f: (v: number, max?: number) => string;
};

export function buildDensityModel(d: DensityDraft): DensityModel {
  const result = computeDensity(d);
  const digitStyle = resolveDigitStyle(d.mass, d.volume, d.density);
  const valid = !result.error && result.mass > 0 && result.volume > 0 && result.density > 0;
  return { draft: d, result, a: valid ? analyzeDensity(result.mass, result.volume, result.density) : null, digitStyle, f: makeFormatter(digitStyle) };
}

/** The live inputs and the full analysis, shared by the Result card and every indicator. */
export function useDensityModel(): DensityModel {
  const { dims } = useDensityLive();
  return useMemo(() => buildDensityModel(dims), [dims]);
}

/** Three significant figures, written back into an input as plain text (used by the sliders). */
export function toInput(v: number): string {
  return String(Number(v.toPrecision(3)));
}

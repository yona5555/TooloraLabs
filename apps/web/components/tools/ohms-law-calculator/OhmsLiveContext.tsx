"use client";
import { useMemo } from "react";
import { formatLocalizedNumber, parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { analyzeOhms, OhmsLawCalculator as OhmsLawCalculatorTool, toScientific, type OhmsAnalysis, type OhmsLawCalculatorOutput } from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";
import { resolveDigitStyle } from "@/lib/digit-style";
import type { OhmsLawKnownPair } from "./types";

export type OhmsQuantity = "voltage" | "current" | "resistance" | "power";

export type OhmsDraft = {
  pair: OhmsLawKnownPair;
  voltage: string;
  current: string;
  resistance: string;
  power: string;
};

export const OHMS_DEFAULTS: OhmsDraft = { pair: "VI", voltage: "12", current: "2", resistance: "6", power: "24" };

/** The two values the user types for each known pair; the other two are solved. */
export const FIELDS_BY_PAIR: Record<OhmsLawKnownPair, [OhmsQuantity, OhmsQuantity]> = {
  VI: ["voltage", "current"],
  VR: ["voltage", "resistance"],
  IR: ["current", "resistance"],
  VP: ["voltage", "power"],
  IP: ["current", "power"],
  RP: ["resistance", "power"],
};

export const UNIT: Record<OhmsQuantity, string> = { voltage: "V", current: "A", resistance: "Ω", power: "W" };
export const SYMBOL: Record<OhmsQuantity, string> = { voltage: "V", current: "I", resistance: "R", power: "P" };

export const { LiveProvider: OhmsLiveProvider, useLiveState: useOhmsLive } = createLiveToolState<OhmsDraft>();

const tool = new OhmsLawCalculatorTool();

function num(s: string): number {
  return parseLocalizedNumber(s) || 0;
}

export function computeOhms(d: OhmsDraft): OhmsLawCalculatorOutput {
  return tool.execute(
    { knownPair: d.pair, voltage: num(d.voltage), current: num(d.current), resistance: num(d.resistance), power: num(d.power) },
    { locale: "en-US" },
  ).data;
}

const SUP: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };

/** "10ⁿ" with a superscript exponent (n rounded to 2 decimals). */
export function pow10(e: number): string {
  const n = String(Math.round(e * 100) / 100);
  return `10${n
    .split("")
    .map((c) => SUP[c] ?? (c === "." ? "·" : c))
    .join("")}`;
}

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

export type OhmsModel = {
  draft: OhmsDraft;
  result: OhmsLawCalculatorOutput;
  /** Full analysis of the solved circuit, or null when the inputs have no valid result. */
  a: OhmsAnalysis | null;
  /** True for the two quantities that were solved (not typed). */
  solved: Record<OhmsQuantity, boolean>;
  digitStyle: DigitStyle;
  f: (v: number, max?: number) => string;
};

export function buildOhmsModel(d: OhmsDraft): OhmsModel {
  const result = computeOhms(d);
  const digitStyle = resolveDigitStyle(d.voltage, d.current, d.resistance, d.power);
  const known = FIELDS_BY_PAIR[d.pair];
  const solved = { voltage: !known.includes("voltage"), current: !known.includes("current"), resistance: !known.includes("resistance"), power: !known.includes("power") };
  return {
    draft: d,
    result,
    a: result.error ? null : analyzeOhms(result.voltage, result.current, result.resistance, result.power),
    solved,
    digitStyle,
    f: makeFormatter(digitStyle),
  };
}

/** The live inputs and their full analysis, shared by the Result card and every indicator. */
export function useOhmsModel(): OhmsModel {
  const { dims } = useOhmsLive();
  return useMemo(() => buildOhmsModel(dims), [dims]);
}

/** Three significant figures, written back into an input as plain text (used by the sliders). */
export function toInput(v: number): string {
  return String(Number(v.toPrecision(3)));
}

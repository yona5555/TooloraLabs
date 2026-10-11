"use client";
import { useMemo } from "react";
import { formatLocalizedNumber, parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import {
  analyzeKinetic,
  analyzePotential,
  analyzePower,
  analyzeWork,
  EnergyWorkPowerCalculator as EnergyWorkPowerCalculatorTool,
  toScientific,
  type EnergyWorkPowerCalculatorOutput,
  type KineticAnalysis,
  type PotentialAnalysis,
  type PowerAnalysis,
  type WorkAnalysis,
} from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";
import { resolveDigitStyle } from "@/lib/digit-style";
import { ENERGY_WORK_POWER_MODES, type EnergyWorkPowerMode } from "./types";

export type EnergyDraft = {
  mode: EnergyWorkPowerMode;
  force: string;
  distance: string;
  angleDegrees: string;
  mass: string;
  velocity: string;
  height: string;
  workValue: string;
  time: string;
};

export const ENERGY_DEFAULTS: EnergyDraft = {
  mode: "work",
  force: "20",
  distance: "5",
  angleDegrees: "0",
  mass: "10",
  velocity: "4",
  height: "3",
  workValue: "100",
  time: "5",
};

export const { LiveProvider: EnergyLiveProvider, useLiveState: useEnergyLive } = createLiveToolState<EnergyDraft>();

const tool = new EnergyWorkPowerCalculatorTool();

function num(s: string): number {
  return parseLocalizedNumber(s) || 0;
}

export function computeEnergy(d: EnergyDraft, mode: EnergyWorkPowerMode = d.mode): EnergyWorkPowerCalculatorOutput {
  return tool.execute(
    {
      mode,
      force: num(d.force),
      distance: num(d.distance),
      angleDegrees: num(d.angleDegrees),
      mass: num(d.mass),
      velocity: num(d.velocity),
      height: num(d.height),
      workValue: num(d.workValue),
      time: num(d.time),
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
      return `${formatLocalizedNumber(mantissa, ds, { maximumFractionDigits: 3 })} × 10${e}`;
    }
    return formatLocalizedNumber(v, ds, { maximumFractionDigits: max });
  };
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

export const MODE_UNIT: Record<EnergyWorkPowerMode, string> = { work: "J", kineticEnergy: "J", potentialEnergy: "J", power: "W" };

export type EnergyModel = {
  draft: EnergyDraft;
  /** Calculator output of every mode, from the same inputs. */
  outputs: Record<EnergyWorkPowerMode, EnergyWorkPowerCalculatorOutput>;
  /** Output of the active mode (what the Result card headlines). */
  result: EnergyWorkPowerCalculatorOutput;
  headline: number;
  unit: string;
  work: WorkAnalysis;
  kinetic: KineticAnalysis;
  potential: PotentialAnalysis;
  /** Null when the time is not positive (the calculator's zero-time error). */
  power: PowerAnalysis | null;
  /** Energy behind the active mode: W, KE, PE, or the work delivered in power mode (J). */
  activeEnergy: number;
  digitStyle: DigitStyle;
  f: (v: number, max?: number) => string;
};

export function buildEnergyModel(d: EnergyDraft): EnergyModel {
  const outputs = Object.fromEntries(ENERGY_WORK_POWER_MODES.map((m) => [m, computeEnergy(d, m)])) as EnergyModel["outputs"];
  const result = outputs[d.mode];
  const headline = { work: result.work, kineticEnergy: result.kineticEnergy, potentialEnergy: result.potentialEnergy, power: result.power }[d.mode];
  const digitStyle = resolveDigitStyle(d.force, d.distance, d.angleDegrees, d.mass, d.velocity, d.height, d.workValue, d.time);
  const work = analyzeWork(num(d.force), num(d.distance), num(d.angleDegrees));
  const kinetic = analyzeKinetic(num(d.mass), num(d.velocity));
  const potential = analyzePotential(num(d.mass), num(d.height));
  const power = outputs.power.error ? null : analyzePower(num(d.workValue), num(d.time));
  const activeEnergy = { work: work.work, kineticEnergy: kinetic.kineticEnergy, potentialEnergy: potential.potentialEnergy, power: num(d.workValue) }[d.mode];
  return { draft: d, outputs, result, headline, unit: MODE_UNIT[d.mode], work, kinetic, potential, power, activeEnergy, digitStyle, f: makeFormatter(digitStyle) };
}

/** The live inputs of all four formulas and their full analysis, shared by the Result card and every indicator. */
export function useEnergyModel(): EnergyModel {
  const { dims } = useEnergyLive();
  return useMemo(() => buildEnergyModel(dims), [dims]);
}

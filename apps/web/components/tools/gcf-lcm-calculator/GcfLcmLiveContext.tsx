"use client";
import { useMemo } from "react";
import { formatLocalizedNumber, parseLocalizedNumber } from "@tooloralabs/core";
import { GcfLcmCalculator, type GcfLcmCalculatorOutput, type PrimeFactor } from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";
import { resolveDigitStyle } from "@/lib/digit-style";

export type GcfLcmLiveDims = {
  /** Raw input strings, exactly as typed. */
  numbers: string[];
  /** Last valid parsed set: indicators keep showing it while a field is mid-edit or invalid. */
  valid: number[];
};

export const { LiveProvider: GcfLcmLiveProvider, useLiveState: useGcfLcmLive } = createLiveToolState<GcfLcmLiveDims>();

const tool = new GcfLcmCalculator();

export function parseGcfLcmNumbers(numbers: string[]): number[] {
  return numbers.map((s) => {
    if (!s.trim()) return -1;
    const n = parseLocalizedNumber(s);
    return Number.isNaN(n) ? -1 : n;
  });
}

export function computeGcfLcm(nums: number[]): GcfLcmCalculatorOutput {
  return tool.execute({ numbers: nums }, { locale: "en-US" }).data;
}

export type GcfLcmModel = {
  /** The live valid numbers (2–5 positive integers). */
  nums: number[];
  /** First pair, used by the two-number identities (Euclid, GCF × LCM = a × b). */
  a: number;
  b: number;
  result: GcfLcmCalculatorOutput;
  /** Localized integer/decimal (digit style follows the inputs). */
  f: (v: number, max?: number) => string;
  /** "2² × 3" with localized digits; 1 → "1". */
  fz: (factors: PrimeFactor[]) => string;
};

const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
export const sup = (n: number) => String(n).split("").map((c) => SUP[Number(c)]).join("");

export function buildGcfLcmModel(dims: GcfLcmLiveDims): GcfLcmModel {
  const nums = dims.valid;
  const ds = resolveDigitStyle(...dims.numbers);
  const f = (v: number, max = 0) => (Number.isFinite(v) ? formatLocalizedNumber(v, ds, { maximumFractionDigits: max }) : "∞");
  const fz = (factors: PrimeFactor[]) =>
    factors.length === 0 ? f(1) : factors.map((x) => (x.exponent === 1 ? f(x.prime) : `${f(x.prime)}${sup(x.exponent)}`)).join(" × ");
  return { nums, a: nums[0], b: nums[1], result: computeGcfLcm(nums), f, fz };
}

/** The live numbers and the tool's own result, shared by the Result card and every indicator. */
export function useGcfLcmModel(): GcfLcmModel {
  const { dims } = useGcfLcmLive();
  return useMemo(() => buildGcfLcmModel(dims), [dims]);
}

/** Writes one number back into the inputs (used by the sliders of the Euclid tiling lab). */
export function useSetGcfLcmNumber() {
  const { dims, setDim } = useGcfLcmLive();
  return (index: number, value: number) => setDim("numbers", dims.numbers.map((s, i) => (i === index ? String(value) : s)));
}

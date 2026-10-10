/**
 * Pure percentage math behind the Percentage Calculator's live table, 3D grid and indicators.
 * Every mode is reduced to one "frame" (base, percent, part, share of 100) so a single drawing
 * can follow any of the five calculation types. No DOM, no formatting.
 */
import type { PercentageMode } from "./PercentageCalculator";

export type PercentageFrame = {
  /** The 100% reference (old value for a change, the mean for a difference). */
  base: number;
  /** The rate in percent (signed for a change). */
  percent: number;
  /** base × percent ÷ 100 (the change amount for a change, |a − b| for a difference). */
  part: number;
  /** What the 10×10 grid shows, in percent of the base (new ÷ old × 100 for a change). */
  share: number;
  /** The tool's headline answer (unrounded). */
  result: number;
  /** False when the mode divides by zero. */
  valid: boolean;
};

export function percentageFrame(mode: PercentageMode, first: number, second: number): PercentageFrame {
  switch (mode) {
    case "percent-of-number": {
      const part = (first / 100) * second;
      return { base: second, percent: first, part, share: first, result: part, valid: true };
    }
    case "what-percent": {
      if (second === 0) return invalid();
      const percent = (first / second) * 100;
      return { base: second, percent, part: first, share: percent, result: percent, valid: true };
    }
    case "percentage-change": {
      if (first === 0) return invalid();
      const percent = ((second - first) / first) * 100;
      return { base: first, percent, part: second - first, share: 100 + percent, result: percent, valid: true };
    }
    case "reverse-percentage": {
      if (first === 0) return invalid();
      const base = second / (first / 100);
      return { base, percent: first, part: second, share: first, result: base, valid: true };
    }
    case "percentage-difference": {
      if (first + second === 0) return invalid();
      const base = (first + second) / 2;
      const part = Math.abs(first - second);
      const percent = (part / base) * 100;
      return { base, percent, part, share: percent, result: percent, valid: true };
    }
  }
}

function invalid(): PercentageFrame {
  return { base: 0, percent: 0, part: 0, share: 0, result: 0, valid: false };
}

/**
 * Inverse of `percentageFrame(...).share`: the inputs that make the grid show `share`.
 * Used by the drag lab to write a painted grid back into the tool's two fields.
 */
export function percentageInputsForShare(mode: PercentageMode, first: number, second: number, share: number): { first: number; second: number } {
  switch (mode) {
    case "percent-of-number":
    case "reverse-percentage":
      return { first: share, second };
    case "what-percent":
      return { first: (second * share) / 100, second };
    case "percentage-change":
      return { first, second: (first * share) / 100 };
    case "percentage-difference": {
      const q = Math.min(Math.max(share / 100, 0), 1.99);
      const up = (1 + q / 2) / (1 - q / 2);
      return { first, second: second >= first ? first * up : first / up };
    }
  }
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

export type PercentForms = {
  decimal: number;
  perMille: number;
  basisPoints: number;
  /** percent ÷ 100 as a reduced fraction (up to 4 decimals of the percent kept exact). */
  fraction: { num: number; den: number };
  /** "1 in n" (Infinity at 0%). */
  oneIn: number;
  multiplierUp: number;
  multiplierDown: number;
};

export function percentForms(percent: number): PercentForms {
  let scale = 1;
  while (scale < 10000 && Math.abs(percent * scale - Math.round(percent * scale)) > 1e-9) scale *= 10;
  const rawNum = Math.round(percent * scale);
  const rawDen = 100 * scale;
  const g = gcd(rawNum, rawDen);
  return {
    decimal: percent / 100,
    perMille: percent * 10,
    basisPoints: percent * 100,
    fraction: { num: rawNum / g, den: rawDen / g },
    oneIn: percent === 0 ? Infinity : 100 / Math.abs(percent),
    multiplierUp: 1 + percent / 100,
    multiplierDown: 1 - percent / 100,
  };
}

/** Everyday fractions people use to estimate a percentage, nearest first. */
export const PERCENT_BENCHMARKS = [
  { num: 1, den: 10 },
  { num: 1, den: 8 },
  { num: 1, den: 5 },
  { num: 1, den: 4 },
  { num: 1, den: 3 },
  { num: 2, den: 5 },
  { num: 1, den: 2 },
  { num: 3, den: 5 },
  { num: 2, den: 3 },
  { num: 3, den: 4 },
  { num: 4, den: 5 },
  { num: 1, den: 1 },
] as const;

export function nearestBenchmark(percent: number): { num: number; den: number; percent: number; gap: number } {
  let best = { num: 1, den: 1, percent: 100, gap: Infinity };
  for (const b of PERCENT_BENCHMARKS) {
    const p = (b.num / b.den) * 100;
    const gap = percent - p;
    if (Math.abs(gap) < Math.abs(best.gap)) best = { num: b.num, den: b.den, percent: p, gap };
  }
  return best;
}

/** Applying the same percent n times (compound) next to adding it n times (simple). */
export function percentCompoundSeries(base: number, percent: number, steps: number): Array<{ step: number; compound: number; simple: number }> {
  const m = 1 + percent / 100;
  return Array.from({ length: steps + 1 }, (_, step) => ({
    step,
    compound: base * m ** step,
    simple: base * (1 + (step * percent) / 100),
  }));
}

/** The percent that undoes a +percent move (e.g. +25% is undone by −20%). */
export function percentToUndo(percent: number): number {
  return percent <= -100 ? Infinity : (-percent / (100 + percent)) * 100;
}

/** Up by p% then down by p% (and the reverse): both land at base × (1 − p²). */
export function percentUpThenDown(base: number, percent: number): { up: number; upDown: number; netPercent: number } {
  const q = percent / 100;
  const up = base * (1 + q);
  const upDown = up * (1 - q);
  return { up, upDown, netPercent: -q * q * 100 };
}

export type PercentComparisons = {
  changeAB: number | null;
  changeBA: number | null;
  difference: number | null;
  ratio: number | null;
  /** b − a, read as percentage points when both are percents. */
  points: number;
};

export function percentComparisons(a: number, b: number): PercentComparisons {
  return {
    changeAB: a === 0 ? null : ((b - a) / a) * 100,
    changeBA: b === 0 ? null : ((a - b) / b) * 100,
    difference: a + b === 0 ? null : (Math.abs(a - b) / ((a + b) / 2)) * 100,
    ratio: a === 0 ? null : b / a,
    points: b - a,
  };
}

export type PercentMentalSteps = {
  tenPercent: number;
  onePercent: number;
  tens: number;
  ones: number;
  rest: number;
  tensValue: number;
  onesValue: number;
  restValue: number;
  total: number;
};

/** p% of base built from 10% and 1% blocks: the usual mental-math route. Sign kept on the total. */
export function percentMentalSteps(base: number, percent: number): PercentMentalSteps {
  const sign = percent < 0 ? -1 : 1;
  const p = Math.abs(percent);
  const tens = Math.floor(p / 10);
  const ones = Math.floor(p - tens * 10);
  const rest = p - tens * 10 - ones;
  const tenPercent = base / 10;
  const onePercent = base / 100;
  const tensValue = tens * tenPercent;
  const onesValue = ones * onePercent;
  const restValue = rest * onePercent;
  return { tenPercent, onePercent, tens, ones, rest, tensValue, onesValue, restValue, total: sign * (tensValue + onesValue + restValue) };
}

/** The part for percent − d, percent, percent + d percentage points. */
export function percentSensitivity(base: number, percent: number, deltaPoints: number): Array<{ percent: number; part: number }> {
  return [percent - deltaPoints, percent, percent + deltaPoints].map((p) => ({ percent: p, part: (base * p) / 100 }));
}

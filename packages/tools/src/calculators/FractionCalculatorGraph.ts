import type { FractionOperation } from "./FractionCalculator";

/** Pure math helpers for the fraction-calculator's 15-indicator education layer (batch1 rebuild).
 * Re-uses formatMathValue/snapDragValue from StepByStepMathSolverGraph.ts rather than duplicating
 * a second number formatter — that formatter is fully generic, not solver-specific. */
export { formatMathValue, snapDragValue, toMathValueFraction } from "./StepByStepMathSolverGraph";

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y) [x, y] = [y, x % y];
  return x || 1;
}
export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b) || 1;
}

export type EuclidStep = { a: number; b: number; q: number; r: number };
/** The real steps of Euclid's algorithm for gcd(a,b) — used by the GCD-tiling indicator. */
export function euclidSteps(a: number, b: number): EuclidStep[] {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  const steps: EuclidStep[] = [];
  let guard = 0;
  while (y !== 0 && guard < 50) {
    const q = Math.floor(x / y);
    const r = x % y;
    steps.push({ a: x, b: y, q, r });
    x = y;
    y = r;
    guard++;
  }
  return steps;
}

export type DecimalExpansion = { kind: "terminates"; digits: string } | { kind: "repeats"; nonRepeating: string; repeating: string };
/** Classifies num/den as a terminating or repeating decimal and finds the real repeat cycle via
 * long division remainder tracking (not a heuristic). */
export function decimalExpansion(num: number, den: number, maxDigits = 12): DecimalExpansion {
  const n = Math.abs(Math.trunc(num));
  const d = Math.abs(Math.trunc(den)) || 1;
  let remainder = n % d;
  if (remainder === 0) return { kind: "terminates", digits: "" };
  const seen = new Map<number, number>();
  const digits: number[] = [];
  while (remainder !== 0 && digits.length < maxDigits) {
    if (seen.has(remainder)) {
      const start = seen.get(remainder)!;
      return { kind: "repeats", nonRepeating: digits.slice(0, start).join(""), repeating: digits.slice(start).join("") };
    }
    seen.set(remainder, digits.length);
    remainder *= 10;
    digits.push(Math.floor(remainder / d));
    remainder = remainder % d;
  }
  return { kind: "terminates", digits: digits.join("") };
}

/** Multiples of n up to and including the first multiple >= atLeast (always includes at least `count` terms). */
export function multiplesUntil(n: number, atLeast: number, count = 6): number[] {
  const m = Math.abs(Math.trunc(n)) || 1;
  const out: number[] = [];
  for (let i = 1; out.length < count || out[out.length - 1] < atLeast; i++) {
    out.push(m * i);
    if (i > 200) break;
  }
  return out;
}

export type ContributionShare = { fromA: number; fromB: number; gapToOne: number };
/** For add/subtract: what share of the result (or of 1, the "whole") comes from A vs B. */
export function contributionShare(op: FractionOperation, valueA: number, valueB: number, result: number): ContributionShare {
  if (op === "add") {
    const total = Math.abs(valueA) + Math.abs(valueB) || 1;
    return { fromA: Math.abs(valueA) / total, fromB: Math.abs(valueB) / total, gapToOne: Math.max(0, 1 - result) };
  }
  const total = Math.abs(result) + Math.abs(valueB) || 1;
  return { fromA: Math.abs(result) / total, fromB: Math.abs(valueB) / total, gapToOne: Math.max(0, 1 - Math.abs(valueA)) };
}

export type CrossCompare = { crossA: number; crossB: number; larger: "A" | "B" | "equal" };
/** A/B via cross-multiplication: a*d vs c*b. The larger cross product names the larger fraction. */
export function crossMultiplyCompare(numA: number, denA: number, numB: number, denB: number): CrossCompare {
  const crossA = numA * denB;
  const crossB = numB * denA;
  return { crossA, crossB, larger: crossA === crossB ? "equal" : crossA > crossB ? "A" : "B" };
}

/** Benchmark gauge position: where value sits on [0,1] (clamped), for the 0 / 1/4 / 1/2 / 3/4 / 1 strip. */
export function benchmarkPosition(value: number): number {
  return Math.max(0, Math.min(1, value));
}

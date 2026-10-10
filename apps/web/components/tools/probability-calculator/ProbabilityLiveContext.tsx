"use client";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { formatLocalizedNumber, parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import {
  calculateConditional,
  calculateIndependentAnd,
  calculateOr,
  calculateSingleEventProbability,
  deriveJoint,
  type JointBreakdown,
} from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import type { ProbabilityMode } from "./types";

export type ProbabilityFields = {
  favorable: string;
  total: string;
  pA: string;
  pB: string;
  pBoth: string;
  pAAndB: string;
};

export const PROBABILITY_DEFAULTS: Record<ProbabilityMode, ProbabilityFields> = {
  single: { favorable: "1", total: "6", pA: "50", pB: "50", pBoth: "0", pAAndB: "20" },
  and: { favorable: "1", total: "6", pA: "50", pB: "50", pBoth: "0", pAAndB: "20" },
  or: { favorable: "1", total: "6", pA: "30", pB: "40", pBoth: "10", pAAndB: "20" },
  conditional: { favorable: "1", total: "6", pA: "50", pB: "50", pBoth: "0", pAAndB: "20" },
};

/** The fields each mode actually reads (also the sliders the Venn lab shows). */
export const MODE_FIELDS: Record<ProbabilityMode, Array<keyof ProbabilityFields>> = {
  single: ["favorable", "total"],
  and: ["pA", "pB"],
  or: ["pA", "pB", "pBoth"],
  conditional: ["pAAndB", "pB", "pA"],
};

type LiveValue = {
  mode: ProbabilityMode;
  fields: ProbabilityFields;
  setField: (field: keyof ProbabilityFields, value: string) => void;
};

const Context = createContext<LiveValue | null>(null);

export function ProbabilityLiveProvider({ value, children }: { value: LiveValue; children: ReactNode }) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useProbabilityLive(): LiveValue {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useProbabilityLive must be used inside ProbabilityLiveProvider");
  return ctx;
}

const num = (s: string) => {
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? -1 : n;
};

export type ProbabilityModel = {
  mode: ProbabilityMode;
  fields: ProbabilityFields;
  digitStyle: DigitStyle;
  /** The tool's own validity verdict for the current mode. */
  valid: boolean;
  /** The calculated probability of the current mode (from the clamped joint model, equal to the tool's result when valid). */
  r: number;
  /** Joint model {P(A), P(B), P(A∩B)} and everything derived from it. */
  b: JointBreakdown;
  /** Single mode: k favorable of n; other modes: null. */
  single: { k: number; n: number } | null;
  /** Symbol of the calculated event, e.g. "P(A∪B)". */
  symbol: string;
  /** Which regions [A∩B, A only, B only, neither] make up the calculated event (conditional: within B). */
  target: [boolean, boolean, boolean, boolean];
  f: (v: number, max?: number) => string;
  pct: (v: number, max?: number) => string;
};

/** Set-notation names of the four disjoint regions (language-neutral math symbols). */
export const REGION_SYMBOLS = ["A∩B", "A∩B′", "A′∩B", "A′∩B′"] as const;

export const SYMBOLS: Record<ProbabilityMode, string> = { single: "P(A)", and: "P(A∩B)", or: "P(A∪B)", conditional: "P(A|B)" };
const TARGETS: Record<ProbabilityMode, [boolean, boolean, boolean, boolean]> = {
  single: [true, true, false, false],
  and: [true, false, false, false],
  or: [true, true, true, false],
  conditional: [true, false, false, false],
};

export function buildProbabilityModel(mode: ProbabilityMode, fields: ProbabilityFields): ProbabilityModel {
  const digitStyle = resolveDigitStyle(...Object.values(fields));
  const f = (v: number, max = 4) =>
    Number.isFinite(v) ? formatLocalizedNumber(Math.abs(v) < 1e-12 ? 0 : v, digitStyle, { maximumFractionDigits: max }) : "∞";
  const pct = (v: number, max = 2) => (Number.isFinite(v) ? `${f(v * 100, max)}%` : "∞");
  const pc = (s: string) => num(s) / 100;

  let valid: boolean;
  let single: ProbabilityModel["single"] = null;
  let joint: { pA: number; pB: number; pAB: number };

  if (mode === "single") {
    const kRaw = num(fields.favorable);
    const nRaw = num(fields.total);
    valid = calculateSingleEventProbability(kRaw, nRaw).valid;
    const n = Math.max(1, Number.isFinite(nRaw) ? nRaw : 1);
    const k = Math.min(n, Math.max(0, kRaw));
    single = { k, n };
    const p = k / n;
    // A = success on the first trial, B = success on an independent repeat of the same trial.
    joint = { pA: p, pB: p, pAB: p * p };
  } else if (mode === "and") {
    valid = calculateIndependentAnd(pc(fields.pA), pc(fields.pB)).valid;
    joint = { pA: pc(fields.pA), pB: pc(fields.pB), pAB: pc(fields.pA) * pc(fields.pB) };
  } else if (mode === "or") {
    valid = calculateOr(pc(fields.pA), pc(fields.pB), pc(fields.pBoth)).valid;
    joint = { pA: pc(fields.pA), pB: pc(fields.pB), pAB: pc(fields.pBoth) };
  } else {
    valid = calculateConditional(pc(fields.pAAndB), pc(fields.pB)).valid;
    // P(A) only shapes the picture (A only / neither); P(A|B) itself needs just P(A∩B) and P(B).
    const pB = Math.min(1, Math.max(0, pc(fields.pB)));
    const pAB = Math.min(pB, Math.max(0, pc(fields.pAAndB)));
    const pA = Math.min(pAB + (1 - pB), Math.max(pAB, pc(fields.pA)));
    joint = { pA, pB, pAB };
  }

  const b = deriveJoint(joint);
  const r = mode === "single" ? b.pA : mode === "and" ? b.pAB : mode === "or" ? b.union : Number.isFinite(b.aGivenB) ? b.aGivenB : 0;
  return { mode, fields, digitStyle, valid, r, b, single, symbol: SYMBOLS[mode], target: TARGETS[mode], f, pct };
}

/** The live model shared by the Result card, the 3D card and every indicator on the page. */
export function useProbabilityModel(): ProbabilityModel {
  const { mode, fields } = useProbabilityLive();
  return useMemo(() => buildProbabilityModel(mode, fields), [mode, fields]);
}

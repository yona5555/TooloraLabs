import { parseLocalizedNumber } from "@tooloralabs/core";
import {
  deriveHeroEquation,
  formatMathValue,
  roundSignificant,
  snapDragValue,
  evalPoly,
  derivPolyCoeffs,
  polyDegree,
  solveLinearRoot,
  solveQuadraticRoots,
  quadraticVertex,
  vietaFromQuadratic,
  newtonIterate,
  findRealRootsNumerically,
  bisectionSteps,
  toMathValueFraction,
  type HeroEquation,
  type MathSolverNumericDraft,
  type PolyCoeffs,
  type QuadraticRootResult,
  type NewtonStep,
  type BisectionStep,
  type MathValueFraction,
} from "@tooloralabs/tools";
import type { MathSolverDraft } from "./types";

export {
  deriveHeroEquation,
  formatMathValue,
  roundSignificant,
  snapDragValue,
  evalPoly,
  derivPolyCoeffs,
  polyDegree,
  solveLinearRoot,
  solveQuadraticRoots,
  quadraticVertex,
  vietaFromQuadratic,
  newtonIterate,
  findRealRootsNumerically,
  bisectionSteps,
  toMathValueFraction,
};
export type { HeroEquation, MathSolverNumericDraft, PolyCoeffs, QuadraticRootResult, NewtonStep, BisectionStep, MathValueFraction };

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

/** Parses the string-valued above-fold draft into the numeric shape every education-layer function expects. */
export function parseMathSolverDraft(draft: MathSolverDraft): MathSolverNumericDraft {
  return {
    mode: draft.mode,
    linearA: toNum(draft.linearA),
    linearB: toNum(draft.linearB),
    linearC: toNum(draft.linearC),
    linearD: toNum(draft.linearD),
    quadA: toNum(draft.quadA),
    quadB: toNum(draft.quadB),
    quadC: toNum(draft.quadC),
    fracA: toNum(draft.fracA),
    fracB: toNum(draft.fracB),
    fracOp: draft.fracOp,
    fracC: toNum(draft.fracC),
    fracD: toNum(draft.fracD),
    polynomialTerms: draft.polynomialTerms.map((t) => ({ coefficient: toNum(t.coefficient) ?? 0, power: toNum(t.power) ?? 0 })),
  };
}

/** Convenience: derive the hero equation directly from the string draft. */
export function deriveHeroEquationFromDraft(draft: MathSolverDraft): HeroEquation {
  return deriveHeroEquation(parseMathSolverDraft(draft));
}

export const STEP_COUNT = 4;
export const STEP_LABEL_KEYS = ["entered", "coefficients", "keyQuantity", "result"] as const;

/** Formats a number for display, falling back to a safe value for anything non-finite. */
export function fmt(n: number | null | undefined): string {
  return formatMathValue(n);
}

export type { MathSolverMode, FractionOperator, MathSolverError, StepByStepMathSolverOutput as MathSolverResult } from "@tooloralabs/tools";

export type TermDraft = { coefficient: string; power: string };

export type MathSolverDraft = {
  mode: import("@tooloralabs/tools").MathSolverMode;
  linearA: string;
  linearB: string;
  linearC: string;
  linearD: string;
  quadA: string;
  quadB: string;
  quadC: string;
  fracA: string;
  fracB: string;
  fracOp: import("@tooloralabs/tools").FractionOperator;
  fracC: string;
  fracD: string;
  polynomialTerms: TermDraft[];
  /**
   * Which of the 4 generic solve stations (0=equation as entered, 1=coefficients identified,
   * 2=key computed quantity, 3=final result) the hero and all 15 indicators are currently
   * showing. A navigation concept for the education layer only — ignored by the real engine
   * call in MathSolver.tsx, so it rides along in the draft harmlessly.
   */
  selectedStep: number;
  /** The derivative-mode degree>=3 hero's free explorer point x — the one case with no closed-form
   * handle, so it rides in the draft (like selectedStep) rather than local component state, both to
   * share it with indicators and because effects must never call a local useState setter directly. */
  explorerX: string;
};

export function emptyMathSolverDraft(): MathSolverDraft {
  return {
    mode: "quadratic-equation",
    linearA: "3",
    linearB: "5",
    linearC: "2",
    linearD: "9",
    quadA: "2",
    quadB: "-4",
    quadC: "-6",
    fracA: "1",
    fracB: "2",
    fracOp: "add",
    fracC: "1",
    fracD: "3",
    polynomialTerms: [
      { coefficient: "3", power: "2" },
      { coefficient: "2", power: "1" },
      { coefficient: "5", power: "0" },
    ],
    selectedStep: 3,
    explorerX: "2",
  };
}

export function emptyTerm(): TermDraft {
  return { coefficient: "", power: "" };
}

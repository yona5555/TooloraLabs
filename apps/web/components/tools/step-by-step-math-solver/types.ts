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
};

export function emptyMathSolverDraft(): MathSolverDraft {
  return {
    mode: "linear-equation",
    linearA: "3",
    linearB: "5",
    linearC: "2",
    linearD: "9",
    quadA: "1",
    quadB: "-5",
    quadC: "6",
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
  };
}

export function emptyTerm(): TermDraft {
  return { coefficient: "", power: "" };
}

import type { CompoundingFrequency } from "@tooloralabs/tools";

export type { CompoundingFrequency };

export type SolveMode = "endAmount" | "investmentLength" | "returnRate" | "startingAmount" | "additionalContribution";

export const SOLVE_MODES: SolveMode[] = [
  "endAmount",
  "investmentLength",
  "returnRate",
  "startingAmount",
  "additionalContribution",
];

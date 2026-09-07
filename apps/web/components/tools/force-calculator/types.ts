export type {
  ForceMode,
  SecondLawSolveFor,
  GravitationSolveFor,
  ForceCalculatorOutput as ForceResult,
} from "@tooloralabs/tools";
import type { ForceMode, SecondLawSolveFor, GravitationSolveFor } from "@tooloralabs/tools";

export const FORCE_MODES: ForceMode[] = ["secondLaw", "gravitation"];
export const SECOND_LAW_SOLVE_FOR: SecondLawSolveFor[] = ["force", "mass", "acceleration"];
export const GRAVITATION_SOLVE_FOR: GravitationSolveFor[] = ["force", "mass1", "mass2", "distance"];

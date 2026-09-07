export type {
  MolarityMode,
  ConcentrationBasis,
  DilutionSolveFor,
  MolarityCalculatorOutput as MolarityResult,
} from "@tooloralabs/tools";
import type { MolarityMode, ConcentrationBasis, DilutionSolveFor } from "@tooloralabs/tools";

export const MOLARITY_MODES: MolarityMode[] = ["concentration", "dilution"];
export const CONCENTRATION_BASES: ConcentrationBasis[] = ["moles", "mass"];
export const DILUTION_SOLVE_FOR: DilutionSolveFor[] = ["c1", "v1", "c2", "v2"];

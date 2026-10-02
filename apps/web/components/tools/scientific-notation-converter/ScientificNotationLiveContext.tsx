import { ScientificNotationConverter } from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";
import type { ScientificNotationOperation } from "./types";

export type ScientificNotationLiveDims = {
  operation: ScientificNotationOperation;
  standardValue: number;
  coefficientA: number;
  exponentA: number;
  coefficientB: number;
  exponentB: number;
};
export const { LiveProvider: ScientificNotationLiveProvider, useLiveState: useScientificNotationLive } = createLiveToolState<ScientificNotationLiveDims>();

const deriveTool = new ScientificNotationConverter();

/**
 * "A" conceptually means different live fields depending on the selected operation: in
 * toScientific mode the real A is the engine's own normalization of standardValue (the raw
 * coefficientA/exponentA fields sit unused at 0 in that mode, since the input panel never shows
 * them there); in every other mode A maps directly to coefficientA/exponentA. Every indicator
 * that reads "A" uses this so none of them silently render degenerate 0×10^0 content in
 * toScientific mode — matching exactly what the hero itself already derives.
 */
export function deriveEffectiveA(dims: ScientificNotationLiveDims): { coefficient: number; exponent: number } {
  if (dims.operation !== "toScientific") return { coefficient: dims.coefficientA, exponent: dims.exponentA };
  const out = deriveTool.execute({ operation: "toScientific", standardValue: dims.standardValue, coefficientA: 0, exponentA: 0, coefficientB: 0, exponentB: 0 }, { locale: "en-US" });
  return out.success && !out.data.error ? { coefficient: out.data.scientific.coefficient, exponent: out.data.scientific.exponent } : { coefficient: dims.coefficientA, exponent: dims.exponentA };
}

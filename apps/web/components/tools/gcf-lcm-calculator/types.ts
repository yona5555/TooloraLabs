export type { GcfLcmCalculatorError as GcfLcmError, GcfLcmCalculatorOutput as GcfLcmResult, PrimeFactor } from "@tooloralabs/tools";

export type GcfLcmDraft = {
  numbers: string[];
};

export function emptyGcfLcmDraft(): GcfLcmDraft {
  return { numbers: ["12", "18"] };
}

export function emptyNumberField(): string {
  return "";
}

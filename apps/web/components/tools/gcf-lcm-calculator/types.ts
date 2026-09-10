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

export type GcfLcmScenario = { key: string; numbers: string[] };

/** Real, worked examples spanning two-number and multi-number cases. */
export const GCF_LCM_SCENARIOS: GcfLcmScenario[] = [
  { key: "twoNumbers", numbers: ["12", "18"] },
  { key: "threeNumbers", numbers: ["8", "12", "20"] },
  { key: "coprimeExample", numbers: ["9", "14"] },
  { key: "recipeScaling", numbers: ["4", "6", "9"] },
];

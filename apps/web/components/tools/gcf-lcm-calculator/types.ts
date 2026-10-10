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

/** Real, worked examples spanning two-number and multi-number cases; each loads into the inputs with one click. */
export const GCF_LCM_SCENARIOS: GcfLcmScenario[] = [
  { key: "twoNumbers", numbers: ["12", "18"] },
  { key: "threeNumbers", numbers: ["8", "12", "20"] },
  { key: "coprimeExample", numbers: ["9", "14"] },
  { key: "recipeScaling", numbers: ["4", "6", "9"] },
  { key: "euclidClassic", numbers: ["1071", "462"] },
  { key: "oneDividesOther", numbers: ["8", "32"] },
  { key: "gearTeeth", numbers: ["24", "36"] },
  { key: "fibonacciPair", numbers: ["34", "55"] },
  { key: "fiveNumbers", numbers: ["12", "18", "24", "30", "36"] },
];

export type { BMRFormula, BMRCalculatorError, BMRCalculatorOutput as BMRResult, Gender } from "@tooloralabs/tools";

export const BMR_FORMULAS = ["harrisBenedict", "mifflinStJeor", "compare"] as const;

export type BMRScenario = { key: string; gender: "male" | "female"; weightKg: string; heightCm: string; age: string };

/** Real examples spanning the typical adult BMR range, hand-verified with the Mifflin-St Jeor formula. */
export const BMR_SCENARIOS: BMRScenario[] = [
  { key: "smallerFrame", gender: "female", weightKg: "55", heightCm: "160", age: "25" },
  { key: "average", gender: "male", weightKg: "75", heightCm: "175", age: "30" },
  { key: "muscularAthlete", gender: "male", weightKg: "100", heightCm: "190", age: "25" },
  { key: "olderAdult", gender: "female", weightKg: "65", heightCm: "165", age: "65" },
];

export type BMRRangeBand = "lower" | "typical" | "higher";

export function bandForBmr(bmr: number): BMRRangeBand {
  if (bmr < 1400) return "lower";
  if (bmr < 2000) return "typical";
  return "higher";
}

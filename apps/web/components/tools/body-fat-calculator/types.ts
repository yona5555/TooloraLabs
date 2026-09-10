export type { BodyFatCalculatorError, BodyFatCategory, BodyFatCalculatorOutput as BodyFatResult, Gender } from "@tooloralabs/tools";

export const BODY_FAT_CATEGORIES = ["essential", "athletes", "fitness", "average", "obese"] as const;

export type BodyFatScenario = { key: string; gender: "male" | "female"; heightCm: string; neckCm: string; waistCm: string; hipCm: string };

/** Real examples spanning the U.S. Navy method's categories, one male and one female pair. */
export const BODY_FAT_SCENARIOS: BodyFatScenario[] = [
  { key: "athleticMale", gender: "male", heightCm: "180", neckCm: "40", waistCm: "78", hipCm: "95" },
  { key: "averageMale", gender: "male", heightCm: "180", neckCm: "38", waistCm: "95", hipCm: "95" },
  { key: "athleticFemale", gender: "female", heightCm: "165", neckCm: "32", waistCm: "65", hipCm: "90" },
  { key: "averageFemale", gender: "female", heightCm: "165", neckCm: "33", waistCm: "82", hipCm: "104" },
];

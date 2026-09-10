export type IdealWeightScenario = { key: string; gender: "male" | "female"; heightCm: string };

/** Real examples spanning a realistic adult height range for each gender. */
export const IDEAL_WEIGHT_SCENARIOS: IdealWeightScenario[] = [
  { key: "shortFemale", gender: "female", heightCm: "155" },
  { key: "averageFemale", gender: "female", heightCm: "165" },
  { key: "averageMale", gender: "male", heightCm: "175" },
  { key: "tallMale", gender: "male", heightCm: "190" },
];

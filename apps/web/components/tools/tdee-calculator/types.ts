import type { Gender, ActivityLevel } from "@tooloralabs/tools";

export type UnitSystem = "metric" | "us";
export type GoalDirection = "lose" | "maintain" | "gain";

export type { Gender, ActivityLevel };

export type TDEEScenario = {
  key: string;
  gender: Gender;
  heightCm: string;
  weightKg: string;
  age: string;
  activityLevel: ActivityLevel;
};

/** Real examples spanning the activity-level spectrum this tool supports. */
export const TDEE_SCENARIOS: TDEEScenario[] = [
  { key: "sedentaryOffice", gender: "female", heightCm: "165", weightKg: "65", age: "35", activityLevel: "sedentary" },
  { key: "activeCommuter", gender: "male", heightCm: "178", weightKg: "80", age: "28", activityLevel: "active" },
  { key: "gymEnthusiast", gender: "male", heightCm: "182", weightKg: "88", age: "24", activityLevel: "veryActive" },
  { key: "olderModerate", gender: "female", heightCm: "160", weightKg: "70", age: "60", activityLevel: "light" },
];

export type { TargetHeartRateError, TargetHeartRateOutput as TargetHeartRateResult, HeartRateZone } from "@tooloralabs/tools";

export const HEART_RATE_ZONE_KEYS = ["veryLight", "light", "moderate", "hard", "maximum"] as const;

export type HeartRateScenario = { key: string; age: string; useRestingHeartRate: boolean; restingHeartRate: string };

export const HEART_RATE_SCENARIOS: HeartRateScenario[] = [
  { key: "youngActive", age: "22", useRestingHeartRate: false, restingHeartRate: "60" },
  { key: "middleAgeKarvonen", age: "45", useRestingHeartRate: true, restingHeartRate: "65" },
  { key: "olderAdult", age: "65", useRestingHeartRate: false, restingHeartRate: "60" },
  { key: "trainedAthlete", age: "30", useRestingHeartRate: true, restingHeartRate: "48" },
];

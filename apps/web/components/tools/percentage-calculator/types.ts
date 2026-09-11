export type { PercentageMode, PercentageOutput as PercentageResult } from "@tooloralabs/tools";
import type { PercentageMode } from "@tooloralabs/tools";

export type PercentageScenario = { key: string; mode: PercentageMode; first: string; second: string };

export const PERCENTAGE_SCENARIOS: PercentageScenario[] = [
  { key: "restaurantTip", mode: "percent-of-number", first: "18", second: "85" },
  { key: "examScore", mode: "what-percent", first: "42", second: "50" },
  { key: "salaryRaise", mode: "percentage-change", first: "55000", second: "60500" },
  { key: "discountedPrice", mode: "reverse-percentage", first: "20", second: "64" },
];

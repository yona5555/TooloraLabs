export type { PercentageMode, PercentageOutput as PercentageResult } from "@tooloralabs/tools";
import type { PercentageMode } from "@tooloralabs/tools";

export type PercentageScenario = { key: string; mode: PercentageMode; first: string; second: string; detail: string };

export const PERCENTAGE_SCENARIOS: PercentageScenario[] = [
  { key: "restaurantTip", mode: "percent-of-number", first: "18", second: "85", detail: "18% × 85" },
  { key: "salesTax", mode: "percent-of-number", first: "8.25", second: "60", detail: "8.25% × 60" },
  { key: "examScore", mode: "what-percent", first: "42", second: "50", detail: "42 ÷ 50" },
  { key: "surveyShare", mode: "what-percent", first: "312", second: "1200", detail: "312 ÷ 1200" },
  { key: "salaryRaise", mode: "percentage-change", first: "55000", second: "60500", detail: "55000 → 60500" },
  { key: "priceDrop", mode: "percentage-change", first: "250", second: "199", detail: "250 → 199" },
  { key: "discountedPrice", mode: "reverse-percentage", first: "20", second: "64", detail: "64 = 20% × ?" },
  { key: "twoQuotes", mode: "percentage-difference", first: "1200", second: "1350", detail: "1200 ↔ 1350" },
];

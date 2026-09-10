export type { OvulationCalculatorError, FertileWindow, OvulationCalculatorOutput as OvulationResult } from "@tooloralabs/tools";

export type OvulationScenario = { key: string; daysAgo: number; cycleLengthDays: string; lutealPhaseDays: string };

/** Realistic examples spanning short/typical/long cycles, expressed as an offset from today so they stay valid over time. */
export const OVULATION_SCENARIOS: OvulationScenario[] = [
  { key: "typicalCycle", daysAgo: 5, cycleLengthDays: "28", lutealPhaseDays: "14" },
  { key: "shortCycle", daysAgo: 3, cycleLengthDays: "24", lutealPhaseDays: "12" },
  { key: "longCycle", daysAgo: 8, cycleLengthDays: "32", lutealPhaseDays: "14" },
];

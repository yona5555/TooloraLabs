export type { DueDateMethod, DueDateError, Trimester, DueDateOutput as DueDateResult } from "@tooloralabs/tools";

export const DUE_DATE_METHODS = ["lmp", "conception", "ivf3day", "ivf5day"] as const;

export type DueDateScenario = { key: string; method: (typeof DUE_DATE_METHODS)[number]; daysAgo: number; cycleLengthDays: string };

/** Realistic examples for each dating method, expressed as an offset from today so they stay valid over time. */
export const DUE_DATE_SCENARIOS: DueDateScenario[] = [
  { key: "lmpExample", method: "lmp", daysAgo: 70, cycleLengthDays: "28" },
  { key: "shortCycleExample", method: "lmp", daysAgo: 70, cycleLengthDays: "24" },
  { key: "conceptionExample", method: "conception", daysAgo: 56, cycleLengthDays: "28" },
  { key: "ivf5dayExample", method: "ivf5day", daysAgo: 40, cycleLengthDays: "28" },
];

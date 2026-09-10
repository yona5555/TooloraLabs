export type {
  DateCalculatorMode,
  DateUnit,
  DateOperation,
  DateCalculatorError,
  DateDifferenceResult,
  DateCalculatorOutput as DateResult,
} from "@tooloralabs/tools";

export const DATE_MODES = ["difference", "addSubtract"] as const;
export const DATE_UNITS = ["days", "weeks", "months", "years"] as const;

export type DateScenario = {
  key: string;
  mode: (typeof DATE_MODES)[number];
  startDaysAgo: number;
  endDaysAgo: number;
  amount: string;
  unit: (typeof DATE_UNITS)[number];
  operation: "add" | "subtract";
};

/** Real examples covering both modes, expressed as day offsets from today so they stay valid over time. */
export const DATE_SCENARIOS: DateScenario[] = [
  { key: "projectDuration", mode: "difference", startDaysAgo: 100, endDaysAgo: 0, amount: "30", unit: "days", operation: "add" },
  { key: "add90Days", mode: "addSubtract", startDaysAgo: 0, endDaysAgo: 0, amount: "90", unit: "days", operation: "add" },
  { key: "subtract5Years", mode: "addSubtract", startDaysAgo: 0, endDaysAgo: 0, amount: "5", unit: "years", operation: "subtract" },
];

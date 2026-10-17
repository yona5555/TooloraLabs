/** Worked add/subtract examples used by the education widget (DateAddSubtractTimelineDiagram). */
export type DateScenario = {
  key: string;
  mode: "difference" | "addSubtract";
  startDaysAgo: number;
  endDaysAgo: number;
  amount: string;
  unit: "days" | "weeks" | "months" | "years";
  operation: "add" | "subtract";
};

/** Real examples covering both modes, expressed as day offsets from today so they stay valid over time. */
export const DATE_SCENARIOS: DateScenario[] = [
  { key: "projectDuration", mode: "difference", startDaysAgo: 100, endDaysAgo: 0, amount: "30", unit: "days", operation: "add" },
  { key: "add90Days", mode: "addSubtract", startDaysAgo: 0, endDaysAgo: 0, amount: "90", unit: "days", operation: "add" },
  { key: "subtract5Years", mode: "addSubtract", startDaysAgo: 0, endDaysAgo: 0, amount: "5", unit: "years", operation: "subtract" },
];

import type { TimeOperation } from "@tooloralabs/tools";
export type { TimeOperation, TimeValue, TimeCalculatorError, TimeCalculatorOutput as TimeResult } from "@tooloralabs/tools";

export type TimeScenario = {
  key: string;
  h1: string; m1: string; s1: string;
  h2: string; m2: string; s2: string;
  operation: TimeOperation;
};

export const TIME_SCENARIOS: TimeScenario[] = [
  { key: "workdayPlusOvertime", h1: "8", m1: "0", s1: "0", h2: "1", m2: "15", s2: "0", operation: "add" },
  { key: "subtractLunchBreak", h1: "8", m1: "0", s1: "0", h2: "0", m2: "45", s2: "0", operation: "subtract" },
  { key: "combineVideoClips", h1: "1", m1: "23", s1: "45", h2: "0", m2: "52", s2: "18", operation: "add" },
];

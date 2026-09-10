export type {
  PregnancyCalculatorError,
  Trimester,
  SizeComparisonKey,
  WeekMilestone,
  PregnancyCalculatorOutput as PregnancyResult,
} from "@tooloralabs/tools";

export type PregnancyScenario = { key: string; weeksAlong: number };

/** One example per trimester, expressed as weeks along so they stay valid over time. */
export const PREGNANCY_SCENARIOS: PregnancyScenario[] = [
  { key: "firstTrimester", weeksAlong: 8 },
  { key: "secondTrimester", weeksAlong: 20 },
  { key: "thirdTrimester", weeksAlong: 34 },
];

export type { MeanMedianModeRangeError, MeanMedianModeRangeOutput as MeanMedianModeRangeResult } from "@tooloralabs/tools";

export type MeanMedianModeRangeDraft = {
  values: string[];
};

export function emptyMeanMedianModeRangeDraft(): MeanMedianModeRangeDraft {
  return { values: ["4", "8", "6", "2", "8", "5"] };
}

export function emptyValueField(): string {
  return "";
}

export type MeanMedianModeRangeScenario = { key: string; values: string[] };

/** Real datasets, including one with a clear outlier to show why mean and median can diverge. */
export const MEAN_MEDIAN_MODE_RANGE_SCENARIOS: MeanMedianModeRangeScenario[] = [
  { key: "testScores", values: ["72", "85", "90", "85", "60", "95"] },
  { key: "dailyTemperatures", values: ["68", "70", "65", "72", "71", "69", "73"] },
  { key: "withOutlier", values: ["10", "12", "11", "13", "12", "50"] },
];

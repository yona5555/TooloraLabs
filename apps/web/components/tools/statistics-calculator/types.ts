export type { StatisticsCalculatorOutput as StatisticsResult } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

export function parseDataSet(raw: string): number[] {
  return raw
    .split(/[\s,;]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => parseLocalizedNumber(token))
    .filter((value) => !Number.isNaN(value));
}

export type StatisticsScenario = { key: string; rawData: string };

export const STATISTICS_SCENARIOS: StatisticsScenario[] = [
  { key: "testScores", rawData: "72, 85, 90, 85, 60, 95" },
  { key: "salesFigures", rawData: "120, 150, 135, 200, 110, 180, 145" },
  { key: "withOutlier", rawData: "10, 12, 11, 13, 12, 50" },
];

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

/** Extra data sets for the input card's quick-examples list (fills the column with real, loadable content). */
export const STATISTICS_EXAMPLES: StatisticsScenario[] = [
  { key: "heights", rawData: "162, 170, 168, 175, 181, 165, 172, 178, 169, 174" },
  { key: "temperatures", rawData: "18.5, 21, 23.4, 22, 19.8, 25.1, 24.3" },
  { key: "reactionTimes", rawData: "245, 260, 238, 301, 255, 249, 272, 290, 243, 266" },
  { key: "bimodal", rawData: "3, 4, 4, 5, 5, 5, 14, 15, 15, 16, 16, 17" },
];

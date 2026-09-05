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

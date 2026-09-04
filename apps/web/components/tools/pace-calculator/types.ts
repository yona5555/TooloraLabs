export type { DistanceUnit, RacePreset, PaceCalcResult, MultipointSegment } from "@tooloralabs/tools";

export const TOP_MODES = ["calculator", "multipoint", "converter", "finish-time"] as const;
export type TopMode = (typeof TOP_MODES)[number];

export const SOLVE_FIELDS = ["pace", "time", "distance"] as const;
export type SolveField = (typeof SOLVE_FIELDS)[number];

export const RACE_PRESETS = ["5k", "10k", "half-marathon", "marathon"] as const;

export type MultipointRowDraft = {
  distance: string;
  hours: string;
  minutes: string;
  seconds: string;
};

export function emptyMultipointRow(): MultipointRowDraft {
  return { distance: "", hours: "0", minutes: "", seconds: "" };
}

export const MAX_MULTIPOINT_ROWS = 12;

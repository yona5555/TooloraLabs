export type { DistanceUnit, RacePreset, PaceCalcResult, MultipointSegment } from "@tooloralabs/tools";

export type PaceScenario = {
  key: string;
  distanceKm: number;
  racePreset: string;
  timeSeconds: number;
};

export const PACE_SCENARIOS: PaceScenario[] = [
  { key: "sub2Marathon", distanceKm: 42.195, racePreset: "marathon", timeSeconds: 7199 },
  { key: "halfMarathonGoal", distanceKm: 21.0975, racePreset: "half-marathon", timeSeconds: 7200 },
  { key: "run10kUnderHour", distanceKm: 10, racePreset: "10k", timeSeconds: 3600 },
  { key: "couchTo5k", distanceKm: 5, racePreset: "5k", timeSeconds: 2100 },
];

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

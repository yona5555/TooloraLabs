import type { ReadabilityBand } from "@tooloralabs/tools";

/** Flesch Reading Ease display domain: the formula has no floor, so scores below −30 pin to the left edge. */
export const EASE_MIN = -30;
export const EASE_MAX = 100;

export const clampEase = (v: number) => Math.min(EASE_MAX, Math.max(EASE_MIN, v));

/** The seven named Flesch Reading Ease bands (hardest first), with the same cut-offs as the calculator. */
export const EASE_BANDS: { key: ReadabilityBand; from: number; to: number; color: string }[] = [
  { key: "very-confusing", from: EASE_MIN, to: 30, color: "#dc2626" },
  { key: "difficult", from: 30, to: 50, color: "#f97316" },
  { key: "fairly-difficult", from: 50, to: 60, color: "#f59e0b" },
  { key: "standard", from: 60, to: 70, color: "#eab308" },
  { key: "fairly-easy", from: 70, to: 80, color: "#84cc16" },
  { key: "easy", from: 80, to: 90, color: "#22c55e" },
  { key: "very-easy", from: 90, to: EASE_MAX, color: "#059669" },
];

export function easeBand(score: number) {
  return EASE_BANDS.find((b) => score < b.to) ?? EASE_BANDS[EASE_BANDS.length - 1];
}

export const easeColor = (score: number) => easeBand(score).color;

/** U.S. school stages used to read a Flesch-Kincaid grade (labels live in gradeLevelDiagram.bands). */
export const GRADE_MAX = 20;
export const GRADE_BANDS = [
  { key: "elementary", from: 0, to: 5, color: "#059669" },
  { key: "middleSchool", from: 5, to: 8, color: "#84cc16" },
  { key: "highSchool", from: 8, to: 12, color: "#f59e0b" },
  { key: "college", from: 12, to: 16, color: "#f97316" },
  { key: "graduate", from: 16, to: GRADE_MAX, color: "#dc2626" },
] as const;

export function gradeBand(grade: number) {
  return GRADE_BANDS.find((b) => grade < b.to) ?? GRADE_BANDS[GRADE_BANDS.length - 1];
}

/** Syllable buckets for the word mix: 1, 2, 3, 4 and 5+ syllables. */
export const SYLLABLE_BUCKETS = [
  { min: 1, max: 1, label: "1", color: "#60a5fa" },
  { min: 2, max: 2, label: "2", color: "#2563eb" },
  { min: 3, max: 3, label: "3", color: "#f59e0b" },
  { min: 4, max: 4, label: "4", color: "#f97316" },
  { min: 5, max: Infinity, label: "5+", color: "#dc2626" },
] as const;

/** Words of three or more syllables are the "hard" words that pull the score down. */
export const HARD_SYLLABLES = 3;

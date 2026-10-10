export type { SortOrder, RandomNumberGeneratorOutput } from "@tooloralabs/tools";
import type { SortOrder } from "@tooloralabs/tools";

export const SORT_ORDERS = ["none", "ascending", "descending"] as const;

export type DrawSettings = { min: number; max: number; count: number; allowDuplicates: boolean; sortOrder: SortOrder };

export type PresetKey = "dice" | "coin" | "lottery" | "powerball" | "card" | "percentile" | "raffle" | "birthday";

/**
 * Real-world draws: each sets the generator's inputs exactly. The lottery/Powerball rows are the
 * main-number pools (6 of 49; 5 of 69 white balls, per the Multi-State Lottery Association).
 */
export const PRESETS: { key: PresetKey; settings: DrawSettings }[] = [
  { key: "dice", settings: { min: 1, max: 6, count: 1, allowDuplicates: true, sortOrder: "none" } },
  { key: "coin", settings: { min: 1, max: 2, count: 10, allowDuplicates: true, sortOrder: "none" } },
  { key: "lottery", settings: { min: 1, max: 49, count: 6, allowDuplicates: false, sortOrder: "ascending" } },
  { key: "powerball", settings: { min: 1, max: 69, count: 5, allowDuplicates: false, sortOrder: "ascending" } },
  { key: "card", settings: { min: 1, max: 52, count: 5, allowDuplicates: false, sortOrder: "none" } },
  { key: "percentile", settings: { min: 1, max: 100, count: 20, allowDuplicates: true, sortOrder: "none" } },
  { key: "raffle", settings: { min: 1, max: 250, count: 3, allowDuplicates: false, sortOrder: "none" } },
  { key: "birthday", settings: { min: 1, max: 365, count: 23, allowDuplicates: true, sortOrder: "ascending" } },
];

/** Colour per histogram bin family, reused across indicators so "observed" and "expected" read the same everywhere. */
export const OBSERVED = "#2563eb";
export const EXPECTED = "#f59e0b";

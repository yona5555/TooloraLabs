export type { SingleEventResult, CompoundResult } from "@tooloralabs/tools";
import type { SingleEventResult, CompoundResult } from "@tooloralabs/tools";

export const PROBABILITY_MODES = ["single", "and", "or", "conditional"] as const;
export type ProbabilityMode = (typeof PROBABILITY_MODES)[number];

export const EMPTY_SINGLE: SingleEventResult = { valid: false, probability: 0, percentage: 0, oddsFor: 0, oddsAgainst: 0 };
export const EMPTY_COMPOUND: CompoundResult = { valid: false, probability: 0, percentage: 0 };

export type { SingleEventResult, CompoundResult } from "@tooloralabs/tools";
import type { SingleEventResult, CompoundResult } from "@tooloralabs/tools";

export const PROBABILITY_MODES = ["single", "and", "or", "conditional"] as const;
export type ProbabilityMode = (typeof PROBABILITY_MODES)[number];

export const EMPTY_SINGLE: SingleEventResult = { valid: false, probability: 0, percentage: 0, oddsFor: 0, oddsAgainst: 0 };
export const EMPTY_COMPOUND: CompoundResult = { valid: false, probability: 0, percentage: 0 };

export type ProbabilityScenario = { key: string; favorable: string; total: string };

/** Single-event examples spanning rare to near-certain outcomes. */
export const PROBABILITY_SCENARIOS: ProbabilityScenario[] = [
  { key: "coinFlip", favorable: "1", total: "2" },
  { key: "dieRollSix", favorable: "1", total: "6" },
  { key: "cardIsHeart", favorable: "13", total: "52" },
  { key: "raffleTicket", favorable: "1", total: "100" },
];

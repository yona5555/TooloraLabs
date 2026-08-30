import type { MortgageResult } from "@tooloralabs/tools";

export type DownPaymentMode = "amount" | "percent";

export type MortgageExtendedResult = MortgageResult;

/**
 * "standard" and "payoffTime" are two views of the exact same calculation (they share every
 * input field and the one `MortgageResult`) — "payoffTime" just re-emphasizes the payoff-time
 * fields the engine already computes instead of the monthly-payment breakdown. Only "homePrice"
 * is a genuinely different calculation, with its own inputs and its own result shape.
 */
export type MortgageMode = "standard" | "payoffTime" | "homePrice";

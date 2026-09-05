export type ProbabilityMode = "single" | "and" | "or" | "conditional";

export type SingleEventResult = {
  valid: boolean;
  probability: number;
  percentage: number;
  oddsFor: number;
  oddsAgainst: number;
};

/** P(event) = favorable outcomes / total possible outcomes, plus the equivalent odds notation. */
export function calculateSingleEventProbability(favorable: number, total: number): SingleEventResult {
  const invalid: SingleEventResult = { valid: false, probability: 0, percentage: 0, oddsFor: 0, oddsAgainst: 0 };
  if (!Number.isFinite(favorable) || !Number.isFinite(total) || total <= 0 || favorable < 0 || favorable > total) return invalid;

  const probability = favorable / total;
  const unfavorable = total - favorable;

  return {
    valid: true,
    probability,
    percentage: probability * 100,
    oddsFor: unfavorable === 0 ? Infinity : favorable / unfavorable,
    oddsAgainst: favorable === 0 ? Infinity : unfavorable / favorable,
  };
}

export type CompoundResult = { valid: boolean; probability: number; percentage: number };

function isValidProbability(p: number): boolean {
  return Number.isFinite(p) && p >= 0 && p <= 1;
}

/** P(A and B) for two independent events — the chance both happen is the product of each happening alone. */
export function calculateIndependentAnd(pA: number, pB: number): CompoundResult {
  if (!isValidProbability(pA) || !isValidProbability(pB)) return { valid: false, probability: 0, percentage: 0 };
  const probability = pA * pB;
  return { valid: true, probability, percentage: probability * 100 };
}

/**
 * P(A or B) = P(A) + P(B) - P(A and B). Passing `pBoth = 0` covers the mutually-exclusive
 * case (the events can't both occur); any other overlap is subtracted so it isn't double-counted.
 */
export function calculateOr(pA: number, pB: number, pBoth: number): CompoundResult {
  if (!isValidProbability(pA) || !isValidProbability(pB) || !isValidProbability(pBoth) || pBoth > Math.min(pA, pB)) {
    return { valid: false, probability: 0, percentage: 0 };
  }
  const probability = pA + pB - pBoth;
  return { valid: true, probability, percentage: probability * 100 };
}

/** P(A | B) = P(A and B) / P(B) — the chance of A, restricted to the outcomes where B already happened. */
export function calculateConditional(pAAndB: number, pB: number): CompoundResult {
  if (!isValidProbability(pAAndB) || !isValidProbability(pB) || pB === 0 || pAAndB > pB) {
    return { valid: false, probability: 0, percentage: 0 };
  }
  const probability = pAAndB / pB;
  return { valid: true, probability, percentage: probability * 100 };
}

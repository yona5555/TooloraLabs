export type CoefficientExponent = { coefficient: number; exponent: number };

/**
 * Snaps a freely dragged (coefficient, exponent) pair to the values scientific notation
 * actually allows: the exponent snapped to a whole number within [minExponent, maxExponent],
 * the coefficient snapped to one decimal place within [1, 10) — the constraint a draggable
 * "coefficient x 10^exponent" point needs so a drag always lands on valid scientific notation,
 * never a coefficient of 0 or >= 10.
 */
export function snapToScientificNotation(coefficient: number, exponent: number, minExponent: number, maxExponent: number): CoefficientExponent {
  const clampedExponent = Math.min(maxExponent, Math.max(minExponent, Math.round(exponent)));
  const roundedCoefficient = Math.round(coefficient * 10) / 10;
  const clampedCoefficient = Math.min(9.9, Math.max(1, roundedCoefficient));
  return { coefficient: clampedCoefficient, exponent: clampedExponent };
}

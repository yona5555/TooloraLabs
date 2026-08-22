import type { Gender } from "./BMICalculator";

export type IdealWeightResult = {
  devine: number;
  robinson: number;
  miller: number;
  hamwi: number;
  average: number;
};

/**
 * Estimates ideal body weight in kilograms using four classic formulas
 * originally developed for clinical use (medication dosing in
 * particular), each a linear function of height in inches over 60:
 * Devine (1974), Robinson (1983), Miller (1983), and Hamwi (1964).
 * These point-estimate formulas are methodologically distinct from a
 * BMI-derived healthy-weight range: they were built specifically to
 * approximate lean/ideal mass from height and sex, not to bucket a
 * given weight into a population-level BMI category.
 */
export function calculateIdealWeight(gender: Gender, heightCm: number): IdealWeightResult {
  if (!Number.isFinite(heightCm) || heightCm <= 0 || (gender !== "male" && gender !== "female")) {
    return { devine: 0, robinson: 0, miller: 0, hamwi: 0, average: 0 };
  }

  const inches = heightCm / 2.54;
  const over60 = inches - 60;

  const devine = gender === "male" ? 50 + 2.3 * over60 : 45.5 + 2.3 * over60;
  const robinson = gender === "male" ? 52 + 1.9 * over60 : 49 + 1.7 * over60;
  const miller = gender === "male" ? 56.2 + 1.41 * over60 : 53.1 + 1.36 * over60;
  const hamwi = gender === "male" ? 48.0 + 2.7 * over60 : 45.5 + 2.2 * over60;
  const average = (devine + robinson + miller + hamwi) / 4;

  return { devine, robinson, miller, hamwi, average };
}

/** The internationally standardized troy ounce used for precious-metal pricing — exact, not a rounded approximation. */
export const TROY_OUNCE_IN_GRAMS = 31.1034768;

export type MetalWeightUnit = "gram" | "troyOunce";

/** Converts a weight between grams and troy ounces (the two units precious-metal prices are quoted in across this tool). */
export function convertMetalWeight(amount: number, from: MetalWeightUnit, to: MetalWeightUnit): number {
  if (!Number.isFinite(amount)) return 0;
  if (from === to) return amount;
  const grams = from === "troyOunce" ? amount * TROY_OUNCE_IN_GRAMS : amount;
  return to === "troyOunce" ? grams / TROY_OUNCE_IN_GRAMS : grams;
}

/**
 * The monetary value of a given weight of metal, in whatever currency
 * `pricePerTroyOunce` and `fxRatePerUnit` are already expressed in (both
 * must share the same currency — pass `fxRatePerUnit = 1` for USD itself,
 * or a units-per-USD rate, like the forex converter's pivot, to price it in
 * another currency).
 */
export function calculateMetalValue(
  weightAmount: number,
  weightUnit: MetalWeightUnit,
  pricePerTroyOunce: number,
  fxRatePerUnit = 1
): number {
  if (
    !Number.isFinite(weightAmount) ||
    weightAmount < 0 ||
    !Number.isFinite(pricePerTroyOunce) ||
    pricePerTroyOunce < 0 ||
    !Number.isFinite(fxRatePerUnit) ||
    fxRatePerUnit < 0
  ) {
    return 0;
  }
  const weightInTroyOunces = convertMetalWeight(weightAmount, weightUnit, "troyOunce");
  return weightInTroyOunces * pricePerTroyOunce * fxRatePerUnit;
}

/** The monetary value of a given number of barrels of oil, in whatever currency `pricePerBarrel` and `fxRatePerUnit` share. */
export function calculateOilValue(barrels: number, pricePerBarrel: number, fxRatePerUnit = 1): number {
  if (
    !Number.isFinite(barrels) ||
    barrels < 0 ||
    !Number.isFinite(pricePerBarrel) ||
    pricePerBarrel < 0 ||
    !Number.isFinite(fxRatePerUnit) ||
    fxRatePerUnit < 0
  ) {
    return 0;
  }
  return barrels * pricePerBarrel * fxRatePerUnit;
}

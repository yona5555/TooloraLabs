import { TROY_OUNCE_IN_GRAMS } from "./CommodityConverter";

/** Weight units precious metals are bought and sold in, as grams per unit (exact by definition). */
export const METAL_UNIT_GRAMS = {
  gram: 1,
  troyOunce: TROY_OUNCE_IN_GRAMS,
  kilogram: 1000,
  /** Indian/Gulf tola: 180 grains. */
  tola: 11.6638038,
  /** Hong Kong tael (leung) used in Chinese gold markets. */
  tael: 37.799364167,
  /** Avoirdupois ounce, the everyday (non-troy) ounce. */
  ounce: 28.349523125,
} as const;
export type MetalUnit = keyof typeof METAL_UNIT_GRAMS;

/** Oil volume units as barrels per unit (1 US oil barrel = 42 US gallons = 158.987294928 L). */
export const OIL_UNIT_BARRELS = {
  barrel: 1,
  liter: 1 / 158.987294928,
  usGallon: 1 / 42,
  cubicMeter: 1000 / 158.987294928,
} as const;
export type OilUnit = keyof typeof OIL_UNIT_BARRELS;

/** Troy ounces in `amount` of `unit`. */
export function toTroyOunces(amount: number, unit: MetalUnit): number {
  return Number.isFinite(amount) ? (amount * METAL_UNIT_GRAMS[unit]) / TROY_OUNCE_IN_GRAMS : 0;
}

/** Barrels in `amount` of `unit`. */
export function toBarrels(amount: number, unit: OilUnit): number {
  return Number.isFinite(amount) ? amount * OIL_UNIT_BARRELS[unit] : 0;
}

/** USD value of a metal weight at `usdPerOunce`, for an alloy of the given fineness (1 = pure). */
export function metalValueUsd(amount: number, unit: MetalUnit, usdPerOunce: number, purity = 1): number {
  if (!(usdPerOunce >= 0) || !(purity >= 0) || !(amount >= 0)) return 0;
  return toTroyOunces(amount, unit) * usdPerOunce * purity;
}

/** USD value of an oil volume at `usdPerBarrel`. */
export function oilValueUsd(amount: number, unit: OilUnit, usdPerBarrel: number): number {
  if (!(usdPerBarrel >= 0) || !(amount >= 0)) return 0;
  return toBarrels(amount, unit) * usdPerBarrel;
}

/** Gold karats sold worldwide, and their fineness (karat ÷ 24). */
export const GOLD_KARATS = [24, 22, 21, 18, 14, 10, 9] as const;
export const karatPurity = (karat: number) => karat / 24;

/** Silver finenesses in parts per thousand: fine, Britannia, sterling, coin, European 800. */
export const SILVER_FINENESS = [999, 958, 925, 900, 800] as const;

/** How many ounces of silver buy one ounce of gold. */
export function goldSilverRatio(goldUsdPerOunce: number, silverUsdPerOunce: number): number | null {
  return goldUsdPerOunce > 0 && silverUsdPerOunce > 0 ? goldUsdPerOunce / silverUsdPerOunce : null;
}

export type RatioZone = "tight" | "average" | "wide" | "extreme";
/** Commonly cited bands for the gold/silver ratio (century average ~60–70). */
export const RATIO_ZONE_LIMITS = { tight: 50, average: 80, wide: 100 } as const;
export function goldSilverRatioZone(ratio: number): RatioZone {
  if (ratio < RATIO_ZONE_LIMITS.tight) return "tight";
  if (ratio < RATIO_ZONE_LIMITS.average) return "average";
  if (ratio < RATIO_ZONE_LIMITS.wide) return "wide";
  return "extreme";
}

/** Brent minus WTI, in USD per barrel and as a percent of WTI. */
export function brentWtiSpread(brentUsd: number, wtiUsd: number): { spread: number; percent: number } | null {
  if (!(brentUsd > 0) || !(wtiUsd > 0)) return null;
  return { spread: brentUsd - wtiUsd, percent: ((brentUsd - wtiUsd) / wtiUsd) * 100 };
}

/** Annualized volatility from monthly averages: stdev of the last `window` monthly log changes × √12. */
export function monthlyVolatility(values: number[], window = 12): { monthlyPercent: number; annualizedPercent: number; returns: number } | null {
  const v = values.slice(-(window + 1));
  if (v.length < 3 || v.some((x) => !(x > 0))) return null;
  const r = v.slice(1).map((x, i) => Math.log(x / v[i]));
  const avg = r.reduce((s, x) => s + x, 0) / r.length;
  const sd = Math.sqrt(r.reduce((s, x) => s + (x - avg) ** 2, 0) / (r.length - 1)) * 100;
  return { monthlyPercent: sd, annualizedPercent: sd * Math.sqrt(12), returns: r.length };
}

/** Pairs two monthly series on shared months (YYYY-MM) and returns a / b for each. */
export function monthlyRatioSeries(a: { date: string; rate: number }[], b: { date: string; rate: number }[]): { date: string; rate: number }[] {
  const bm = new Map(b.map((p) => [p.date.slice(0, 7), p.rate]));
  return a.flatMap((p) => {
    const d = bm.get(p.date.slice(0, 7));
    return d && d > 0 && p.rate > 0 ? [{ date: p.date, rate: p.rate / d }] : [];
  });
}

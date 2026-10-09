import { ScientificNotationConverter, type NormalizedScientific } from "./ScientificNotationConverter";

export { snapDragValue } from "./StepByStepMathSolverGraph";
import { formatMathValue } from "./StepByStepMathSolverGraph";

/** formatMathValue prefers a simple a/b fraction when one exists (right for fraction-calculator
 * and step-by-step-math-solver). A scientific-notation coefficient or standard value must never
 * render as a fraction -- "7.2", never "36/5" -- so this pins maxDen to 1, which only ever
 * matches whole-number "fractions" and leaves every non-integer value on the decimal path. */
export function formatSciValue(value: number | null | undefined, sig = 4): string {
  return formatMathValue(value, { maxDen: 1, sig });
}

const tool = new ScientificNotationConverter();

/** Renormalizes (coefficient, exponent) into valid scientific-notation form by routing through
 * the real engine's multiply-by-1 path, instead of re-implementing the normalization loop. */
export function normalizeSci(coefficient: number, exponent: number): NormalizedScientific {
  const out = tool.execute({ operation: "multiply", standardValue: 0, coefficientA: coefficient, exponentA: exponent, coefficientB: 1, exponentB: 0 }, { locale: "en-US" });
  return out.success ? out.data.scientific : { coefficient, exponent };
}

/** Real reciprocal 1/(c x 10^e), renormalized, via the engine's own divide path. */
export function reciprocalSci(coefficient: number, exponent: number): NormalizedScientific {
  if (coefficient === 0) return { coefficient: 0, exponent: 0 };
  const out = tool.execute({ operation: "divide", standardValue: 0, coefficientA: 1, exponentA: 0, coefficientB: coefficient, exponentB: exponent }, { locale: "en-US" });
  return out.success && !out.data.error ? out.data.scientific : { coefficient: 0, exponent: 0 };
}

/** Engineering-notation form (exponent a multiple of 3) of (coefficient, exponent), via the
 * engine's own toStandard path (which always derives .engineering from the normalized input). */
export function engineeringOf(coefficient: number, exponent: number): NormalizedScientific {
  const out = tool.execute({ operation: "toStandard", standardValue: 0, coefficientA: coefficient, exponentA: exponent, coefficientB: 0, exponentB: 0 }, { locale: "en-US" });
  return out.success ? out.data.engineering : { coefficient, exponent };
}

/** The real standard (decimal) value of coefficient x 10^exponent, via the engine. */
export function standardValueOf(coefficient: number, exponent: number): number {
  const out = tool.execute({ operation: "toStandard", standardValue: 0, coefficientA: coefficient, exponentA: exponent, coefficientB: 0, exponentB: 0 }, { locale: "en-US" });
  return out.success ? out.data.standard : coefficient * Math.pow(10, exponent);
}

export type NormalizationStep = { coefficient: number; exponent: number };

/** A genuine step-by-step trace of sliding the decimal point one digit at a time from the raw
 * (coefficient=standardValue, exponent=0) starting point to the fully normalized [1,10) form --
 * the real mechanics behind "digit strip with draggable decimal point", not a decorative list. */
export function normalizationSteps(standardValue: number, maxSteps = 20): NormalizationStep[] {
  if (standardValue === 0) return [{ coefficient: 0, exponent: 0 }];
  const steps: NormalizationStep[] = [];
  let c = standardValue;
  let e = 0;
  steps.push({ coefficient: c, exponent: e });
  let guard = 0;
  while (Math.abs(c) >= 10 && guard < maxSteps) {
    c /= 10;
    e += 1;
    steps.push({ coefficient: c, exponent: e });
    guard++;
  }
  while (Math.abs(c) < 1 && guard < maxSteps) {
    c *= 10;
    e -= 1;
    steps.push({ coefficient: c, exponent: e });
    guard++;
  }
  return steps;
}

export type NamedMagnitude = { key: string; exponent: number };
export const NAMED_MAGNITUDES: NamedMagnitude[] = [
  { key: "quadrillion", exponent: 15 },
  { key: "trillion", exponent: 12 },
  { key: "billion", exponent: 9 },
  { key: "million", exponent: 6 },
  { key: "thousand", exponent: 3 },
  { key: "thousandth", exponent: -3 },
  { key: "millionth", exponent: -6 },
  { key: "billionth", exponent: -9 },
  { key: "trillionth", exponent: -12 },
];

export type SiPrefix = { symbol: string; name: string; exponent: number };
export const SI_PREFIXES: SiPrefix[] = [
  { symbol: "Y", name: "yotta", exponent: 24 },
  { symbol: "Z", name: "zetta", exponent: 21 },
  { symbol: "E", name: "exa", exponent: 18 },
  { symbol: "P", name: "peta", exponent: 15 },
  { symbol: "T", name: "tera", exponent: 12 },
  { symbol: "G", name: "giga", exponent: 9 },
  { symbol: "M", name: "mega", exponent: 6 },
  { symbol: "k", name: "kilo", exponent: 3 },
  { symbol: "", name: "base", exponent: 0 },
  { symbol: "m", name: "milli", exponent: -3 },
  { symbol: "µ", name: "micro", exponent: -6 },
  { symbol: "n", name: "nano", exponent: -9 },
  { symbol: "p", name: "pico", exponent: -12 },
  { symbol: "f", name: "femto", exponent: -15 },
  { symbol: "a", name: "atto", exponent: -18 },
  { symbol: "z", name: "zepto", exponent: -21 },
  { symbol: "y", name: "yocto", exponent: -24 },
];

export function nearestSiPrefix(exponent: number): SiPrefix {
  return SI_PREFIXES.reduce((best, p) => (Math.abs(p.exponent - exponent) < Math.abs(best.exponent - exponent) ? p : best), SI_PREFIXES[8]);
}

export type OrderOfMagnitudeMark = { key: string; exponentMeters: number };
/** Real physical length scales (in meters, base-10 exponent of their approximate size), from the
 * Planck length to the observable universe -- standard physics reference values. */
export const ORDERS_OF_MAGNITUDE: OrderOfMagnitudeMark[] = [
  { key: "planckLength", exponentMeters: -35 },
  { key: "proton", exponentMeters: -15 },
  { key: "hydrogenAtom", exponentMeters: -10 },
  { key: "virus", exponentMeters: -7 },
  { key: "humanHairWidth", exponentMeters: -5 },
  { key: "grainOfSand", exponentMeters: -3 },
  { key: "humanHeight", exponentMeters: 0 },
  { key: "footballField", exponentMeters: 2 },
  { key: "mountEverest", exponentMeters: 4 },
  { key: "earthDiameter", exponentMeters: 7 },
  { key: "earthToSun", exponentMeters: 11 },
  { key: "lightYear", exponentMeters: 16 },
  { key: "milkyWayDiameter", exponentMeters: 21 },
  { key: "observableUniverse", exponentMeters: 27 },
];

export type SpeedMark = { key: string; metersPerSecond: number };
/** Real approximate speeds (m/s) spanning many orders of magnitude, for the log-scale comparison
 * indicator -- a snail's pace up to the speed of light. */
export const REAL_WORLD_SPEEDS: SpeedMark[] = [
  { key: "snail", metersPerSecond: 0.001 },
  { key: "walkingHuman", metersPerSecond: 1.4 },
  { key: "usainBolt", metersPerSecond: 12.4 },
  { key: "car", metersPerSecond: 28 },
  { key: "soundInAir", metersPerSecond: 343 },
  { key: "commercialJet", metersPerSecond: 250 },
  { key: "iss", metersPerSecond: 7660 },
  { key: "earthOrbitingSun", metersPerSecond: 29780 },
  { key: "lightSpeed", metersPerSecond: 299792458 },
];

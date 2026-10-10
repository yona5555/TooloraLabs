/**
 * Pure helpers behind the scientific-notation-converter Result card: the decimal-point shift
 * trace, the equivalent-forms table (engineering, E-notation, SI prefix, sig figs) and the
 * log-scale magnitude ladder with real reference lengths. No DOM, no React.
 */
import type { NormalizedScientific } from "./ScientificNotationConverter";

/* ---------- decimal-point shift ---------- */

export type DecimalShift = {
  /** All digits of the plain decimal form, no sign and no point (leading zeros kept for |x| < 1). */
  digits: string[];
  /** Index in `digits` the point sits after in standard form (digits.length for an integer). */
  fromIndex: number;
  /** Index the point sits after once one nonzero digit is left in front of it. */
  toIndex: number;
  /** Places moved = |exponent|. */
  places: number;
  direction: "left" | "right" | "none";
  negative: boolean;
};

/** Plain positional decimal string of coefficient × 10^exponent, never in e-notation. */
export function toPlainDecimal(coefficient: number, exponent: number, sig = 12): string {
  if (coefficient === 0 || !Number.isFinite(coefficient)) return "0";
  const negative = coefficient < 0;
  const mant = Math.abs(coefficient).toPrecision(sig).replace(/\.?0+$/, "");
  const [intPart, fracPart = ""] = mant.split(".");
  let body = intPart + fracPart;
  let point = intPart.length + exponent;
  if (point <= 0) {
    body = "0".repeat(1 - point) + body;
    point = 1;
  } else if (point > body.length) {
    body = body + "0".repeat(point - body.length);
  }
  let int = body.slice(0, point).replace(/^0+(?=\d)/, "");
  const frac = body.slice(point).replace(/0+$/, "");
  if (int === "") int = "0";
  return `${negative ? "-" : ""}${int}${frac ? "." + frac : ""}`;
}

export function decimalShift(coefficient: number, exponent: number): DecimalShift {
  const plain = toPlainDecimal(coefficient, exponent);
  const negative = plain.startsWith("-");
  const unsigned = negative ? plain.slice(1) : plain;
  const [int, frac = ""] = unsigned.split(".");
  const digits = (int + frac).split("");
  const fromIndex = int.length;
  if (coefficient === 0) return { digits: ["0"], fromIndex: 1, toIndex: 1, places: 0, direction: "none", negative: false };
  const firstNonZero = digits.findIndex((d) => d !== "0");
  const toIndex = firstNonZero + 1;
  const places = Math.abs(fromIndex - toIndex);
  return { digits, fromIndex, toIndex, places, direction: places === 0 ? "none" : fromIndex > toIndex ? "left" : "right", negative };
}

/* ---------- equivalent forms ---------- */

function trimNum(n: number, sig = 10): string {
  return String(Number(n.toPrecision(sig)));
}

/** "2.99792458e8" style E-notation (sign kept, no "+"). */
export function eNotation(sci: NormalizedScientific): string {
  return `${trimNum(sci.coefficient)}e${sci.exponent}`;
}

export type SiPrefixDef = { symbol: string; name: string; exponent: number };
/** The 24 SI prefixes (BIPM, 27th CGPM 2022 adds ronna/quetta/ronto/quecto) plus the unprefixed base. */
export const SI_PREFIX_TABLE: SiPrefixDef[] = [
  { symbol: "Q", name: "quetta", exponent: 30 },
  { symbol: "R", name: "ronna", exponent: 27 },
  { symbol: "Y", name: "yotta", exponent: 24 },
  { symbol: "Z", name: "zetta", exponent: 21 },
  { symbol: "E", name: "exa", exponent: 18 },
  { symbol: "P", name: "peta", exponent: 15 },
  { symbol: "T", name: "tera", exponent: 12 },
  { symbol: "G", name: "giga", exponent: 9 },
  { symbol: "M", name: "mega", exponent: 6 },
  { symbol: "k", name: "kilo", exponent: 3 },
  { symbol: "", name: "", exponent: 0 },
  { symbol: "m", name: "milli", exponent: -3 },
  { symbol: "µ", name: "micro", exponent: -6 },
  { symbol: "n", name: "nano", exponent: -9 },
  { symbol: "p", name: "pico", exponent: -12 },
  { symbol: "f", name: "femto", exponent: -15 },
  { symbol: "a", name: "atto", exponent: -18 },
  { symbol: "z", name: "zepto", exponent: -21 },
  { symbol: "y", name: "yocto", exponent: -24 },
  { symbol: "r", name: "ronto", exponent: -27 },
  { symbol: "q", name: "quecto", exponent: -30 },
];

/** Engineering form expressed with its SI prefix, or null when the exponent is outside ±30. */
export function siPrefixForm(eng: NormalizedScientific): { value: string; prefix: SiPrefixDef } | null {
  const prefix = SI_PREFIX_TABLE.find((p) => p.exponent === eng.exponent);
  if (!prefix) return null;
  return { value: trimNum(eng.coefficient), prefix };
}

export type SigFigCount = { count: number; ambiguous: boolean };

/**
 * Significant figures of a typed number (standard rules): nonzero digits count, zeros between
 * them count, leading zeros never count, trailing zeros count only when a decimal point is
 * present. "1500" is ambiguous (2 to 4) — reported as the minimum with ambiguous = true.
 */
export function countSigFigs(input: string): SigFigCount {
  const s = input.trim().replace(/^[+-]/, "").replace(/[eE].*$/, "").replace(/[,\s_]/g, "");
  if (!/^\d*\.?\d*$/.test(s) || !/\d/.test(s)) return { count: 0, ambiguous: false };
  const hasPoint = s.includes(".");
  const digits = s.replace(".", "").replace(/^0+/, "");
  if (digits === "") return { count: 1, ambiguous: false };
  if (hasPoint) return { count: digits.length, ambiguous: false };
  const trimmed = digits.replace(/0+$/, "");
  return { count: trimmed.length, ambiguous: trimmed.length !== digits.length };
}

/* ---------- magnitude ladder ---------- */

export const LADDER_MIN = -15;
export const LADDER_MAX = 15;

export type LadderReference = { key: string; coefficient: number; exponent: number };
/**
 * One real length (metres) at each main power of ten on the ladder. Values: proton charge
 * diameter ≈ 2 × 0.841 fm (CODATA 2018); electron Compton wavelength 2.426 pm (CODATA 2018);
 * DNA double-helix width ≈ 2 nm; E. coli length ≈ 2 µm; coarse sand grain ≈ 1 mm (Wentworth);
 * adult human ≈ 1.7 m; Burj Khalifa 828 m; Moon diameter 3,474 km (NASA); Sun diameter
 * 1.392 × 10^9 m (NASA); Saturn's mean orbital radius 9.58 AU = 1.43 × 10^12 m (NASA);
 * light-year 9.4607 × 10^15 m (IAU).
 */
export const LADDER_REFERENCES: LadderReference[] = [
  { key: "proton", coefficient: 1.68, exponent: -15 },
  { key: "compton", coefficient: 2.43, exponent: -12 },
  { key: "dna", coefficient: 2, exponent: -9 },
  { key: "bacterium", coefficient: 2, exponent: -6 },
  { key: "sand", coefficient: 1, exponent: -3 },
  { key: "human", coefficient: 1.7, exponent: 0 },
  { key: "burj", coefficient: 8.28, exponent: 2 },
  { key: "moon", coefficient: 3.474, exponent: 6 },
  { key: "sun", coefficient: 1.392, exponent: 9 },
  { key: "saturnOrbit", coefficient: 1.43, exponent: 12 },
  { key: "lightYear", coefficient: 9.4607, exponent: 15 },
];

/** log10 of |coefficient × 10^exponent| (exact-enough, avoids overflow for huge exponents). */
export function log10Of(sci: NormalizedScientific): number {
  if (sci.coefficient === 0) return LADDER_MIN;
  return Math.log10(Math.abs(sci.coefficient)) + sci.exponent;
}

/** Reference whose log10 is closest to the value, and value ÷ reference. */
export function nearestLadderReference(sci: NormalizedScientific): { ref: LadderReference; ratio: number } {
  const lv = log10Of(sci);
  let best = LADDER_REFERENCES[0];
  for (const r of LADDER_REFERENCES) {
    if (Math.abs(Math.log10(r.coefficient) + r.exponent - lv) < Math.abs(Math.log10(best.coefficient) + best.exponent - lv)) best = r;
  }
  const ratio = Math.pow(10, lv - (Math.log10(best.coefficient) + best.exponent));
  return { ref: best, ratio };
}

/** Clamp a ladder exponent to the drawn range. */
export function clampLadder(exponent: number): number {
  return Math.min(LADDER_MAX, Math.max(LADDER_MIN, Math.round(exponent)));
}

/* ---------- famous constants (quick examples) ---------- */

export type FamousConstant = { key: string; coefficient: number; exponent: number; unit: string };
/** Exact SI-defining values (2019 redefinition) or CODATA 2018 recommended values. */
export const FAMOUS_CONSTANTS: FamousConstant[] = [
  { key: "lightSpeed", coefficient: 2.99792458, exponent: 8, unit: "m/s" },
  { key: "avogadro", coefficient: 6.02214076, exponent: 23, unit: "mol⁻¹" },
  { key: "planck", coefficient: 6.62607015, exponent: -34, unit: "J·s" },
  { key: "elementaryCharge", coefficient: 1.602176634, exponent: -19, unit: "C" },
  { key: "electronMass", coefficient: 9.1093837015, exponent: -31, unit: "kg" },
  { key: "gravitation", coefficient: 6.6743, exponent: -11, unit: "m³/(kg·s²)" },
  { key: "boltzmann", coefficient: 1.380649, exponent: -23, unit: "J/K" },
  { key: "astronomicalUnit", coefficient: 1.495978707, exponent: 11, unit: "m" },
  { key: "earthMass", coefficient: 5.9722, exponent: 24, unit: "kg" },
  { key: "bohrRadius", coefficient: 5.29177210903, exponent: -11, unit: "m" },
];

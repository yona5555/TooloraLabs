/**
 * Pure chemistry + formatting helpers shared by the pH hero and its indicator cards. Every value
 * here is real: the same 25 °C relation the calculator uses (pH + pOH = 14), exact charge-balance
 * pH for titration and dilution (so dilution approaches 7 but never crosses it), and published
 * Kw data. No DOM, no colours.
 */

export const PH_MIN = 0;
export const PH_MAX = 14;
export const PKW_25 = 14;
const KW_25 = 1e-14;

/** The calculator's own default (DEFAULTS.pH in PhCalculator) — every card is seeded from it once. */
export const PH_SEED = 5.5;

export type PhClass = "acidic" | "neutral" | "basic";

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Snap to the step grid without float dust (0.1 + 0.2 → 0.3). */
export function snap(v: number, step: number, lo: number, hi: number): number {
  const n = Math.round(clamp(v, lo, hi) / step) * step;
  return Number(clamp(n, lo, hi).toFixed(6));
}

export function classify(pH: number, neutral = 7): PhClass {
  if (Math.abs(pH - neutral) < 1e-9) return "neutral";
  return pH < neutral ? "acidic" : "basic";
}

export function ions(pH: number, pKw = PKW_25) {
  const pOH = pKw - pH;
  return { pH, pOH, h: 10 ** -pH, oh: 10 ** -pOH };
}

/** pH to two decimals; never "-0.00". */
export function f2(v: number): string {
  // The epsilon rounds float dust like 13.995 − 5.5 = 8.494999… half-up, as written on paper.
  const r = Math.round(v * 100 + 1e-7) / 100;
  return (Object.is(r, -0) ? 0 : r).toFixed(2);
}

export function f1(v: number): string {
  const r = Math.round(v * 10 + 1e-7) / 10;
  return (Object.is(r, -0) ? 0 : r).toFixed(1);
}

const SUP: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
export const sup = (n: number) => String(n).split("").map((c) => SUP[c] ?? c).join("");

/** Scientific notation with a real superscript exponent: 3.16 × 10⁻⁶. Safe at 0 and ±∞. */
export function sci(v: number, digits = 2): string {
  if (!Number.isFinite(v)) return "—";
  if (v === 0) return "0";
  let e = Math.floor(Math.log10(Math.abs(v)));
  let m = v / 10 ** e;
  if (Number(m.toFixed(digits)) >= 10) {
    m /= 10;
    e += 1;
  }
  return `${m.toFixed(digits)} × 10${sup(e)}`;
}

/** Ratio as "×10ⁿ"-style plain text for big ratios, else a short number. */
export function ratio(v: number): string {
  if (!Number.isFinite(v) || v <= 0) return "—";
  if (v >= 1000 || v < 0.01) return sci(v, 1);
  return v >= 10 ? v.toFixed(0) : v.toFixed(2);
}

/**
 * Exact [H⁺] for a net strong-acid excess `d` (mol/L; negative = net strong-base excess) in water:
 * [H⁺]² − d[H⁺] − Kw = 0. The rationalised branch avoids cancellation when d is very negative.
 */
export function hFromExcess(d: number, kw = KW_25): number {
  const root = Math.sqrt(d * d + 4 * kw);
  return d >= 0 ? (d + root) / 2 : (2 * kw) / (root - d);
}

/** Net acid excess that gives this pH (inverse of hFromExcess). */
export const excessFromPh = (pH: number, kw = KW_25) => 10 ** -pH - kw / 10 ** -pH;

// ── Titration: 25.00 mL of 0.100 M HCl with 0.100 M NaOH ──────────────────────────────
export const TITRATION = { acidM: 0.1, acidMl: 25, baseM: 0.1, maxMl: 50, step: 0.5 } as const;
export const EQUIVALENCE_ML = (TITRATION.acidM * TITRATION.acidMl) / TITRATION.baseM;

export function titrationPh(baseMl: number): number {
  const { acidM, acidMl, baseM } = TITRATION;
  const v = clamp(baseMl, 0, TITRATION.maxMl);
  const d = (acidM * acidMl - baseM * v) / (acidMl + v);
  return -Math.log10(hFromExcess(d));
}

/** Largest step volume whose pH is still ≤ the seed pH (the card starts on the calculator default). */
export function titrationSeed(seedPh = PH_SEED): number {
  let best = 0;
  for (let v = 0; v <= TITRATION.maxMl; v += TITRATION.step) if (titrationPh(v) <= seedPh) best = v;
  return best;
}

// ── Dilution: each step adds water to 10× the volume ──────────────────────────────────
export const DILUTION_MAX_STEPS = 6;
export function dilutionPh(startPh: number, steps: number): number {
  return -Math.log10(hFromExcess(excessFromPh(startPh) / 10 ** steps));
}

// ── Water ion product vs temperature ───────────────────────────────────────────────────
/**
 * pKw of pure water. Source: A. V. Bandura & S. N. Lvov, "The Ionization Constant of Water over
 * Wide Ranges of Temperature and Density", J. Phys. Chem. Ref. Data 35, 15–30 (2006), Table 3
 * (0.1 MPa; 100 °C at saturation pressure) — the values tabulated in the CRC Handbook.
 */
export const KW_TABLE: { t: number; pKw: number }[] = [
  { t: 0, pKw: 14.946 },
  { t: 25, pKw: 13.995 },
  { t: 50, pKw: 13.264 },
  { t: 75, pKw: 12.696 },
  { t: 100, pKw: 12.252 },
];
/** Index of 25 °C — the temperature the calculator assumes. */
export const KW_SEED_INDEX = 1;

// ── Everyday substances (typical published values) ─────────────────────────────────────
export const SHELF: { key: string; pH: number }[] = [
  { key: "lemon", pH: 2.2 },
  { key: "vinegar", pH: 2.9 },
  { key: "coffee", pH: 5.0 },
  { key: "milk", pH: 6.7 },
  { key: "blood", pH: 7.4 },
  { key: "seawater", pH: 8.2 },
  { key: "soap", pH: 9.5 },
  { key: "bleach", pH: 12.6 },
];
export function shelfSeedIndex(seedPh = PH_SEED): number {
  let best = 0;
  SHELF.forEach((s, i) => {
    if (Math.abs(s.pH - seedPh) < Math.abs(SHELF[best].pH - seedPh)) best = i;
  });
  return best;
}

// ── Indicator dyes: transition ranges (textbook values) ────────────────────────────────
export type Dye = { key: string; lo: number; hi: number; acid: string; base: string; mid?: string };
export const DYES: Dye[] = [
  { key: "methylOrange", lo: 3.1, hi: 4.4, acid: "--ph-dye-mo-acid", base: "--ph-dye-mo-base" },
  { key: "litmus", lo: 4.5, hi: 8.3, acid: "--ph-dye-litmus-acid", base: "--ph-dye-litmus-base" },
  { key: "bromothymolBlue", lo: 6.0, hi: 7.6, acid: "--ph-dye-btb-acid", base: "--ph-dye-btb-base", mid: "--ph-dye-btb-mid" },
  { key: "phenolphthalein", lo: 8.2, hi: 10.0, acid: "--ph-dye-phth-acid", base: "--ph-dye-phth-base" },
];
/** "acid" | "transition" | "base" form of a dye at this pH. */
export const dyeForm = (d: Dye, pH: number) => (pH < d.lo ? "acid" : pH > d.hi ? "base" : "transition");

/** CSS colour of a dye at a pH, as a color-mix of its two (or three) token colours. */
export function dyeCss(d: Dye, pH: number): string {
  const t = clamp((pH - d.lo) / (d.hi - d.lo), 0, 1);
  if (d.mid) {
    if (t <= 0.5) return `color-mix(in oklab, var(${d.acid}) ${Math.round((1 - t * 2) * 100)}%, var(${d.mid}))`;
    return `color-mix(in oklab, var(${d.mid}) ${Math.round((1 - (t - 0.5) * 2) * 100)}%, var(${d.base}))`;
  }
  return `color-mix(in oklab, var(${d.acid}) ${Math.round((1 - t) * 100)}%, var(${d.base}))`;
}

/** CSS colour of the universal indicator at any pH (interpolated between the integer tokens). */
export function uiCss(pH: number): string {
  const p = clamp(pH, PH_MIN, PH_MAX);
  const lo = Math.floor(p);
  const hi = Math.min(PH_MAX, lo + 1);
  const w = Math.round((1 - (p - lo)) * 100);
  return lo === hi || w === 100 ? `var(--ph-ui-${lo})` : `color-mix(in oklab, var(--ph-ui-${lo}) ${w}%, var(--ph-ui-${hi}))`;
}

/** Log-scaled particle counts (capped): 50/50 at pH 7, one ion takes over toward 0 or 14, never 0. */
export function particleCounts(pH: number, total: number): { h: number; oh: number } {
  const share = clamp(0.5 + (7 - pH) / 14, 0, 1);
  const h = clamp(Math.round(total * share), 1, total - 1);
  return { h, oh: total - h };
}

/** Deterministic pseudo-random points inside a unit ball (stable between renders). */
export function ballPoints(n: number, seed = 7): [number, number, number][] {
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const out: [number, number, number][] = [];
  while (out.length < n) {
    const p: [number, number, number] = [rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1];
    if (p[0] ** 2 + p[1] ** 2 + p[2] ** 2 <= 1) out.push(p);
  }
  return out;
}

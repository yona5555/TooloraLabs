/**
 * Pure number helpers shared by the indicator kits: clamping, step snapping without float
 * dust, fixed decimals that never print "-0", real-superscript scientific notation, and
 * deterministic point clouds. No DOM, no colours.
 */

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Snap to the step grid without float dust (0.1 + 0.2 → 0.3). */
export function snap(v: number, step: number, lo: number, hi: number): number {
  const n = Math.round(clamp(v, lo, hi) / step) * step;
  return Number(clamp(n, lo, hi).toFixed(6));
}

/** Two decimals; never "-0.00". */
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

/**
 * A measured quantity for display: about `sig` significant figures with thousands separators,
 * switching to scientific notation (real superscript exponent) when very large or very small,
 * so no raw float ever reaches the screen. Never "-0", never NaN.
 */
export function fmtSmart(v: number, sig = 4): string {
  if (!Number.isFinite(v)) return "—";
  if (v === 0) return "0";
  const a = Math.abs(v);
  if (a >= 1e7 || a < 1e-3) return sci(v, sig - 1);
  const d = clamp(sig - 1 - Math.floor(Math.log10(a)), 0, 6);
  const r = Number(v.toFixed(d));
  return (Object.is(r, -0) ? 0 : r).toLocaleString("en-US", { maximumFractionDigits: d });
}

/** Smallest "nice" number (1, 2, 2.5, 5 × 10ⁿ) at or above v. */
export function niceCeil(v: number): number {
  if (!(v > 0)) return 1;
  const e = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * e >= v - 1e-12) return m * e;
  return 10 * e;
}

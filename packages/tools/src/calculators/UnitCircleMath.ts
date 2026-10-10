/**
 * Pure unit-circle facts for one angle (scientific-calculator's unit-circle indicators):
 * quadrant, reference angle, sin/cos/tan, the point (cos θ, sin θ) and the sign pattern.
 * No DOM, no React.
 */
export type Quadrant = 1 | 2 | 3 | 4 | "axis";
export type Sign = "+" | "−" | "0";

export type UnitCircleFacts = {
  degrees: number;
  radians: number;
  /** Radians as a multiple of π, e.g. "π/6", "5π/4", or null when not a 15° multiple. */
  radiansPi: string | null;
  quadrant: Quadrant;
  referenceDeg: number;
  sin: number;
  cos: number;
  /** null where tan is undefined (90°, 270°). */
  tan: number | null;
  signs: { sin: Sign; cos: Sign; tan: Sign | "undef" };
};

const EPS = 1e-9;

export function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function sign(v: number): Sign {
  return Math.abs(v) < EPS ? "0" : v > 0 ? "+" : "−";
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** 150 → "5π/6"; 0 → "0"; 180 → "π"; 17 → null. */
export function radiansAsPi(deg: number): string | null {
  const d = normalizeDeg(deg);
  if (Math.abs(d - Math.round(d)) > EPS || Math.round(d) % 15 !== 0) return null;
  const n = Math.round(d);
  if (n === 0) return "0";
  const g = gcd(n, 180);
  const num = n / g;
  const den = 180 / g;
  const top = num === 1 ? "π" : `${num}π`;
  return den === 1 ? top : `${top}/${den}`;
}

export function unitCircleFacts(deg: number): UnitCircleFacts {
  const d = normalizeDeg(deg);
  const rad = (d * Math.PI) / 180;
  const clean = (v: number) => (Math.abs(v) < EPS ? 0 : v);
  const sin = clean(Math.sin(rad));
  const cos = clean(Math.cos(rad));
  const onAxis = Math.abs(d % 90) < EPS || Math.abs((d % 90) - 90) < EPS;
  const quadrant: Quadrant = onAxis ? "axis" : d < 90 ? 1 : d < 180 ? 2 : d < 270 ? 3 : 4;
  const referenceDeg = d <= 90 ? d : d <= 180 ? 180 - d : d <= 270 ? d - 180 : 360 - d;
  const tanUndefined = Math.abs(cos) < EPS;
  const tan = tanUndefined ? null : clean(sin / cos);
  return {
    degrees: d,
    radians: rad,
    radiansPi: radiansAsPi(d),
    quadrant,
    referenceDeg,
    sin,
    cos,
    tan,
    signs: { sin: sign(sin), cos: sign(cos), tan: tanUndefined ? "undef" : sign(tan as number) },
  };
}

import type { MathSolverMode } from "./StepByStepMathSolver";

/**
 * Pure math helpers backing the step-by-step-math-solver education layer (hero graph + 15
 * indicators). Kept separate from StepByStepMathSolver.ts (the actual above-fold calculator,
 * which stays untouched) so the two can evolve independently while sharing the same mode/field
 * names. Every function here is pure and unit-tested in __tests__/StepByStepMathSolverGraph.test.ts.
 */

// ---------------------------------------------------------------------------
// Central value formatting — no raw long decimals, no NaN/Infinity/-0/undefined ever surface.
// ---------------------------------------------------------------------------

export type MathValueFraction = { num: number; den: number };

/** Best rational approximation with denominator <= maxDen, or null if nothing within tolerance is that simple. */
export function toMathValueFraction(value: number, maxDen = 99, tolerance = 1e-6): MathValueFraction | null {
  if (!Number.isFinite(value)) return null;
  if (value === 0) return { num: 0, den: 1 };
  const sign = value < 0 ? -1 : 1;
  const x = Math.abs(value);

  // Continued-fraction convergents.
  let h1 = 1;
  let h0 = 0;
  let k1 = 0;
  let k0 = 1;
  let b = x;
  for (let i = 0; i < 32; i++) {
    const a = Math.floor(b);
    const h2 = a * h1 + h0;
    const k2 = a * k1 + k0;
    if (k2 > maxDen) break;
    h0 = h1;
    h1 = h2;
    k0 = k1;
    k1 = k2;
    if (Math.abs(b - a) < 1e-12) break;
    b = 1 / (b - a);
    if (!Number.isFinite(b)) break;
  }
  if (k1 === 0) return null;
  const approx = h1 / k1;
  if (Math.abs(approx - x) > tolerance * Math.max(1, x)) return null;
  return { num: sign * h1, den: k1 };
}

/** Rounds to `sig` significant figures, returning a finite number (never NaN/Infinity/-0). */
export function roundSignificant(value: number, sig = 4): number {
  if (!Number.isFinite(value)) return 0;
  if (value === 0) return 0;
  const mag = Math.ceil(Math.log10(Math.abs(value)));
  const factor = 10 ** (sig - mag);
  const rounded = Math.round(value * factor) / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
}

/**
 * The single formatter every component must use for any value shown to the user: a simple
 * fraction when the value is cleanly rational within a small denominator, otherwise a plain
 * decimal rounded to 4 significant figures. Never returns "NaN", "Infinity", "-0", or "undefined".
 */
export function formatMathValue(value: number | null | undefined, opts?: { maxDen?: number; sig?: number }): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "0";
  const v = Object.is(value, -0) ? 0 : value;
  const frac = toMathValueFraction(v, opts?.maxDen ?? 99);
  if (frac && frac.den > 1) return `${frac.num}/${frac.den}`;
  const rounded = roundSignificant(v, opts?.sig ?? 4);
  if (Number.isInteger(rounded)) return String(rounded);
  // trim trailing zeros from a fixed-ish decimal representation without reverting to raw long decimals
  let s = rounded.toPrecision(opts?.sig ?? 4);
  if (s.includes("e") || s.includes("E")) s = String(rounded);
  if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
  return s === "-0" ? "0" : s;
}

/** Drag-position snapping: pixel/coordinate-derived raw numbers collapse to a clean, typeable value. */
export function snapDragValue(raw: number, step = 0.5): number {
  if (!Number.isFinite(raw)) return 0;
  const nearestInt = Math.round(raw);
  if (Math.abs(raw - nearestInt) < 0.12) return Object.is(nearestInt, -0) ? 0 : nearestInt;
  const snapped = Math.round(raw / step) * step;
  return Object.is(snapped, -0) ? 0 : snapped;
}

// ---------------------------------------------------------------------------
// Polynomial evaluation
// ---------------------------------------------------------------------------

/** coeffs[i] is the coefficient of x^i (ascending powers). */
export type PolyCoeffs = number[];

export function evalPoly(coeffs: PolyCoeffs, x: number): number {
  let sum = 0;
  for (let i = 0; i < coeffs.length; i++) sum += coeffs[i] * x ** i;
  return sum;
}

export function derivPolyCoeffs(coeffs: PolyCoeffs): PolyCoeffs {
  return coeffs.slice(1).map((c, i) => c * (i + 1));
}

export function polyDegree(coeffs: PolyCoeffs): number {
  for (let i = coeffs.length - 1; i >= 0; i--) {
    if (coeffs[i] !== 0) return i;
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Closed-form roots (degree 1 and 2)
// ---------------------------------------------------------------------------

export function solveLinearRoot(c0: number, c1: number): number | null {
  if (c1 === 0) return null;
  return -c0 / c1;
}

export type QuadraticRootResult =
  | { kind: "two-real"; x1: number; x2: number; discriminant: number }
  | { kind: "one-real"; x: number; discriminant: number }
  | { kind: "complex"; re: number; im: number; discriminant: number };

export function solveQuadraticRoots(c0: number, c1: number, c2: number): QuadraticRootResult {
  const a = c2 || 1e-12;
  const b = c1;
  const c = c0;
  const discriminant = b * b - 4 * a * c;
  if (discriminant > 1e-9) {
    const s = Math.sqrt(discriminant);
    return { kind: "two-real", x1: (-b + s) / (2 * a), x2: (-b - s) / (2 * a), discriminant };
  }
  if (discriminant >= -1e-9) {
    return { kind: "one-real", x: -b / (2 * a), discriminant };
  }
  return { kind: "complex", re: -b / (2 * a), im: Math.sqrt(-discriminant) / (2 * a), discriminant };
}

export function quadraticVertex(c0: number, c1: number, c2: number): { x: number; y: number } {
  const a = c2 || 1e-12;
  const x = -c1 / (2 * a);
  return { x, y: evalPoly([c0, c1, c2], x) };
}

export function vietaFromQuadratic(c0: number, c1: number, c2: number): { sum: number; product: number } {
  const a = c2 || 1e-12;
  return { sum: -c1 / a, product: c0 / a };
}

// ---------------------------------------------------------------------------
// Numeric root-finding (Newton's method) for anything beyond degree 2
// ---------------------------------------------------------------------------

export type NewtonStep = { x: number; fx: number };

export function newtonIterate(coeffs: PolyCoeffs, x0: number, maxIter = 8): NewtonStep[] {
  const d = derivPolyCoeffs(coeffs);
  const steps: NewtonStep[] = [{ x: x0, fx: evalPoly(coeffs, x0) }];
  let x = x0;
  for (let i = 0; i < maxIter; i++) {
    const fx = evalPoly(coeffs, x);
    const fpx = evalPoly(d, x);
    if (Math.abs(fpx) < 1e-10 || !Number.isFinite(fpx)) break;
    const xNext = x - fx / fpx;
    if (!Number.isFinite(xNext)) break;
    steps.push({ x: xNext, fx: evalPoly(coeffs, xNext) });
    if (Math.abs(xNext - x) < 1e-9) {
      x = xNext;
      break;
    }
    x = xNext;
  }
  return steps;
}

/** Scans a bounded range for sign changes and refines each with Newton's method — a pragmatic
 * real-root finder for degree >= 3 polynomials, used only by the "derivative" mode's hero. */
export function findRealRootsNumerically(coeffs: PolyCoeffs, scanRange: [number, number] = [-12, 12], steps = 240): number[] {
  const roots: number[] = [];
  const [lo, hi] = scanRange;
  const dx = (hi - lo) / steps;
  let prevX = lo;
  let prevY = evalPoly(coeffs, prevX);
  for (let i = 1; i <= steps; i++) {
    const x = lo + i * dx;
    const y = evalPoly(coeffs, x);
    if (Number.isFinite(prevY) && Number.isFinite(y) && prevY === 0) {
      roots.push(prevX);
    } else if (Number.isFinite(prevY) && Number.isFinite(y) && prevY * y < 0) {
      const iter = newtonIterate(coeffs, (prevX + x) / 2, 20);
      const refined = iter[iter.length - 1].x;
      if (!roots.some((r) => Math.abs(r - refined) < 1e-4)) roots.push(refined);
    }
    prevX = x;
    prevY = y;
  }
  return roots.sort((a, b) => a - b);
}

// ---------------------------------------------------------------------------
// Deriving a single "f(x) = LHS - RHS" hero equation from whichever of the 4 draft modes is active
// ---------------------------------------------------------------------------

export type HeroEquation = {
  sourceMode: MathSolverMode;
  coeffs: PolyCoeffs; // ascending powers
  degree: number;
  isClosedForm: boolean; // degree <= 2
  label: string; // human-readable "2x^2 - 4x - 6 = 0"-style string, LTR math notation
};

export type MathSolverNumericDraft = {
  mode: MathSolverMode;
  linearA?: number;
  linearB?: number;
  linearC?: number;
  linearD?: number;
  quadA?: number;
  quadB?: number;
  quadC?: number;
  fracA?: number;
  fracB?: number;
  fracOp?: "add" | "subtract" | "multiply" | "divide";
  fracC?: number;
  fracD?: number;
  polynomialTerms: { coefficient: number; power: number }[];
};

function fractionResultValue(n: MathSolverNumericDraft): number {
  const a = n.fracA ?? 1;
  const b = n.fracB || 1;
  const c = n.fracC ?? 1;
  const d = n.fracD || 1;
  switch (n.fracOp) {
    case "subtract":
      return a / b - c / d;
    case "multiply":
      return (a / b) * (c / d);
    case "divide":
      return c === 0 ? 0 : a / b / (c / d);
    case "add":
    default:
      return a / b + c / d;
  }
}

function polyCoeffsFromTerms(terms: { coefficient: number; power: number }[]): PolyCoeffs {
  const maxPower = Math.max(0, ...terms.map((t) => (Number.isInteger(t.power) && t.power >= 0 ? t.power : 0)));
  const coeffs = new Array(maxPower + 1).fill(0);
  for (const t of terms) {
    if (Number.isInteger(t.power) && t.power >= 0 && t.power <= maxPower) coeffs[t.power] += t.coefficient;
  }
  return coeffs;
}

const SUPERSCRIPT_DIGITS: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
function superscript(n: number): string {
  return String(n)
    .split("")
    .map((d) => SUPERSCRIPT_DIGITS[d] ?? d)
    .join("");
}

function formatEquationLabel(coeffs: PolyCoeffs): string {
  const parts: string[] = [];
  for (let i = coeffs.length - 1; i >= 0; i--) {
    const c = coeffs[i];
    if (c === 0) continue;
    const abs = formatMathValue(Math.abs(c));
    const sign = c < 0 ? "-" : parts.length === 0 ? "" : "+";
    const spacedSign = parts.length === 0 ? sign : ` ${sign} `;
    const varPart = i === 0 ? "" : i === 1 ? "x" : `x${superscript(i)}`;
    const coeffPart = i === 0 || abs !== "1" ? abs : "";
    parts.push(`${spacedSign}${coeffPart}${varPart}`);
  }
  if (parts.length === 0) return "0 = 0";
  return `${parts.join("")} = 0`;
}

export function deriveHeroEquation(n: MathSolverNumericDraft): HeroEquation {
  let coeffs: PolyCoeffs;
  switch (n.mode) {
    case "linear-equation": {
      const a = n.linearA ?? 0;
      const b = n.linearB ?? 0;
      const c = n.linearC ?? 0;
      const d = n.linearD ?? 0;
      coeffs = [b - d, a - c];
      break;
    }
    case "quadratic-equation": {
      coeffs = [n.quadC ?? 0, n.quadB ?? 0, n.quadA ?? 1];
      break;
    }
    case "fraction-operation": {
      // Reframed honestly as "solve x = (the fraction expression)" -> x - result = 0.
      const result = fractionResultValue(n);
      coeffs = [-result, 1];
      break;
    }
    case "derivative": {
      coeffs = polyCoeffsFromTerms(n.polynomialTerms.length > 0 ? n.polynomialTerms : [{ coefficient: 0, power: 0 }]);
      break;
    }
  }
  const degree = polyDegree(coeffs);
  return {
    sourceMode: n.mode,
    coeffs,
    degree,
    isClosedForm: degree <= 2,
    label: formatEquationLabel(coeffs),
  };
}


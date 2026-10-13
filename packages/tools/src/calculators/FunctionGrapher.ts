import { evaluateExpression, parseExpression, type ExprNode } from "./GraphingCalculator";
import { analyzeGraph, derivativeAt, type GraphXY, type RealFunction } from "./GraphAnalysis";

/**
 * Pure math behind the home-page "Graph" mode: friendly expression parsing
 * (implicit multiplication, unicode operators, "y =" / "z =" prefixes),
 * curve and surface sampling, key points, intersections, a table of values
 * and nice axis ticks. No DOM.
 */

export type GrapherErrorCode = "empty" | "unknown-symbol" | "syntax" | "undefined";

export type CompiledGraph = {
  ok: true;
  /** Normalized source fed to the parser (explicit "*"), handy for display. */
  normalized: string;
  /** "surface" when the expression uses y (z = f(x, y)), otherwise "curve". */
  kind: "curve" | "surface";
  usesX: boolean;
  usesY: boolean;
  /** f(x, y); null where undefined. */
  evaluate: (x: number, y: number) => number | null;
  /** The y = 0 slice as a one-variable function (the curve itself for "curve"). */
  curve: RealFunction;
};

export type GraphCompileResult = CompiledGraph | { ok: false; error: GrapherErrorCode; symbol?: string };

const FUNCTION_NAMES = ["asin", "acos", "atan", "sqrt", "sin", "cos", "tan", "abs", "exp", "log", "ln", "max", "min"];
const CONSTANT_NAMES = ["pi", "e"];
const VARIABLE_NAMES = ["x", "y"];

type Lex = { t: "num" | "func" | "name" | "op" | "lp" | "rp" | "comma"; v: string };

function lex(src: string): Lex[] | { bad: string } {
  const out: Lex[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
    } else if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      const s = src.slice(i, j);
      if ((s.match(/\./g) ?? []).length > 1 || s === ".") return { bad: s };
      out.push({ t: "num", v: s });
      i = j;
    } else if (/[a-z]/.test(ch)) {
      let j = i;
      while (j < src.length && /[a-z]/.test(src[j])) j++;
      // split a letter run like "xsin" or "xy" into known names, longest first
      let k = i;
      while (k < j) {
        const rest = src.slice(k, j);
        const fn = FUNCTION_NAMES.find((n) => rest.startsWith(n));
        if (fn) {
          out.push({ t: "func", v: fn });
          k += fn.length;
          continue;
        }
        const name = [...CONSTANT_NAMES, ...VARIABLE_NAMES].find((n) => rest.startsWith(n));
        if (name) {
          out.push({ t: "name", v: name });
          k += name.length;
          continue;
        }
        return { bad: rest };
      }
      i = j;
    } else if ("+-*/^".includes(ch)) {
      out.push({ t: "op", v: ch });
      i++;
    } else if (ch === "(") {
      out.push({ t: "lp", v: ch });
      i++;
    } else if (ch === ")") {
      out.push({ t: "rp", v: ch });
      i++;
    } else if (ch === ",") {
      out.push({ t: "comma", v: ch });
      i++;
    } else {
      return { bad: ch };
    }
  }
  return out;
}

/** Lower-cases, maps unicode operators, strips "y =", "z =", "f(x) =" prefixes and inserts implicit "*". */
export function normalizeGraphExpression(raw: string): { source: string; tokens: Lex[] } | { error: GrapherErrorCode; symbol?: string } {
  const cleaned = raw
    .toLowerCase()
    .replace(/[−–—]/g, "-")
    .replace(/[·×∙⋅]/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, "pi")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/√/g, "sqrt")
    .trim()
    .replace(/^(?:[yz]|f\s*\(\s*x\s*(?:,\s*y\s*)?\))\s*=\s*/, "");
  if (!cleaned) return { error: "empty" };
  const lexed = lex(cleaned);
  if (!Array.isArray(lexed)) return { error: "unknown-symbol", symbol: lexed.bad };
  const tokens: Lex[] = [];
  for (const tok of lexed) {
    const prev = tokens[tokens.length - 1];
    const prevEnds = prev && (prev.t === "num" || prev.t === "name" || prev.t === "rp");
    const nextStarts = tok.t === "num" || tok.t === "name" || tok.t === "func" || tok.t === "lp";
    if (prevEnds && nextStarts) tokens.push({ t: "op", v: "*" });
    tokens.push(tok);
  }
  return { source: tokens.map((t) => t.v).join(""), tokens };
}

/** Compiles a user expression in x (curve) or x and y (surface). */
export function compileGraphExpression(raw: string): GraphCompileResult {
  const norm = normalizeGraphExpression(raw);
  if ("error" in norm) return { ok: false, error: norm.error, symbol: norm.symbol };
  let ast: ExprNode;
  try {
    ast = parseExpression(norm.source);
  } catch {
    return { ok: false, error: "syntax" };
  }
  const usesX = norm.tokens.some((t) => t.t === "name" && t.v === "x");
  const usesY = norm.tokens.some((t) => t.t === "name" && t.v === "y");
  const evaluate = (x: number, y: number): number | null => {
    try {
      const v = evaluateExpression(ast, { x, y });
      return Number.isFinite(v) ? v : null;
    } catch {
      return null;
    }
  };
  // reject expressions that are undefined everywhere we would draw them (e.g. "sqrt(-1-x^2)")
  let anyDefined = false;
  for (let i = 0; i <= 40 && !anyDefined; i++) {
    for (let j = 0; j <= (usesY ? 40 : 0) && !anyDefined; j++) {
      if (evaluate(-10 + i * 0.5, usesY ? -10 + j * 0.5 : 0) !== null) anyDefined = true;
    }
  }
  if (!anyDefined) return { ok: false, error: "undefined" };
  return {
    ok: true,
    normalized: norm.source,
    kind: usesY ? "surface" : "curve",
    usesX,
    usesY,
    evaluate,
    curve: (x: number) => evaluate(x, 0),
  };
}

export type CurveSegment = GraphXY[];

/**
 * Samples f over [xMin, xMax] and splits the polyline where f is undefined or
 * jumps across the view (asymptotes), so no fake vertical joins are drawn.
 */
export function sampleCurve(f: RealFunction, xMin: number, xMax: number, yMin: number, yMax: number, samples = 600): CurveSegment[] {
  const n = Math.max(2, Math.floor(samples));
  const span = Math.max(1e-12, yMax - yMin);
  const lo = yMin - span * 2;
  const hi = yMax + span * 2;
  const segments: CurveSegment[] = [];
  let cur: CurveSegment = [];
  let prev: number | null = null;
  for (let i = 0; i <= n; i++) {
    const x = xMin + ((xMax - xMin) * i) / n;
    const y = f(x);
    if (y === null || y < lo || y > hi || (prev !== null && Math.abs(y - prev) > span * 1.5)) {
      if (cur.length > 1) segments.push(cur);
      cur = [];
      if (y === null || y < lo || y > hi) {
        prev = null;
        continue;
      }
    }
    cur.push({ x, y: Math.min(hi, Math.max(lo, y)) });
    prev = y;
  }
  if (cur.length > 1) segments.push(cur);
  return segments;
}

export type GraphKeyPoints = {
  roots: GraphXY[];
  yIntercept: GraphXY | null;
  maxima: GraphXY[];
  minima: GraphXY[];
};

/** Roots, y-intercept and local extrema of f inside [xMin, xMax]. */
export function findKeyPoints(f: RealFunction, xMin: number, xMax: number): GraphKeyPoints {
  const a = analyzeGraph(f, xMin, xMax, 801);
  return {
    roots: a.roots.map((x) => ({ x, y: 0 })),
    yIntercept: a.yIntercept === null || xMin > 0 || xMax < 0 ? null : { x: 0, y: a.yIntercept },
    maxima: a.maxima,
    minima: a.minima,
  };
}

/** Points where f and g cross inside [xMin, xMax] (roots of f − g, asymptote jumps excluded). */
export function findIntersections(f: RealFunction, g: RealFunction, xMin: number, xMax: number): GraphXY[] {
  const h: RealFunction = (x) => {
    const a = f(x);
    const b = g(x);
    return a === null || b === null ? null : a - b;
  };
  const out: GraphXY[] = [];
  for (const x of analyzeGraph(h, xMin, xMax, 801).roots) {
    const y = f(x);
    if (y !== null) out.push({ x, y });
  }
  return out;
}

export type TraceInfo = { x: number; y: number; slope: number | null; intercept: number | null };

/** Point on the curve at x with its tangent slope and intercept (tangent y = slope·x + intercept). */
export function traceAt(f: RealFunction, x: number): TraceInfo | null {
  const y = f(x);
  if (y === null) return null;
  const s = derivativeAt(f, x);
  const slope = s === null ? null : Math.abs(s) < 1e-9 ? 0 : s;
  return { x, y, slope, intercept: slope === null ? null : y - slope * x };
}

/** f′ as a function, by central differences. */
export function derivativeFunction(f: RealFunction): RealFunction {
  return (x) => derivativeAt(f, x);
}

/** A "nice" step (1, 2 or 5 × 10^k) giving about `target` intervals over span. */
export function niceStep(span: number, target = 8): number {
  const raw = Math.abs(span) / Math.max(1, target);
  if (!(raw > 0) || !Number.isFinite(raw)) return 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const m = raw / pow;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * pow;
}

export type AxisTicks = { step: number; major: number[]; minor: number[] };

/** Major ticks on a nice step plus 5 (or 4 for a 2-step) minor subdivisions, within [min, max]. */
export function axisTicks(min: number, max: number, target = 8): AxisTicks {
  const step = niceStep(max - min, target);
  const mant = Math.round(step / 10 ** Math.floor(Math.log10(step)));
  const minorStep = step / (mant === 2 ? 4 : 5);
  const major: number[] = [];
  const minor: number[] = [];
  const clean = (v: number) => Number(v.toPrecision(12));
  for (let k = Math.ceil(min / minorStep); k * minorStep <= max && minor.length + major.length < 2000; k++) {
    const v = clean(k * minorStep);
    if (Math.abs(v / step - Math.round(v / step)) < 1e-6) major.push(Math.abs(v) < 1e-12 ? 0 : v);
    else minor.push(v);
  }
  return { step, major, minor };
}

export type ValueRow = { x: number; y: number | null; dy: number | null };

/** Table of x, f(x), f′(x) across [xMin, xMax] on multiples of step (at most maxRows rows). */
export function valueTable(f: RealFunction, xMin: number, xMax: number, step: number, maxRows = 200): ValueRow[] {
  if (!(step > 0) || !(xMax >= xMin)) return [];
  const rows: ValueRow[] = [];
  const start = Math.ceil(xMin / step - 1e-9);
  for (let k = start; k * step <= xMax + 1e-9 && rows.length < maxRows; k++) {
    const x = Number((k * step).toPrecision(12));
    const y = f(x);
    const d = y === null ? null : derivativeAt(f, x);
    rows.push({ x, y, dy: d === null ? null : Math.abs(d) < 1e-9 ? 0 : d });
  }
  return rows;
}

export type SurfaceGrid = {
  /** (n+1)×(n+1) heights, row-major by y then x; null where undefined. */
  z: (number | null)[];
  n: number;
  zMin: number;
  zMax: number;
};

/** Samples z = f(x, y) on an (n+1)² grid over the square [-r, r]², clipping extreme spikes. */
export function sampleSurface(f: (x: number, y: number) => number | null, r: number, n = 64): SurfaceGrid {
  const z: (number | null)[] = [];
  const vals: number[] = [];
  for (let j = 0; j <= n; j++) {
    for (let i = 0; i <= n; i++) {
      const v = f(-r + (2 * r * i) / n, -r + (2 * r * j) / n);
      z.push(v);
      if (v !== null) vals.push(v);
    }
  }
  if (!vals.length) return { z, n, zMin: -1, zMax: 1 };
  vals.sort((a, b) => a - b);
  const zMin = vals[Math.floor(vals.length * 0.01)];
  const zMax = vals[Math.min(vals.length - 1, Math.ceil(vals.length * 0.99) - 1)];
  const lo = zMin === zMax ? zMin - 1 : zMin;
  const hi = zMin === zMax ? zMax + 1 : zMax;
  return { z: z.map((v) => (v === null ? null : Math.min(hi, Math.max(lo, v)))), n, zMin: lo, zMax: hi };
}

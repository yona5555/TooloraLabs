import { evaluateExpression, parseExpression, type ExprNode } from "./GraphingCalculator";

/** A real-valued function that returns null wherever it is undefined (division by zero, sqrt of a negative, …). */
export type RealFunction = (x: number) => number | null;

export type GraphXY = { x: number; y: number };
export type GraphKeyPointKind = "root" | "y-intercept" | "maximum" | "minimum" | "inflection";
export type GraphKeyPoint = GraphXY & { kind: GraphKeyPointKind };
export type GraphTrend = "up" | "down";
export type GraphInterval = { from: number; to: number; trend: GraphTrend };
export type GraphSymmetry = "even" | "odd" | "neither";
export type GraphSymmetrySample = { x: number; fx: number; fNegX: number };

export type GraphAnalysis = {
  samples: number;
  /** Share (0–1) of sample points where f is defined. */
  definedRatio: number;
  /** Breaks between neighbouring samples: undefined points or jump discontinuities (asymptotes). */
  breakCount: number;
  yMin: number | null;
  yMax: number | null;
  globalMax: GraphXY | null;
  globalMin: GraphXY | null;
  /** Robust y window for drawing (ignores the spikes next to an asymptote). */
  viewYMin: number;
  viewYMax: number;
  roots: number[];
  yIntercept: number | null;
  maxima: GraphXY[];
  minima: GraphXY[];
  inflections: GraphXY[];
  keyPoints: GraphKeyPoint[];
  intervals: GraphInterval[];
  increasingRatio: number;
  decreasingRatio: number;
  concaveUpRatio: number;
  concaveDownRatio: number;
  positiveRatio: number;
  negativeRatio: number;
  signedArea: number;
  positiveArea: number;
  negativeArea: number;
  averageValue: number;
  arcLength: number;
  symmetry: GraphSymmetry;
  symmetrySamples: GraphSymmetrySample[];
};

/** Compiles an expression in x once; null when it does not parse. */
export function compileFunction(expression: string): RealFunction | null {
  let ast: ExprNode;
  try {
    ast = parseExpression(expression);
  } catch {
    return null;
  }
  return (x: number) => {
    try {
      const v = evaluateExpression(ast, { x });
      return Number.isFinite(v) ? v : null;
    } catch {
      return null;
    }
  };
}

/** Central-difference first derivative. */
export function derivativeAt(f: RealFunction, x: number, h = 1e-5): number | null {
  const a = f(x - h);
  const b = f(x + h);
  if (a === null || b === null) return null;
  return (b - a) / (2 * h);
}

/** Central-difference second derivative. */
export function secondDerivativeAt(f: RealFunction, x: number, h = 1e-4): number | null {
  const a = f(x - h);
  const m = f(x);
  const b = f(x + h);
  if (a === null || m === null || b === null) return null;
  return (b - 2 * m + a) / (h * h);
}

/** Forward difference quotient [f(x+h) − f(x)] / h — the secant slope that tends to f′(x). */
export function differenceQuotient(f: RealFunction, x: number, h: number): number | null {
  const a = f(x);
  const b = f(x + h);
  if (a === null || b === null || h === 0) return null;
  return (b - a) / h;
}

export type TangentLine = { x: number; y: number; slope: number; intercept: number; angleDeg: number };

/** Tangent line y = slope·x + intercept at x, with its inclination angle in degrees. */
export function tangentAt(f: RealFunction, x: number): TangentLine | null {
  const y = f(x);
  const slope = derivativeAt(f, x);
  if (y === null || slope === null) return null;
  return { x, y, slope, intercept: y - slope * x, angleDeg: (Math.atan(slope) * 180) / Math.PI };
}

export type RiemannMethod = "left" | "right" | "midpoint" | "trapezoid" | "simpson";

/** Riemann / trapezoid / Simpson approximation of ∫ f over [a, b] with n strips; undefined sample points count as 0. */
export function riemannSum(f: RealFunction, a: number, b: number, n: number, method: RiemannMethod): number {
  const strips = Math.max(1, Math.floor(n));
  const w = (b - a) / strips;
  const val = (x: number) => f(x) ?? 0;
  if (method === "simpson") {
    const m = strips % 2 === 0 ? strips : strips + 1;
    const h = (b - a) / m;
    let s = val(a) + val(b);
    for (let i = 1; i < m; i++) s += (i % 2 === 1 ? 4 : 2) * val(a + i * h);
    return (s * h) / 3;
  }
  let sum = 0;
  for (let i = 0; i < strips; i++) {
    const x0 = a + i * w;
    const x1 = x0 + w;
    if (method === "left") sum += val(x0);
    else if (method === "right") sum += val(x1);
    else if (method === "midpoint") sum += val((x0 + x1) / 2);
    else sum += (val(x0) + val(x1)) / 2;
  }
  return sum * w;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))));
  return sorted[idx];
}

function bisectRoot(f: RealFunction, a: number, b: number, fa: number): number | null {
  let lo = a;
  let hi = b;
  let flo = fa;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (fm === null) return null;
    if (fm === 0) return mid;
    if (Math.sign(fm) === Math.sign(flo)) {
      lo = mid;
      flo = fm;
    } else hi = mid;
  }
  return (lo + hi) / 2;
}

function goldenExtremum(f: RealFunction, a: number, b: number, kind: "max" | "min"): GraphXY | null {
  const g = (Math.sqrt(5) - 1) / 2;
  const sgn = kind === "max" ? -1 : 1;
  const val = (x: number) => {
    const v = f(x);
    return v === null ? null : sgn * v;
  };
  let lo = a;
  let hi = b;
  for (let i = 0; i < 80; i++) {
    const c = hi - g * (hi - lo);
    const d = lo + g * (hi - lo);
    const fc = val(c);
    const fd = val(d);
    if (fc === null || fd === null) return null;
    if (fc < fd) hi = d;
    else lo = c;
  }
  const x = (lo + hi) / 2;
  const y = f(x);
  return y === null ? null : { x, y };
}

function snap(n: number, scale: number): number {
  const tiny = Math.max(1e-9, scale * 1e-9);
  if (Math.abs(n) < tiny) return 0;
  return Number(n.toPrecision(10));
}

/**
 * Full numeric study of y = f(x) over [xMin, xMax]: roots (bisection), extrema (golden-section),
 * inflection points (second-difference sign change), monotonic intervals, concavity, sign shares,
 * signed/absolute area (trapezoid per continuous piece), arc length, average value and even/odd
 * symmetry. Jump discontinuities are detected with an intermediate-value check so an asymptote
 * (1/x, tan x) never produces a fake root or extremum.
 */
export function analyzeGraph(f: RealFunction, xMin: number, xMax: number, samples = 601): GraphAnalysis {
  const n = Math.max(3, Math.floor(samples));
  const step = (xMax - xMin) / (n - 1);
  const xs: number[] = [];
  const ys: (number | null)[] = [];
  for (let i = 0; i < n; i++) {
    const x = xMin + i * step;
    xs.push(x);
    ys.push(f(x));
  }
  const defined = ys.filter((y): y is number => y !== null);
  const sorted = [...defined].sort((a, b) => a - b);
  const p05 = percentile(sorted, 0.04);
  const p95 = percentile(sorted, 0.96);
  const span = Math.max(1e-9, p95 - p05, sorted.length ? Math.abs(sorted[sorted.length - 1] - sorted[0]) * 1e-3 : 0);
  const scale = Math.max(1, Math.abs(p05), Math.abs(p95));

  // continuous[i]: the piece between sample i and i+1 is drawn/integrated as one continuous stretch
  const continuous: boolean[] = [];
  let breakCount = 0;
  for (let i = 0; i < n - 1; i++) {
    const a = ys[i];
    const b = ys[i + 1];
    let ok = a !== null && b !== null;
    if (ok && Math.abs((b as number) - (a as number)) > 0.05 * span) {
      const m = f((xs[i] + xs[i + 1]) / 2);
      const lo = Math.min(a as number, b as number);
      const hi = Math.max(a as number, b as number);
      const pad = 0.05 * (hi - lo);
      ok = m !== null && m >= lo - pad && m <= hi + pad;
    }
    continuous.push(ok);
    if (!ok && (i === 0 || continuous[i - 1])) breakCount++;
  }

  // roots
  const roots: number[] = [];
  const pushRoot = (r: number) => {
    if (r < xMin - 1e-12 || r > xMax + 1e-12) return;
    if (roots.some((q) => Math.abs(q - r) < step / 2)) return;
    roots.push(snap(r, Math.max(1, Math.abs(xMax), Math.abs(xMin))));
  };
  for (let i = 0; i < n; i++) {
    const y = ys[i];
    if (y === 0) pushRoot(xs[i]);
    if (i < n - 1 && continuous[i]) {
      const b = ys[i + 1] as number;
      if ((y as number) * b < 0) {
        const r = bisectRoot(f, xs[i], xs[i + 1], y as number);
        if (r !== null) pushRoot(r);
      }
    }
  }
  roots.sort((a, b) => a - b);

  // extrema
  const maxima: GraphXY[] = [];
  const minima: GraphXY[] = [];
  const flatTol = 1e-12 * scale;
  for (let i = 1; i < n - 1; i++) {
    if (!continuous[i - 1] || !continuous[i]) continue;
    const d0 = (ys[i] as number) - (ys[i - 1] as number);
    const d1 = (ys[i + 1] as number) - (ys[i] as number);
    if (d0 > flatTol && d1 < -flatTol) {
      const p = goldenExtremum(f, xs[i - 1], xs[i + 1], "max");
      if (p) maxima.push({ x: snap(p.x, scale), y: snap(p.y, scale) });
    } else if (d0 < -flatTol && d1 > flatTol) {
      const p = goldenExtremum(f, xs[i - 1], xs[i + 1], "min");
      if (p) minima.push({ x: snap(p.x, scale), y: snap(p.y, scale) });
    }
  }

  // second differences → concavity + inflections
  const s: (number | null)[] = [];
  for (let i = 1; i < n - 1; i++) {
    s.push(continuous[i - 1] && continuous[i] ? (ys[i + 1] as number) - 2 * (ys[i] as number) + (ys[i - 1] as number) : null);
  }
  const curvTol = 1e-9 * Math.max(1, span);
  const inflections: GraphXY[] = [];
  let up = 0;
  let down = 0;
  let curvCount = 0;
  for (let k = 0; k < s.length; k++) {
    const v = s[k];
    if (v === null) continue;
    curvCount++;
    if (v > curvTol) up++;
    else if (v < -curvTol) down++;
    const w = k + 1 < s.length ? s[k + 1] : null;
    if (w !== null && Math.abs(v) > curvTol && Math.abs(w) > curvTol && Math.sign(v) !== Math.sign(w)) {
      const x0 = xs[k + 1];
      const x1 = xs[k + 2];
      const x = x0 + ((x1 - x0) * v) / (v - w);
      const y = f(x);
      if (y !== null && !inflections.some((q) => Math.abs(q.x - x) < step)) inflections.push({ x: snap(x, scale), y: snap(y, scale) });
    } else if (w !== null && v !== 0 && Math.abs(w) <= curvTol && k + 2 < s.length) {
      const z = s[k + 2];
      if (z !== null && Math.abs(z) > curvTol && Math.sign(z) !== Math.sign(v)) {
        const x = xs[k + 2];
        const y = f(x);
        if (y !== null && !inflections.some((q) => Math.abs(q.x - x) < step)) inflections.push({ x: snap(x, scale), y: snap(y, scale) });
      }
    }
  }

  // monotonic intervals, sign shares, area, arc length
  const intervals: GraphInterval[] = [];
  let inc = 0;
  let dec = 0;
  let segCount = 0;
  let signedArea = 0;
  let positiveArea = 0;
  let negativeArea = 0;
  let arcLength = 0;
  let definedSpan = 0;
  for (let i = 0; i < n - 1; i++) {
    if (!continuous[i]) continue;
    const a = ys[i] as number;
    const b = ys[i + 1] as number;
    segCount++;
    const d = b - a;
    const trend: GraphTrend | null = d > flatTol ? "up" : d < -flatTol ? "down" : null;
    if (trend === "up") inc++;
    if (trend === "down") dec++;
    if (trend) {
      const last = intervals[intervals.length - 1];
      if (last && last.trend === trend && Math.abs(last.to - xs[i]) < step / 2) last.to = xs[i + 1];
      else intervals.push({ from: xs[i], to: xs[i + 1], trend });
    }
    definedSpan += step;
    arcLength += Math.hypot(step, d);
    if (a >= 0 && b >= 0) positiveArea += ((a + b) / 2) * step;
    else if (a <= 0 && b <= 0) negativeArea += (-(a + b) / 2) * step;
    else {
      const t = a / (a - b);
      const left = (a / 2) * step * t;
      const right = (b / 2) * step * (1 - t);
      if (a > 0) {
        positiveArea += left;
        negativeArea -= right;
      } else {
        negativeArea -= left;
        positiveArea += right;
      }
    }
  }
  signedArea = positiveArea - negativeArea;
  for (const iv of intervals) {
    iv.from = snap(iv.from, scale);
    iv.to = snap(iv.to, scale);
  }

  const positiveCount = defined.filter((y) => y > 0).length;
  const negativeCount = defined.filter((y) => y < 0).length;

  // global extremes
  let globalMax: GraphXY | null = null;
  let globalMin: GraphXY | null = null;
  for (let i = 0; i < n; i++) {
    const y = ys[i];
    if (y === null) continue;
    if (!globalMax || y > globalMax.y) globalMax = { x: xs[i], y };
    if (!globalMin || y < globalMin.y) globalMin = { x: xs[i], y };
  }
  for (const p of maxima) if (globalMax && p.y > globalMax.y) globalMax = p;
  for (const p of minima) if (globalMin && p.y < globalMin.y) globalMin = p;

  // y-intercept
  const yIntercept = xMin <= 0 && xMax >= 0 ? f(0) : null;

  // symmetry
  const reach = Math.max(Math.abs(xMin), Math.abs(xMax)) || 1;
  const symmetrySamples: GraphSymmetrySample[] = [];
  let even = true;
  let odd = true;
  let checked = 0;
  for (let k = 1; k <= 24; k++) {
    const x = (reach * k) / 24.37;
    const a = f(x);
    const b = f(-x);
    if (a === null || b === null) continue;
    checked++;
    const tol = 1e-7 * Math.max(1, Math.abs(a), Math.abs(b));
    if (Math.abs(a - b) > tol) even = false;
    if (Math.abs(a + b) > tol) odd = false;
    if (symmetrySamples.length < 4 && k % 5 === 0) symmetrySamples.push({ x, fx: a, fNegX: b });
  }
  const symmetry: GraphSymmetry = checked === 0 ? "neither" : even ? "even" : odd ? "odd" : "neither";

  const keyPoints: GraphKeyPoint[] = [
    ...roots.map((x) => ({ kind: "root" as const, x, y: 0 })),
    ...(yIntercept !== null && !roots.some((r) => r === 0) ? [{ kind: "y-intercept" as const, x: 0, y: snap(yIntercept, scale) }] : []),
    ...maxima.map((p) => ({ kind: "maximum" as const, ...p })),
    ...minima.map((p) => ({ kind: "minimum" as const, ...p })),
    ...inflections.map((p) => ({ kind: "inflection" as const, ...p })),
  ].sort((a, b) => a.x - b.x);

  const pad = 0.08 * span;
  const lo = Math.min(p05, ...keyPoints.map((p) => p.y)) - pad;
  const hi = Math.max(p95, ...keyPoints.map((p) => p.y)) + pad;

  return {
    samples: n,
    definedRatio: defined.length / n,
    breakCount,
    yMin: sorted.length ? sorted[0] : null,
    yMax: sorted.length ? sorted[sorted.length - 1] : null,
    globalMax,
    globalMin,
    viewYMin: sorted.length ? Math.max(lo, sorted[0] - pad) : -1,
    viewYMax: sorted.length ? Math.min(hi, sorted[sorted.length - 1] + pad) : 1,
    roots,
    yIntercept: yIntercept === null ? null : snap(yIntercept, scale),
    maxima,
    minima,
    inflections,
    keyPoints,
    intervals,
    increasingRatio: segCount ? inc / segCount : 0,
    decreasingRatio: segCount ? dec / segCount : 0,
    concaveUpRatio: curvCount ? up / curvCount : 0,
    concaveDownRatio: curvCount ? down / curvCount : 0,
    positiveRatio: n ? positiveCount / n : 0,
    negativeRatio: n ? negativeCount / n : 0,
    signedArea: snap(signedArea, scale),
    positiveArea: snap(positiveArea, scale),
    negativeArea: snap(negativeArea, scale),
    averageValue: definedSpan > 0 ? snap(signedArea / definedSpan, scale) : 0,
    arcLength,
    symmetry,
    symmetrySamples,
  };
}

import {
  derivPolyCoeffs,
  evalPoly,
  findRealRootsNumerically,
  polyDegree,
  solveQuadraticRoots,
  type PolyCoeffs,
} from "./StepByStepMathSolverGraph";

/**
 * Pure curve sampling + key points behind the step-by-step-math-solver live
 * 3D plot: a viewing window that frames every root/vertex/critical point, the
 * sampled curve y = f(x) (and f'(x)), and the labelled key points. No DOM;
 * unit-tested in __tests__/StepByStepMathSolverCurve.test.ts.
 */

export type CurveKeyKind = "root" | "vertex" | "y-intercept" | "critical";

export type CurveKeyPoint = { kind: CurveKeyKind; x: number; y: number };

export type CurvePoint = { x: number; y: number };

export type CurvePlot = {
  xRange: [number, number];
  yRange: [number, number];
  samples: CurvePoint[];
  derivativeSamples: CurvePoint[];
  keyPoints: CurveKeyPoint[];
  realRoots: number[];
};

function clean(n: number): number {
  const r = Math.round(n * 1e9) / 1e9;
  return Object.is(r, -0) ? 0 : r;
}

function uniqueSorted(xs: number[]): number[] {
  const sorted = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  const out: number[] = [];
  for (const x of sorted) if (out.length === 0 || Math.abs(x - out[out.length - 1]) > 1e-6) out.push(clean(x));
  return out;
}

/** Real roots of a polynomial: closed form up to degree 2, Newton scan above. */
export function realPolyRoots(coeffs: PolyCoeffs): number[] {
  const deg = polyDegree(coeffs);
  if (deg <= 0) return [];
  if (deg === 1) return [clean(-coeffs[0] / coeffs[1])];
  if (deg === 2) {
    const r = solveQuadraticRoots(coeffs[0], coeffs[1], coeffs[2]);
    if (r.kind === "two-real") return uniqueSorted([r.x1, r.x2]);
    if (r.kind === "one-real") return [clean(r.x)];
    return [];
  }
  return uniqueSorted(findRealRootsNumerically(coeffs));
}

/**
 * Samples y = f(x) over a window that frames all key points (at least 6 units
 * wide, 1.5 units of margin each side). Key points: real roots, the vertex
 * (degree 2), critical points (degree ≥ 3) and the y-intercept.
 */
export function buildCurvePlot(coeffs: PolyCoeffs, sampleCount = 96): CurvePlot {
  const deg = polyDegree(coeffs);
  const roots = realPolyRoots(coeffs);
  const deriv = derivPolyCoeffs(coeffs);
  const keyPoints: CurveKeyPoint[] = roots.map((x) => ({ kind: "root" as const, x, y: 0 }));
  if (deg === 2) {
    const vx = clean(-coeffs[1] / (2 * coeffs[2]));
    keyPoints.push({ kind: "vertex", x: vx, y: clean(evalPoly(coeffs, vx)) });
  } else if (deg >= 3) {
    for (const x of realPolyRoots(deriv)) keyPoints.push({ kind: "critical", x, y: clean(evalPoly(coeffs, x)) });
  }
  keyPoints.push({ kind: "y-intercept", x: 0, y: clean(coeffs[0] ?? 0) });

  const xs = keyPoints.map((k) => k.x);
  let lo = Math.min(...xs) - 1.5;
  let hi = Math.max(...xs) + 1.5;
  if (hi - lo < 6) {
    const mid = (lo + hi) / 2;
    lo = mid - 3;
    hi = mid + 3;
  }
  const n = Math.max(8, Math.floor(sampleCount));
  const samples: CurvePoint[] = [];
  const derivativeSamples: CurvePoint[] = [];
  for (let i = 0; i <= n; i++) {
    const x = lo + ((hi - lo) * i) / n;
    samples.push({ x: clean(x), y: clean(evalPoly(coeffs, x)) });
    derivativeSamples.push({ x: clean(x), y: clean(evalPoly(deriv, x)) });
  }
  const ys = [0, ...samples.map((p) => p.y), ...keyPoints.map((k) => k.y)];
  let yLo = Math.min(...ys);
  let yHi = Math.max(...ys);
  if (yHi - yLo < 1e-9) {
    yLo -= 1;
    yHi += 1;
  }
  return { xRange: [clean(lo), clean(hi)], yRange: [clean(yLo), clean(yHi)], samples, derivativeSamples, keyPoints, realRoots: roots };
}

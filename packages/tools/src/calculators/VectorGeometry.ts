/**
 * Pure derived-quantity math for the Vector Calculator's live table, 3D drawing and education
 * indicators. No DOM. Everything here is computed from the same two input vectors the
 * VectorCalculator tool uses, so every chart follows the tool's real numbers.
 */

export type Vec3 = [number, number, number];

export type VectorRelation = "zero" | "parallel" | "antiparallel" | "orthogonal" | "acute" | "obtuse";

export type VectorAnalysis = {
  a: Vec3;
  b: Vec3;
  magA: number;
  magB: number;
  sum: Vec3;
  magSum: number;
  diff: Vec3;
  magDiff: number;
  dot: number;
  /** The three per-axis terms of the dot product: ax·bx, ay·by, az·bz. */
  dotTerms: Vec3;
  cross: Vec3;
  /** |A×B| — the area of the parallelogram A and B span. */
  crossMag: number;
  /** ½|A×B| — the area of the triangle A and B span. */
  triangleArea: number;
  /** cos θ (cosine similarity), null if either vector is zero. */
  cos: number | null;
  /** sin θ, null if either vector is zero. */
  sin: number | null;
  angleDeg: number | null;
  angleRad: number | null;
  unitA: Vec3 | null;
  unitB: Vec3 | null;
  /** Scalar projection of A onto B: A·B / |B|. */
  compAonB: number | null;
  /** Scalar projection of B onto A: A·B / |A|. */
  compBonA: number | null;
  /** Vector projection of A onto B. */
  projAonB: Vec3 | null;
  /** Rejection of A from B: A − projᴮA (perpendicular to B). Its length is the parallelogram height. */
  rejAfromB: Vec3 | null;
  rejMag: number | null;
  /** Direction angles of A with the x, y, z axes, in degrees. */
  dirAnglesA: Vec3 | null;
  dirAnglesB: Vec3 | null;
  /** Squared direction cosines of A (sum to 1). */
  dirCos2A: Vec3 | null;
  dirCos2B: Vec3 | null;
  /** Lagrange identity: |A|²|B|² = (A·B)² + |A×B|². */
  lagrangeTotal: number;
  dotSquared: number;
  crossSquared: number;
  /** Parallelogram law: |A+B|² + |A−B|² = 2(|A|² + |B|²). */
  parallelogramLeft: number;
  parallelogramRight: number;
  relation: VectorRelation;
};

const EPS = 1e-9;

export function vecMag(v: Vec3): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

export function vecDot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function vecCross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

export function vecScale(v: Vec3, k: number): Vec3 {
  return [v[0] * k, v[1] * k, v[2] * k];
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/** Classifies how A and B relate by the angle between them (tolerance on cos θ). */
export function classifyVectorRelation(cos: number | null): VectorRelation {
  if (cos === null) return "zero";
  if (cos >= 1 - 1e-9) return "parallel";
  if (cos <= -1 + 1e-9) return "antiparallel";
  if (Math.abs(cos) <= 1e-9) return "orthogonal";
  return cos > 0 ? "acute" : "obtuse";
}

export function analyzeVectors(a: Vec3, b: Vec3): VectorAnalysis {
  const magA = vecMag(a);
  const magB = vecMag(b);
  const sum: Vec3 = [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const diff: Vec3 = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dotTerms: Vec3 = [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
  const dot = dotTerms[0] + dotTerms[1] + dotTerms[2];
  const cross = vecCross(a, b);
  const crossMag = vecMag(cross);
  const hasA = magA > EPS;
  const hasB = magB > EPS;
  const both = hasA && hasB;
  const cos = both ? Math.min(1, Math.max(-1, dot / (magA * magB))) : null;
  const angleRad = cos === null ? null : Math.acos(cos);
  const sin = angleRad === null ? null : Math.sin(angleRad);
  const projAonB = hasB ? vecScale(b, dot / (magB * magB)) : null;
  const rejAfromB = projAonB ? ([a[0] - projAonB[0], a[1] - projAonB[1], a[2] - projAonB[2]] as Vec3) : null;
  const dirAngles = (v: Vec3, m: number): Vec3 => v.map((c) => toDeg(Math.acos(Math.min(1, Math.max(-1, c / m))))) as Vec3;
  const dirCos2 = (v: Vec3, m: number): Vec3 => v.map((c) => (c * c) / (m * m)) as Vec3;
  return {
    a,
    b,
    magA,
    magB,
    sum,
    magSum: vecMag(sum),
    diff,
    magDiff: vecMag(diff),
    dot,
    dotTerms,
    cross,
    crossMag,
    triangleArea: crossMag / 2,
    cos,
    sin,
    angleDeg: angleRad === null ? null : toDeg(angleRad),
    angleRad,
    unitA: hasA ? vecScale(a, 1 / magA) : null,
    unitB: hasB ? vecScale(b, 1 / magB) : null,
    compAonB: hasB ? dot / magB : null,
    compBonA: hasA ? dot / magA : null,
    projAonB,
    rejAfromB,
    rejMag: rejAfromB ? vecMag(rejAfromB) : null,
    dirAnglesA: hasA ? dirAngles(a, magA) : null,
    dirAnglesB: hasB ? dirAngles(b, magB) : null,
    dirCos2A: hasA ? dirCos2(a, magA) : null,
    dirCos2B: hasB ? dirCos2(b, magB) : null,
    lagrangeTotal: magA * magA * magB * magB,
    dotSquared: dot * dot,
    crossSquared: crossMag * crossMag,
    parallelogramLeft: vecMag(sum) ** 2 + vecMag(diff) ** 2,
    parallelogramRight: 2 * (magA * magA + magB * magB),
    relation: classifyVectorRelation(cos),
  };
}

/** A·B = |A||B|cos θ sampled across θ ∈ [0°, 180°] (inclusive), for the dot-vs-angle curve. */
export function dotVsAngleCurve(magA: number, magB: number, steps = 36): Array<{ deg: number; dot: number }> {
  const out: Array<{ deg: number; dot: number }> = [];
  for (let i = 0; i <= steps; i++) {
    const deg = (180 * i) / steps;
    out.push({ deg, dot: magA * magB * Math.cos((deg * Math.PI) / 180) });
  }
  return out;
}

/**
 * Points along the arc from unit(A) to unit(B) at the given radius (spherical interpolation),
 * for drawing the angle θ in 3D. Empty when either vector is zero or they are (anti)parallel
 * enough that the plane is undefined.
 */
export function angleArcPoints(a: Vec3, b: Vec3, radius: number, segments = 24): Vec3[] {
  const ma = vecMag(a);
  const mb = vecMag(b);
  if (ma < EPS || mb < EPS) return [];
  const ua = vecScale(a, 1 / ma);
  const ub = vecScale(b, 1 / mb);
  const cos = Math.min(1, Math.max(-1, vecDot(ua, ub)));
  const theta = Math.acos(cos);
  const s = Math.sin(theta);
  if (s < 1e-6) return [];
  const pts: Vec3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const w1 = Math.sin((1 - t) * theta) / s;
    const w2 = Math.sin(t * theta) / s;
    pts.push([(ua[0] * w1 + ub[0] * w2) * radius, (ua[1] * w1 + ub[1] * w2) * radius, (ua[2] * w1 + ub[2] * w2) * radius]);
  }
  return pts;
}

export type ScaleSensitivityRow = { factor: number; dot: number; crossMag: number; angleDeg: number | null; magSum: number };

/** What happens to A·B, |A×B|, θ and |A+B| when B is scaled by each factor (A fixed). */
export function scaleBSensitivity(a: Vec3, b: Vec3, factors: number[] = [0.5, 1, 2]): ScaleSensitivityRow[] {
  return factors.map((factor) => {
    const r = analyzeVectors(a, vecScale(b, factor));
    return { factor, dot: r.dot, crossMag: r.crossMag, angleDeg: r.angleDeg, magSum: r.magSum };
  });
}

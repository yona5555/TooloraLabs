/**
 * Pure 2x2 matrix helpers behind the matrix calculator's live indicators (eigenvalues, singular
 * values, condition number, classification, interpolation for the identity → A animation).
 * No DOM; every function takes a matrix as [a11, a12, a21, a22].
 */
export type Mat2 = [number, number, number, number];

export const IDENTITY2: Mat2 = [1, 0, 0, 1];

const EPS = 1e-12;

export function det2(m: Mat2): number {
  return m[0] * m[3] - m[1] * m[2];
}

export function trace2(m: Mat2): number {
  return m[0] + m[3];
}

export function add2(a: Mat2, b: Mat2): Mat2 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]];
}

export function mul2(a: Mat2, b: Mat2): Mat2 {
  return [a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3], a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3]];
}

export function transpose2(m: Mat2): Mat2 {
  return [m[0], m[2], m[1], m[3]];
}

export function inverse2(m: Mat2): Mat2 | null {
  const d = det2(m);
  if (Math.abs(d) < EPS) return null;
  return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d];
}

export function apply2(m: Mat2, v: [number, number]): [number, number] {
  return [m[0] * v[0] + m[1] * v[1], m[2] * v[0] + m[3] * v[1]];
}

/** Frobenius norm √(Σ aᵢⱼ²). */
export function frobenius2(m: Mat2): number {
  return Math.hypot(m[0], m[1], m[2], m[3]);
}

/** Column vectors (where î and ĵ land), their lengths and the angle between them in degrees. */
export function columns2(m: Mat2): { col1: [number, number]; col2: [number, number]; len1: number; len2: number; angleDeg: number } {
  const col1: [number, number] = [m[0], m[2]];
  const col2: [number, number] = [m[1], m[3]];
  const len1 = Math.hypot(col1[0], col1[1]);
  const len2 = Math.hypot(col2[0], col2[1]);
  const angleDeg = len1 < EPS || len2 < EPS ? 0 : (Math.acos(Math.max(-1, Math.min(1, (col1[0] * col2[0] + col1[1] * col2[1]) / (len1 * len2)))) * 180) / Math.PI;
  return { col1, col2, len1, len2, angleDeg };
}

export type Eigen2 = { discriminant: number; real: boolean; l1: number; l2: number; im: number };

/** Roots of λ² − tr·λ + det = 0. When complex, l1/l2 hold the shared real part and im the ± imaginary part. */
export function eigen2(m: Mat2): Eigen2 {
  const tr = trace2(m);
  const d = det2(m);
  const discriminant = tr * tr - 4 * d;
  if (discriminant >= 0) {
    const r = Math.sqrt(discriminant);
    return { discriminant, real: true, l1: (tr + r) / 2, l2: (tr - r) / 2, im: 0 };
  }
  return { discriminant, real: false, l1: tr / 2, l2: tr / 2, im: Math.sqrt(-discriminant) / 2 };
}

/** Characteristic polynomial p(λ) = λ² − tr(A)·λ + det(A). */
export function charPoly2(m: Mat2, lambda: number): number {
  return lambda * lambda - trace2(m) * lambda + det2(m);
}

/** Singular values σ₁ ≥ σ₂ ≥ 0 (square roots of the eigenvalues of AᵀA). σ₁·σ₂ = |det A|. */
export function singularValues2(m: Mat2): [number, number] {
  const p = m[0] * m[0] + m[1] * m[1] + m[2] * m[2] + m[3] * m[3];
  const q = det2(m) ** 2;
  const r = Math.sqrt(Math.max(0, p * p - 4 * q));
  return [Math.sqrt(Math.max(0, (p + r) / 2)), Math.sqrt(Math.max(0, (p - r) / 2))];
}

/** Condition number κ = σ₁/σ₂ (Infinity for a singular matrix). */
export function conditionNumber2(m: Mat2): number {
  const [s1, s2] = singularValues2(m);
  if (s2 < EPS * Math.max(1, s1)) return Infinity;
  return s1 / s2;
}

export type TransformKind = "singular" | "identity" | "rotation" | "reflection" | "scaling" | "shear" | "general";

/** What kind of geometric map the matrix is (checked in this order). */
export function classifyTransform2(m: Mat2, tol = 1e-9): TransformKind {
  const near = (x: number, y: number) => Math.abs(x - y) <= tol;
  const d = det2(m);
  if (Math.abs(d) <= tol) return "singular";
  if (near(m[0], 1) && near(m[1], 0) && near(m[2], 0) && near(m[3], 1)) return "identity";
  const ata = mul2(transpose2(m), m);
  const orthogonal = near(ata[0], 1) && near(ata[1], 0) && near(ata[2], 0) && near(ata[3], 1);
  if (orthogonal) return d > 0 ? "rotation" : "reflection";
  if (near(m[1], 0) && near(m[2], 0)) return "scaling";
  if ((near(m[1], 0) || near(m[2], 0)) && near(m[0], 1) && near(m[3], 1)) return "shear";
  return "general";
}

/** Linear blend (1 − t)·I + t·A — the path the identity → A animation follows. */
export function lerpFromIdentity2(m: Mat2, t: number): Mat2 {
  return [1 + (m[0] - 1) * t, m[1] * t, m[2] * t, 1 + (m[3] - 1) * t];
}

/** det(Aᵏ) for k = 1…n, which always equals det(A)ᵏ. */
export function detPowers2(m: Mat2, n: number): Array<{ k: number; det: number }> {
  const out: Array<{ k: number; det: number }> = [];
  let p: Mat2 = [...m] as Mat2;
  for (let k = 1; k <= n; k++) {
    out.push({ k, det: det2(p) });
    p = mul2(p, m);
  }
  return out;
}

export type DetZone = "flip" | "collapse" | "shrink" | "preserve" | "expand";

/** Where a determinant sits: orientation flip, collapse to a line, shrink, keep area, or expand. */
export function detZone(d: number, tol = 1e-9): DetZone {
  if (Math.abs(d) <= tol) return "collapse";
  if (d < 0) return "flip";
  if (Math.abs(d - 1) <= tol) return "preserve";
  return d < 1 ? "shrink" : "expand";
}

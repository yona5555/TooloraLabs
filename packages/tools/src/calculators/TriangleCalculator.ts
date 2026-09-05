export type TriangleMode = "sss" | "sas" | "asa" | "aas";

export type TriangleError = "invalid-sides" | "invalid-angles" | "triangle-inequality-violated" | "angle-sum-invalid";

export type TrianglePoint = { x: number; y: number };

export type TriangleResult = {
  valid: boolean;
  error: TriangleError | null;
  a: number;
  b: number;
  c: number;
  angleA: number;
  angleB: number;
  angleC: number;
  area: number;
  perimeter: number;
  vertices: [TrianglePoint, TrianglePoint, TrianglePoint];
};

const EPSILON = 1e-9;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}
function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

function isPositive(n: number): boolean {
  return Number.isFinite(n) && n > EPSILON;
}

const INVALID: TriangleResult = {
  valid: false,
  error: null,
  a: 0,
  b: 0,
  c: 0,
  angleA: 0,
  angleB: 0,
  angleC: 0,
  area: 0,
  perimeter: 0,
  vertices: [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ],
};

function invalid(error: TriangleError): TriangleResult {
  return { ...INVALID, error };
}

/**
 * Places vertex A at the origin and B along the positive x-axis (side c = AB), then derives C
 * from side b (AC) and the angle at A — the standard way to turn a solved triangle's abstract
 * side/angle values into concrete, drawable coordinates for the live SVG preview.
 */
function buildVertices(a: number, b: number, c: number, angleADeg: number): [TrianglePoint, TrianglePoint, TrianglePoint] {
  const angleARad = toRadians(angleADeg);
  return [
    { x: 0, y: 0 },
    { x: c, y: 0 },
    { x: b * Math.cos(angleARad), y: b * Math.sin(angleARad) },
  ];
}

/** Final validation + area/perimeter/vertex computation shared by every solve mode. */
function finalize(a: number, b: number, c: number, angleA: number, angleB: number, angleC: number): TriangleResult {
  if (!isPositive(a) || !isPositive(b) || !isPositive(c)) return invalid("invalid-sides");
  if (!isPositive(angleA) || !isPositive(angleB) || !isPositive(angleC)) return invalid("invalid-angles");
  if (Math.abs(angleA + angleB + angleC - 180) > 0.01) return invalid("angle-sum-invalid");
  if (a + b <= c || a + c <= b || b + c <= a) return invalid("triangle-inequality-violated");

  const s = (a + b + c) / 2;
  const area = Math.sqrt(Math.max(s * (s - a) * (s - b) * (s - c), 0));
  const perimeter = a + b + c;
  const vertices = buildVertices(a, b, c, angleA);

  return { valid: true, error: null, a, b, c, angleA, angleB, angleC, area, perimeter, vertices };
}

/** Side-Side-Side: three sides given; angles derived via the Law of Cosines. */
export function solveSSS(a: number, b: number, c: number): TriangleResult {
  if (!isPositive(a) || !isPositive(b) || !isPositive(c)) return invalid("invalid-sides");
  if (a + b <= c || a + c <= b || b + c <= a) return invalid("triangle-inequality-violated");

  const angleA = toDegrees(Math.acos(clamp((b * b + c * c - a * a) / (2 * b * c))));
  const angleB = toDegrees(Math.acos(clamp((a * a + c * c - b * b) / (2 * a * c))));
  const angleC = 180 - angleA - angleB;

  return finalize(a, b, c, angleA, angleB, angleC);
}

function clamp(x: number): number {
  return Math.min(1, Math.max(-1, x));
}

/** Side-Angle-Side: sides a and b with the included angle C between them; side c derived via the Law of Cosines. */
export function solveSAS(a: number, angleCDeg: number, b: number): TriangleResult {
  if (!isPositive(a) || !isPositive(b)) return invalid("invalid-sides");
  if (!isPositive(angleCDeg) || angleCDeg >= 180) return invalid("invalid-angles");

  const angleCRad = toRadians(angleCDeg);
  const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(angleCRad));
  const angleA = toDegrees(Math.acos(clamp((b * b + c * c - a * a) / (2 * b * c))));
  const angleB = 180 - angleCDeg - angleA;

  return finalize(a, b, c, angleA, angleB, angleCDeg);
}

/** Angle-Side-Angle: angles A and B with the included side c between them; remaining sides via the Law of Sines. */
export function solveASA(angleADeg: number, c: number, angleBDeg: number): TriangleResult {
  if (!isPositive(c)) return invalid("invalid-sides");
  if (!isPositive(angleADeg) || !isPositive(angleBDeg) || angleADeg + angleBDeg >= 180) return invalid("invalid-angles");

  const angleCDeg = 180 - angleADeg - angleBDeg;
  const sinC = Math.sin(toRadians(angleCDeg));
  const a = (c * Math.sin(toRadians(angleADeg))) / sinC;
  const b = (c * Math.sin(toRadians(angleBDeg))) / sinC;

  return finalize(a, b, c, angleADeg, angleBDeg, angleCDeg);
}

/** Angle-Angle-Side: angles A and B with a non-included side a (opposite A); remaining sides via the Law of Sines. */
export function solveAAS(angleADeg: number, angleBDeg: number, a: number): TriangleResult {
  if (!isPositive(a)) return invalid("invalid-sides");
  if (!isPositive(angleADeg) || !isPositive(angleBDeg) || angleADeg + angleBDeg >= 180) return invalid("invalid-angles");

  const angleCDeg = 180 - angleADeg - angleBDeg;
  const sinA = Math.sin(toRadians(angleADeg));
  const b = (a * Math.sin(toRadians(angleBDeg))) / sinA;
  const c = (a * Math.sin(toRadians(angleCDeg))) / sinA;

  return finalize(a, b, c, angleADeg, angleBDeg, angleCDeg);
}

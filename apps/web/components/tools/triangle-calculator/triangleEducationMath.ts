import { solveSSS, solveSAS } from "@tooloralabs/tools";

/**
 * One consistent worked-example triangle (real 5-6-7 scalene acute triangle, not a contrived
 * round-number fake) shared by every indicator added to the education section, so a reader
 * scrolling through the page sees the same numbers recur and connect rather than a fresh
 * unrelated example per chart. Every value below is derived from `solveSSS`/`solveSAS` (the
 * tool's own solving logic), never a hand-typed decimal.
 */
export const EXAMPLE_SIDES = { a: 5, b: 6, c: 7 } as const;

const base = solveSSS(EXAMPLE_SIDES.a, EXAMPLE_SIDES.b, EXAMPLE_SIDES.c);
if (!base.valid) throw new Error("triangleEducationMath: primary example must be a valid triangle");

export const EXAMPLE = base;

export const semiPerimeter = EXAMPLE.perimeter / 2;

/** Altitude (height) from each vertex to the side opposite it: h = 2 * Area / side. */
export const altitudes = {
  toA: (2 * EXAMPLE.area) / EXAMPLE.a,
  toB: (2 * EXAMPLE.area) / EXAMPLE.b,
  toC: (2 * EXAMPLE.area) / EXAMPLE.c,
};

/** Inradius: r = Area / s. */
export const inradius = EXAMPLE.area / semiPerimeter;

/** Circumdiameter (Law of Sines constant) and circumradius: 2R = a / sin(A) = b / sin(B) = c / sin(C). */
const toRad = (deg: number) => (deg * Math.PI) / 180;
export const lawOfSinesRatios = {
  a: EXAMPLE.a / Math.sin(toRad(EXAMPLE.angleA)),
  b: EXAMPLE.b / Math.sin(toRad(EXAMPLE.angleB)),
  c: EXAMPLE.c / Math.sin(toRad(EXAMPLE.angleC)),
};
export const circumdiameter = lawOfSinesRatios.a;
export const circumradius = circumdiameter / 2;

/** Isoperimetric compactness index: P^2 / A. Lower = closer to equilateral/circular, higher = more elongated. */
export const compactnessIndex = (EXAMPLE.perimeter * EXAMPLE.perimeter) / EXAMPLE.area;
// Reference bounds used only to place the index on a readable 0-100 strip: an equilateral
// triangle of any size has P^2/A = 12*sqrt(3) (~20.78), the theoretical minimum for any
// triangle; very thin slivers push the ratio arbitrarily high, so 60 is a practical, clearly
// "elongated" upper anchor for the strip rather than a hard mathematical ceiling.
export const compactnessMin = 12 * Math.sqrt(3);
export const compactnessMax = 60;

/** Heron's formula intermediate terms, shown step-by-step in the formula diagram. */
export const heron = {
  s: semiPerimeter,
  sMinusA: semiPerimeter - EXAMPLE.a,
  sMinusB: semiPerimeter - EXAMPLE.b,
  sMinusC: semiPerimeter - EXAMPLE.c,
  product: semiPerimeter * (semiPerimeter - EXAMPLE.a) * (semiPerimeter - EXAMPLE.b) * (semiPerimeter - EXAMPLE.c),
};

/** Angle-C sensitivity trio: sides a and b held fixed, angle C nudged +/-10 deg, side c re-solved via SAS (Law of Cosines). */
const ANGLE_DELTA = 10;
export const angleSensitivity = {
  lower: solveSAS(EXAMPLE.a, EXAMPLE.angleC - ANGLE_DELTA, EXAMPLE.b),
  current: EXAMPLE,
  higher: solveSAS(EXAMPLE.a, EXAMPLE.angleC + ANGLE_DELTA, EXAMPLE.b),
  delta: ANGLE_DELTA,
};

/** Solves an angle-C-driven variant of the example for live drag interactions (sides a, b fixed). */
export function solveByAngleC(angleCDeg: number) {
  const clamped = Math.min(Math.max(angleCDeg, 1), 178);
  return solveSAS(EXAMPLE.a, clamped, EXAMPLE.b);
}

/** Named reference triangles (largest interior angle), used to place the example on a shape spectrum. */
export const REFERENCE_TRIANGLES = [
  { key: "equilateral", sides: [6, 6, 6] as [number, number, number] },
  { key: "isoscelesRight", sides: [5, 5, 5 * Math.SQRT2] as [number, number, number] },
  { key: "thirtySixtyNinety", sides: [5, 5 * Math.sqrt(3), 10] as [number, number, number] },
  { key: "example", sides: [EXAMPLE_SIDES.a, EXAMPLE_SIDES.b, EXAMPLE_SIDES.c] as [number, number, number] },
  { key: "sliver", sides: [2, 2, 3.9] as [number, number, number] },
].map((ref) => {
  const solved = solveSSS(...ref.sides);
  const largestAngle = solved.valid ? Math.max(solved.angleA, solved.angleB, solved.angleC) : 0;
  return { ...ref, largestAngle };
});

export function classifyByAngle(largestAngle: number): "acute" | "right" | "obtuse" {
  if (Math.abs(largestAngle - 90) < 1) return "right";
  return largestAngle < 90 ? "acute" : "obtuse";
}

/** Unit conversion for the education section's side-c-in-another-system example (meters assumed as the base unit). */
export const METERS_TO_FEET = 3.28084;
export const exampleSideCFeet = EXAMPLE.c * METERS_TO_FEET;

export const round = (n: number, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
};

export function classifyBySides(a: number, b: number, c: number): "equilateral" | "isosceles" | "scalene" {
  const EPS = 1e-6;
  const equalPairs = [Math.abs(a - b) < EPS, Math.abs(b - c) < EPS, Math.abs(a - c) < EPS].filter(Boolean).length;
  if (equalPairs === 3) return "equilateral";
  return equalPairs > 0 ? "isosceles" : "scalene";
}

/** Reference table of named/special triangles for the Tagged Reference Table indicator, each solved for real via `solveSSS`. */
export const SPECIAL_TYPES = [
  { key: "equilateral", sides: [6, 6, 6] as [number, number, number] },
  { key: "isoscelesRight", sides: [5, 5, 5 * Math.SQRT2] as [number, number, number] },
  { key: "classicRight", sides: [3, 4, 5] as [number, number, number] },
  { key: "thirtySixtyNinety", sides: [5, 5 * Math.sqrt(3), 10] as [number, number, number] },
  { key: "example", sides: [EXAMPLE_SIDES.a, EXAMPLE_SIDES.b, EXAMPLE_SIDES.c] as [number, number, number] },
].map((t) => {
  const solved = solveSSS(...t.sides);
  const largestAngle = solved.valid ? Math.max(solved.angleA, solved.angleB, solved.angleC) : 0;
  return {
    ...t,
    sideClass: classifyBySides(...t.sides),
    angleClass: classifyByAngle(largestAngle),
  };
});

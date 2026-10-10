/**
 * Pure circle geometry used by the Circle Calculator's live table, 3D drawing and indicators.
 * Every quantity is a function of the radius alone (plus an angle or a polygon side count where
 * stated). No DOM, no formatting: callers format the numbers for display.
 */

/** Exact length/area conversion factors (inch and foot are defined exactly in SI). */
export const CIRCLE_UNIT_FACTORS = {
  cmPerInch: 2.54,
  cm2PerSquareInch: 6.4516,
  feetPerMeter: 1 / 0.3048,
  squareFeetPerSquareMeter: 1 / (0.3048 * 0.3048),
} as const;

export type CircleSector = {
  degrees: number;
  radians: number;
  arcLength: number;
  sectorArea: number;
  chord: number;
  /** Area between the chord and the arc. */
  segmentArea: number;
};

/** Sector, arc, chord and segment for a central angle in degrees (0–360). */
export function circleSector(radius: number, degrees: number): CircleSector {
  const radians = (degrees * Math.PI) / 180;
  return {
    degrees,
    radians,
    arcLength: radius * radians,
    sectorArea: 0.5 * radius * radius * radians,
    chord: 2 * radius * Math.sin(radians / 2),
    segmentArea: 0.5 * radius * radius * (radians - Math.sin(radians)),
  };
}

export type CircleSquares = {
  inscribedSide: number;
  inscribedArea: number;
  circumscribedSide: number;
  circumscribedArea: number;
  /** The four circular segments between the inscribed square and the circle: (π − 2)r². */
  segmentsArea: number;
  /** The four corners between the circle and the circumscribed square: (4 − π)r². */
  cornersArea: number;
  inscribedHexagonArea: number;
  circumscribedHexagonArea: number;
};

export function circleSquares(radius: number): CircleSquares {
  const r2 = radius * radius;
  return {
    inscribedSide: radius * Math.SQRT2,
    inscribedArea: 2 * r2,
    circumscribedSide: 2 * radius,
    circumscribedArea: 4 * r2,
    segmentsArea: (Math.PI - 2) * r2,
    cornersArea: (4 - Math.PI) * r2,
    inscribedHexagonArea: ((3 * Math.sqrt(3)) / 2) * r2,
    circumscribedHexagonArea: 2 * Math.sqrt(3) * r2,
  };
}

export type CircleSolids = {
  sphereVolume: number;
  sphereSurface: number;
  /** Cylinder whose height equals the diameter (the sphere's bounding cylinder). */
  cylinderVolume: number;
  cylinderSurface: number;
  /** Cone with the same base and height = diameter. */
  coneVolume: number;
};

export function circleSolids(radius: number): CircleSolids {
  const r2 = radius * radius;
  const r3 = r2 * radius;
  return {
    sphereVolume: (4 / 3) * Math.PI * r3,
    sphereSurface: 4 * Math.PI * r2,
    cylinderVolume: 2 * Math.PI * r3,
    cylinderSurface: 6 * Math.PI * r2,
    coneVolume: (2 / 3) * Math.PI * r3,
  };
}

export type PolygonApproximation = {
  sides: number;
  inscribedPerimeter: number;
  circumscribedPerimeter: number;
  inscribedArea: number;
  circumscribedArea: number;
  /** Archimedes' bounds on π: n·sin(π/n) < π < n·tan(π/n). */
  piLower: number;
  piUpper: number;
  /** Inscribed perimeter as a share of the true circumference (0–1). */
  perimeterShare: number;
};

/** Archimedes' method: regular n-gons inside and around the circle. */
export function polygonApproximation(radius: number, sides: number): PolygonApproximation {
  const n = Math.max(3, Math.round(sides));
  const a = Math.PI / n;
  const piLower = n * Math.sin(a);
  const piUpper = n * Math.tan(a);
  return {
    sides: n,
    inscribedPerimeter: 2 * radius * piLower,
    circumscribedPerimeter: 2 * radius * piUpper,
    inscribedArea: 0.5 * n * radius * radius * Math.sin(2 * a),
    circumscribedArea: n * radius * radius * Math.tan(a),
    piLower,
    piUpper,
    perimeterShare: piLower / Math.PI,
  };
}

export type AnnulusBand = { inner: number; outer: number; area: number; share: number };

/** Splits the disk into `rings` equal-width concentric bands (center disk first). */
export function annulusBands(radius: number, rings = 4): AnnulusBand[] {
  const total = Math.PI * radius * radius;
  const step = radius / rings;
  return Array.from({ length: rings }, (_, i) => {
    const inner = i * step;
    const outer = (i + 1) * step;
    const area = Math.PI * (outer * outer - inner * inner);
    return { inner, outer, area, share: total > 0 ? area / total : 0 };
  });
}

export type IsoperimetricShape = "circle" | "hexagon" | "square" | "triangle";
export type IsoperimetricEntry = { shape: IsoperimetricShape; side: number; area: number; shareOfCircle: number };

/** Shapes sharing the same perimeter, ranked by enclosed area (largest first). */
export function isoperimetricRanking(perimeter: number): IsoperimetricEntry[] {
  const circle = (perimeter * perimeter) / (4 * Math.PI);
  const hexSide = perimeter / 6;
  const sqSide = perimeter / 4;
  const triSide = perimeter / 3;
  const list: Array<Omit<IsoperimetricEntry, "shareOfCircle">> = [
    { shape: "circle", side: perimeter / (2 * Math.PI), area: circle },
    { shape: "hexagon", side: hexSide, area: ((3 * Math.sqrt(3)) / 2) * hexSide * hexSide },
    { shape: "square", side: sqSide, area: sqSide * sqSide },
    { shape: "triangle", side: triSide, area: (Math.sqrt(3) / 4) * triSide * triSide },
  ];
  return list
    .map((e) => ({ ...e, shareOfCircle: circle > 0 ? e.area / circle : 0 }))
    .sort((a, b) => b.area - a.area);
}

export type CircleSensitivityPoint = { factor: number; radius: number; circumference: number; area: number };

/** Radius scaled by (1 − pct), 1 and (1 + pct): circumference moves linearly, area quadratically. */
export function circleSensitivity(radius: number, pct: number): CircleSensitivityPoint[] {
  return [1 - pct, 1, 1 + pct].map((factor) => {
    const r = radius * factor;
    return { factor, radius: r, circumference: 2 * Math.PI * r, area: Math.PI * r * r };
  });
}

export type AngleZone = "zero" | "acute" | "right" | "obtuse" | "straight" | "reflex" | "full";

export function sectorAngleZone(degrees: number): AngleZone {
  const d = Math.round(degrees * 1e6) / 1e6;
  if (d <= 0) return "zero";
  if (d < 90) return "acute";
  if (d === 90) return "right";
  if (d < 180) return "obtuse";
  if (d === 180) return "straight";
  if (d < 360) return "reflex";
  return "full";
}

/** The radius at which circumference and area are numerically equal (2πr = πr²). */
export const CIRCLE_EQUAL_C_A_RADIUS = 2;

/**
 * A round 1/2/5 × 10^k display scale so that radius ÷ scale lands in about [0.5, 1.25] —
 * keeps a drawing of any size readable without the axis numbers getting awkward.
 */
export function circleDisplayScale(radius: number): number {
  if (!(radius > 0) || !Number.isFinite(radius)) return 1;
  const k = Math.floor(Math.log10(radius));
  const base = 10 ** k;
  const m = radius / base;
  const nice = m < 1.25 ? 1 : m < 2.5 ? 2 : m < 6.25 ? 5 : 10;
  return nice * base;
}

/** Rounds to `digits` significant figures (for values written back from a drag). */
export function circleRoundSignificant(value: number, digits = 3): number {
  if (value === 0 || !Number.isFinite(value)) return value;
  const p = digits - 1 - Math.floor(Math.log10(Math.abs(value)));
  const f = 10 ** p;
  return Math.round(value * f) / f;
}

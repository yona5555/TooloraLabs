import type { AreaShape } from "./AreaCalculator";

/** Numeric dimensions of a plane shape, the same fields AreaCalculator accepts. */
export type PlaneDims = {
  shape: AreaShape;
  side?: number;
  width?: number;
  height?: number;
  base?: number;
  radius?: number;
  semiMajorAxis?: number;
  semiMinorAxis?: number;
  base1?: number;
  base2?: number;
  angleDegrees?: number;
};

export type Pt = [number, number];

/** Horizontal offset of a triangle's apex and of a parallelogram's top edge, as a fraction of the base (matches the 2D preview). */
export const TRIANGLE_APEX_FRACTION = 0.35;
export const PARALLELOGRAM_SKEW_FRACTION = 0.25;

function ok(...values: Array<number | undefined>): boolean {
  return values.every((v) => typeof v === "number" && Number.isFinite(v) && v > 0);
}

/** True when every dimension the shape needs is a positive finite number (sector angle ≤ 360). */
export function planeDimsValid(d: PlaneDims): boolean {
  switch (d.shape) {
    case "square":
      return ok(d.side);
    case "rectangle":
      return ok(d.width, d.height);
    case "triangle":
    case "parallelogram":
      return ok(d.base, d.height);
    case "circle":
      return ok(d.radius);
    case "ellipse":
      return ok(d.semiMajorAxis, d.semiMinorAxis);
    case "trapezoid":
      return ok(d.base1, d.base2, d.height);
    case "sector":
      return ok(d.radius, d.angleDegrees) && (d.angleDegrees as number) <= 360;
    default:
      return false;
  }
}

/**
 * Outline of the shape as a closed polygon (last point not repeated), centered on its bounding
 * box, x to the right and y up. Curves are sampled with `segments` points per full turn.
 */
export function planeOutline(d: PlaneDims, segments = 72): Pt[] {
  if (!planeDimsValid(d)) return [];
  let pts: Pt[];
  switch (d.shape) {
    case "square": {
      const s = d.side as number;
      pts = [[0, 0], [s, 0], [s, s], [0, s]];
      break;
    }
    case "rectangle": {
      const w = d.width as number;
      const h = d.height as number;
      pts = [[0, 0], [w, 0], [w, h], [0, h]];
      break;
    }
    case "triangle": {
      const b = d.base as number;
      const h = d.height as number;
      pts = [[0, 0], [b, 0], [b * TRIANGLE_APEX_FRACTION, h]];
      break;
    }
    case "parallelogram": {
      const b = d.base as number;
      const h = d.height as number;
      const k = b * PARALLELOGRAM_SKEW_FRACTION;
      pts = [[0, 0], [b, 0], [b + k, h], [k, h]];
      break;
    }
    case "trapezoid": {
      const b1 = d.base1 as number;
      const b2 = d.base2 as number;
      const h = d.height as number;
      pts = [[-b1 / 2, 0], [b1 / 2, 0], [b2 / 2, h], [-b2 / 2, h]];
      break;
    }
    case "circle":
    case "ellipse": {
      const a = d.shape === "circle" ? (d.radius as number) : (d.semiMajorAxis as number);
      const b = d.shape === "circle" ? (d.radius as number) : (d.semiMinorAxis as number);
      pts = Array.from({ length: segments }, (_, i) => {
        const t = (i / segments) * 2 * Math.PI;
        return [a * Math.cos(t), b * Math.sin(t)] as Pt;
      });
      break;
    }
    case "sector": {
      const r = d.radius as number;
      const angle = ((d.angleDegrees as number) * Math.PI) / 180;
      const n = Math.max(2, Math.ceil((segments * (d.angleDegrees as number)) / 360));
      pts = d.angleDegrees === 360 ? [] : [[0, 0]];
      const count = d.angleDegrees === 360 ? n : n + 1;
      for (let i = 0; i < count; i++) {
        const t = (i / n) * angle;
        pts.push([r * Math.cos(t), r * Math.sin(t)]);
      }
      break;
    }
    default:
      return [];
  }
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  return pts.map(([x, y]) => [x - cx, y - cy]);
}

export type PlaneMetrics = {
  shape: AreaShape;
  area: number;
  /** Exact perimeter, or Ramanujan's approximation for the ellipse; null where the given dimensions don't fix it. */
  perimeter: number | null;
  boundingWidth: number;
  boundingHeight: number;
  boundingArea: number;
  fillRatio: number;
  equivalentSquareSide: number;
  equivalentCircleRadius: number;
  /** Isoperimetric quotient 4πA/P² (1 for a circle); null where the perimeter is unknown. */
  compactness: number | null;
  diagonal: number | null;
  diameter: number | null;
  arcLength: number | null;
  chord: number | null;
  midsegment: number | null;
  eccentricity: number | null;
};

/** Full breakdown of a plane shape, or null when a dimension is missing/invalid. */
export function planeMetrics(d: PlaneDims): PlaneMetrics | null {
  if (!planeDimsValid(d)) return null;
  let area: number;
  let perimeter: number | null = null;
  let diagonal: number | null = null;
  let diameter: number | null = null;
  let arcLength: number | null = null;
  let chord: number | null = null;
  let midsegment: number | null = null;
  let eccentricity: number | null = null;

  switch (d.shape) {
    case "square": {
      const s = d.side as number;
      area = s * s;
      perimeter = 4 * s;
      diagonal = s * Math.SQRT2;
      break;
    }
    case "rectangle": {
      const w = d.width as number;
      const h = d.height as number;
      area = w * h;
      perimeter = 2 * (w + h);
      diagonal = Math.hypot(w, h);
      break;
    }
    case "triangle":
      area = 0.5 * (d.base as number) * (d.height as number);
      break;
    case "parallelogram":
      area = (d.base as number) * (d.height as number);
      break;
    case "trapezoid":
      midsegment = ((d.base1 as number) + (d.base2 as number)) / 2;
      area = midsegment * (d.height as number);
      break;
    case "circle": {
      const r = d.radius as number;
      area = Math.PI * r * r;
      perimeter = 2 * Math.PI * r;
      diameter = 2 * r;
      break;
    }
    case "ellipse": {
      const a = Math.max(d.semiMajorAxis as number, d.semiMinorAxis as number);
      const b = Math.min(d.semiMajorAxis as number, d.semiMinorAxis as number);
      area = Math.PI * a * b;
      const hh = ((a - b) / (a + b)) ** 2;
      perimeter = Math.PI * (a + b) * (1 + (3 * hh) / (10 + Math.sqrt(4 - 3 * hh)));
      eccentricity = Math.sqrt(1 - (b * b) / (a * a));
      break;
    }
    case "sector": {
      const r = d.radius as number;
      const deg = d.angleDegrees as number;
      const rad = (deg * Math.PI) / 180;
      area = 0.5 * r * r * rad;
      arcLength = r * rad;
      chord = 2 * r * Math.sin(rad / 2);
      perimeter = deg === 360 ? arcLength : 2 * r + arcLength;
      diameter = 2 * r;
      break;
    }
    default:
      return null;
  }

  const outline = planeOutline(d);
  const xs = outline.map((p) => p[0]);
  const ys = outline.map((p) => p[1]);
  const boundingWidth = Math.max(...xs) - Math.min(...xs);
  const boundingHeight = Math.max(...ys) - Math.min(...ys);
  // Curves are sampled, so snap the circle/ellipse box to its exact size.
  const exactBox: Partial<Record<AreaShape, [number, number]>> = {
    circle: [2 * (d.radius ?? 0), 2 * (d.radius ?? 0)],
    ellipse: [2 * (d.semiMajorAxis ?? 0), 2 * (d.semiMinorAxis ?? 0)],
  };
  const [bw, bh] = exactBox[d.shape] ?? [boundingWidth, boundingHeight];
  const boundingArea = bw * bh;

  return {
    shape: d.shape,
    area,
    perimeter,
    boundingWidth: bw,
    boundingHeight: bh,
    boundingArea,
    fillRatio: area / boundingArea,
    equivalentSquareSide: Math.sqrt(area),
    equivalentCircleRadius: Math.sqrt(area / Math.PI),
    compactness: perimeter ? (4 * Math.PI * area) / (perimeter * perimeter) : null,
    diagonal,
    diameter,
    arcLength,
    chord,
    midsegment,
    eccentricity,
  };
}

/**
 * Spacing for a unit-square grid laid over a shape: 1 unit whenever that keeps the line count at
 * or under `maxLines` across the larger extent, otherwise the next "nice" step (2, 5, 10, 20…);
 * sub-unit steps (0.1, 0.2, 0.5) only for shapes smaller than 2 units across.
 */
export function unitGridStep(maxExtent: number, maxLines = 24): number {
  if (!(maxExtent > 0) || !Number.isFinite(maxExtent)) return 1;
  const minStep = maxExtent >= 2 ? 1 : 0.1;
  for (let mag = 0.1; ; mag *= 10) {
    for (const m of [1, 2, 5]) {
      const step = Number((m * mag).toPrecision(6));
      if (step >= minStep && maxExtent / step <= maxLines) return step;
    }
  }
}

/** Even-odd point-in-polygon test. */
export function pointInPolygon(p: Pt, poly: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Grid lines (spaced `step`, aligned to the shape's lower-left bounding corner) clipped to the polygon interior. */
export function clipGridLines(poly: Pt[], step: number): Array<[Pt, Pt]> {
  if (poly.length < 3 || !(step > 0)) return [];
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const segs: Array<[Pt, Pt]> = [];
  const eps = 1e-9;

  const crossings = (c: number, axis: 0 | 1): number[] => {
    const other = axis === 0 ? 1 : 0;
    const hits: number[] = [];
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[j];
      const b = poly[i];
      if (a[axis] > c !== b[axis] > c) hits.push(a[other] + ((c - a[axis]) * (b[other] - a[other])) / (b[axis] - a[axis]));
    }
    return hits.sort((m, n) => m - n);
  };

  for (let y = y0 + step; y < y1 - eps; y += step) {
    const h = crossings(y, 1);
    for (let k = 0; k + 1 < h.length; k += 2) segs.push([[h[k], y], [h[k + 1], y]]);
  }
  for (let x = x0 + step; x < x1 - eps; x += step) {
    const v = crossings(x, 0);
    for (let k = 0; k + 1 < v.length; k += 2) segs.push([[x, v[k]], [x, v[k + 1]]]);
  }
  return segs;
}

/** Counts grid cells of size `step` (aligned like clipGridLines) wholly inside the shape and those only partly inside. */
export function countGridCells(poly: Pt[], step: number): { full: number; partial: number } {
  if (poly.length < 3 || !(step > 0)) return { full: 0, partial: 0 };
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const eps = 1e-7;
  let full = 0;
  let partial = 0;
  const cols = Math.ceil((x1 - x0) / step - eps);
  const rows = Math.ceil((y1 - y0) / step - eps);
  // Sample each cell on a 5×5 lattice, pulled in by eps so shared edges count as inside.
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const cx0 = x0 + i * step;
      const cy0 = y0 + j * step;
      const cx1 = Math.min(cx0 + step, x1);
      const cy1 = Math.min(cy0 + step, y1);
      let inCount = 0;
      let total = 0;
      for (let a = 0; a <= 4; a++) {
        for (let b = 0; b <= 4; b++) {
          const px = cx0 + eps + ((cx1 - cx0 - 2 * eps) * a) / 4;
          const py = cy0 + eps + ((cy1 - cy0 - 2 * eps) * b) / 4;
          total++;
          if (pointInPolygon([px, py], poly)) inCount++;
        }
      }
      const whole = cx1 - cx0 >= step - eps && cy1 - cy0 >= step - eps;
      if (inCount === total && whole) full++;
      else if (inCount > 0) partial++;
    }
  }
  return { full, partial };
}

import { AreaCalculator, type AreaShape } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";
import type { AreaDraft } from "./types";

export type AreaNumericDims = {
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

const tool = new AreaCalculator();

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

export function parseAreaDims(draft: AreaDraft): AreaNumericDims {
  return {
    shape: draft.shape,
    side: toNum(draft.side),
    width: toNum(draft.width),
    height: toNum(draft.height),
    base: toNum(draft.base),
    radius: toNum(draft.radius),
    semiMajorAxis: toNum(draft.semiMajorAxis),
    semiMinorAxis: toNum(draft.semiMinorAxis),
    base1: toNum(draft.base1),
    base2: toNum(draft.base2),
    angleDegrees: toNum(draft.angleDegrees),
  };
}

/** The real engine area for these dims, 0 if any required dimension is missing/invalid. */
export function computeAreaFor(dims: AreaNumericDims): number {
  const out = tool.execute(dims, { locale: "en-US" });
  return out.success && !out.data.error ? out.data.area : 0;
}

/** Every shape's own single "characteristic length" — the dimension that best represents its overall size, used to compare shapes on equal footing. */
export function characteristicLength(dims: AreaNumericDims): number {
  switch (dims.shape) {
    case "square":
      return dims.side ?? 1;
    case "rectangle":
      return Math.max(dims.width ?? 1, dims.height ?? 1);
    case "triangle":
    case "parallelogram":
      return dims.base ?? 1;
    case "circle":
    case "sector":
      return dims.radius ?? 1;
    case "ellipse":
      return dims.semiMajorAxis ?? 1;
    case "trapezoid":
      return Math.max(dims.base1 ?? 1, dims.base2 ?? 1);
  }
}

/** The area of the smallest axis-aligned rectangle that fully contains the shape. */
export function boundingBoxArea(dims: AreaNumericDims): number {
  switch (dims.shape) {
    case "square":
      return (dims.side ?? 1) ** 2;
    case "rectangle":
    case "parallelogram":
      return (dims.width ?? dims.base ?? 1) * (dims.height ?? 1);
    case "triangle":
      return (dims.base ?? 1) * (dims.height ?? 1);
    case "circle":
      return (2 * (dims.radius ?? 1)) ** 2;
    case "ellipse":
      return 2 * (dims.semiMajorAxis ?? 1) * (2 * (dims.semiMinorAxis ?? 1));
    case "trapezoid":
      return Math.max(dims.base1 ?? 1, dims.base2 ?? 1) * (dims.height ?? 1);
    case "sector": {
      const r = dims.radius ?? 1;
      return (2 * r) ** 2;
    }
  }
}

/** The real perimeter/boundary length, only for shapes where it follows exactly from the given dimensions alone. Null where additional unknown sides would be required. */
export function perimeterOf(dims: AreaNumericDims): number | null {
  switch (dims.shape) {
    case "square":
      return 4 * (dims.side ?? 0);
    case "rectangle":
      return 2 * ((dims.width ?? 0) + (dims.height ?? 0));
    case "circle":
      return 2 * Math.PI * (dims.radius ?? 0);
    case "sector": {
      const r = dims.radius ?? 0;
      const angle = dims.angleDegrees ?? 0;
      return 2 * r + (angle / 360) * 2 * Math.PI * r;
    }
    default:
      return null;
  }
}

/** Scales every LINEAR dimension of the shape by a common factor (angle is not a length, left unchanged) — the basis for "what if this were N% bigger/smaller" indicators. */
export function withScale(dims: AreaNumericDims, factor: number): AreaNumericDims {
  const scale = (v: number | undefined) => (v === undefined ? undefined : v * factor);
  return {
    shape: dims.shape,
    side: scale(dims.side),
    width: scale(dims.width),
    height: scale(dims.height),
    base: scale(dims.base),
    radius: scale(dims.radius),
    semiMajorAxis: scale(dims.semiMajorAxis),
    semiMinorAxis: scale(dims.semiMinorAxis),
    base1: scale(dims.base1),
    base2: scale(dims.base2),
    angleDegrees: dims.angleDegrees,
  };
}

export const ALL_SHAPES: AreaShape[] = ["square", "rectangle", "triangle", "circle", "ellipse", "trapezoid", "parallelogram", "sector"];

/** Every shape's own area formula, evaluated with the SAME characteristic length L — lets the 8 shapes be ranked and compared fairly. */
export function areaAtLength(shape: AreaShape, length: number): number {
  switch (shape) {
    case "square":
      return computeAreaFor({ shape, side: length });
    case "rectangle":
      return computeAreaFor({ shape, width: length, height: length * 0.6 });
    case "triangle":
      return computeAreaFor({ shape, base: length, height: length * 0.8 });
    case "parallelogram":
      return computeAreaFor({ shape, base: length, height: length * 0.6 });
    case "circle":
      return computeAreaFor({ shape, radius: length / 2 });
    case "ellipse":
      return computeAreaFor({ shape, semiMajorAxis: length / 2, semiMinorAxis: length / 2.8 });
    case "trapezoid":
      return computeAreaFor({ shape, base1: length, base2: length * 0.6, height: length * 0.7 });
    case "sector":
      return computeAreaFor({ shape, radius: length / 2, angleDegrees: 270 });
  }
}

export function round(n: number, digits = 2): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

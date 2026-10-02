import { SurfaceAreaCalculator, VolumeCalculator, type Solid3DShape } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";
import type { Solid3DDraft } from "./types";

export type SurfaceNumericDims = {
  shape: Solid3DShape;
  side?: number;
  length?: number;
  width?: number;
  height?: number;
  radius?: number;
  baseSide?: number;
};

const surfaceTool = new SurfaceAreaCalculator();
const volumeTool = new VolumeCalculator();

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

export function parseSurfaceDims(draft: Solid3DDraft): SurfaceNumericDims {
  return {
    shape: draft.shape,
    side: toNum(draft.side),
    length: toNum(draft.length),
    width: toNum(draft.width),
    height: toNum(draft.height),
    radius: toNum(draft.radius),
    baseSide: toNum(draft.baseSide),
  };
}

export function computeSurfaceAreaFor(dims: SurfaceNumericDims): number {
  const out = surfaceTool.execute(dims, { locale: "en-US" });
  return out.success && !out.data.error ? out.data.surfaceArea : 0;
}

export function computeVolumeFor(dims: SurfaceNumericDims): number {
  const out = volumeTool.execute(dims, { locale: "en-US" });
  return out.success && !out.data.error ? out.data.volume : 0;
}

/** The slant height the engine itself derives for cone/square-pyramid — exposed here so indicators can show it without re-deriving it independently. */
export function slantHeightOf(dims: SurfaceNumericDims): number | null {
  if (dims.shape === "cone" && dims.radius !== undefined && dims.height !== undefined) {
    return Math.sqrt(dims.radius * dims.radius + dims.height * dims.height);
  }
  if (dims.shape === "square-pyramid" && dims.baseSide !== undefined && dims.height !== undefined) {
    return Math.sqrt(dims.height * dims.height + (dims.baseSide / 2) * (dims.baseSide / 2));
  }
  return null;
}

/** Every shape's own single "characteristic length" — used to compare the 6 solids on equal footing. */
export function characteristicLength(dims: SurfaceNumericDims): number {
  switch (dims.shape) {
    case "cube":
      return dims.side ?? 1;
    case "rectangular-prism":
      return Math.max(dims.length ?? 1, dims.width ?? 1, dims.height ?? 1);
    case "sphere":
      return dims.radius ?? 1;
    case "cylinder":
    case "cone":
      return Math.max(dims.radius ?? 1, dims.height ?? 1);
    case "square-pyramid":
      return Math.max(dims.baseSide ?? 1, dims.height ?? 1);
  }
}

export const ALL_SHAPES: Solid3DShape[] = ["cube", "rectangular-prism", "sphere", "cylinder", "cone", "square-pyramid"];

/** Every shape's own surface-area formula, evaluated with the SAME characteristic length L — lets the 6 solids be ranked and compared fairly. */
export function surfaceAreaAtLength(shape: Solid3DShape, length: number): number {
  switch (shape) {
    case "cube":
      return computeSurfaceAreaFor({ shape, side: length });
    case "rectangular-prism":
      return computeSurfaceAreaFor({ shape, length, width: length * 0.6, height: length * 0.75 });
    case "sphere":
      return computeSurfaceAreaFor({ shape, radius: length / 2 });
    case "cylinder":
      return computeSurfaceAreaFor({ shape, radius: length / 2.5, height: length });
    case "cone":
      return computeSurfaceAreaFor({ shape, radius: length / 2.5, height: length });
    case "square-pyramid":
      return computeSurfaceAreaFor({ shape, baseSide: length, height: length * 0.85 });
  }
}

/** Scales every linear dimension of the shape by a common factor — the basis for "what if this were N% bigger/smaller" indicators. */
export function withScale(dims: SurfaceNumericDims, factor: number): SurfaceNumericDims {
  const scale = (v: number | undefined) => (v === undefined ? undefined : v * factor);
  return {
    shape: dims.shape,
    side: scale(dims.side),
    length: scale(dims.length),
    width: scale(dims.width),
    height: scale(dims.height),
    radius: scale(dims.radius),
    baseSide: scale(dims.baseSide),
  };
}

export function round(n: number, digits = 2): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

import { VolumeCalculator, SurfaceAreaCalculator, type Solid3DShape } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";
import type { Solid3DDraft } from "./types";

export type VolumeNumericDims = {
  shape: Solid3DShape;
  side?: number;
  length?: number;
  width?: number;
  height?: number;
  radius?: number;
  baseSide?: number;
};

const volumeTool = new VolumeCalculator();
const surfaceTool = new SurfaceAreaCalculator();

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

export function parseVolumeDims(draft: Solid3DDraft): VolumeNumericDims {
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

export function computeVolumeFor(dims: VolumeNumericDims): number {
  const out = volumeTool.execute(dims, { locale: "en-US" });
  return out.success && !out.data.error ? out.data.volume : 0;
}

export function computeSurfaceAreaFor(dims: VolumeNumericDims): number {
  const out = surfaceTool.execute(dims, { locale: "en-US" });
  return out.success && !out.data.error ? out.data.surfaceArea : 0;
}

/** Every shape's own single "characteristic length" — used to compare the 6 solids on equal footing. */
export function characteristicLength(dims: VolumeNumericDims): number {
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

/** Every shape's own volume formula, evaluated with the SAME characteristic length L — lets the 6 solids be ranked and compared fairly. */
export function volumeAtLength(shape: Solid3DShape, length: number): number {
  switch (shape) {
    case "cube":
      return computeVolumeFor({ shape, side: length });
    case "rectangular-prism":
      return computeVolumeFor({ shape, length, width: length * 0.6, height: length * 0.75 });
    case "sphere":
      return computeVolumeFor({ shape, radius: length / 2 });
    case "cylinder":
      return computeVolumeFor({ shape, radius: length / 2.5, height: length });
    case "cone":
      return computeVolumeFor({ shape, radius: length / 2.5, height: length });
    case "square-pyramid":
      return computeVolumeFor({ shape, baseSide: length, height: length * 0.85 });
  }
}

/** Scales every linear dimension of the shape by a common factor — the basis for "what if this were N% bigger/smaller" indicators. */
export function withScale(dims: VolumeNumericDims, factor: number): VolumeNumericDims {
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

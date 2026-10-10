import type { Solid3DShape } from "./SurfaceAreaCalculator";

/** Numeric dimensions of a solid, the same fields Volume/SurfaceAreaCalculator accept. */
export type SolidDims = {
  shape: Solid3DShape;
  side?: number;
  length?: number;
  width?: number;
  height?: number;
  radius?: number;
  baseSide?: number;
};

/** One visible face (or face family) of a solid — what the live 3D drawing colors and labels. */
export type SolidFaceKey = "top" | "bottom" | "front" | "back" | "left" | "right" | "lateral" | "base" | "surface";
export type SolidFace = { key: SolidFaceKey; area: number };

/**
 * Every quantity the live table and the 3D drawing of the volume / surface-area tools show:
 * the bounding extents (x = width across, y = height, z = depth), intermediate steps, totals
 * and derived comparisons. Shape-specific fields are null where they do not apply.
 */
export type SolidMetrics = {
  shape: Solid3DShape;
  extents: { x: number; y: number; z: number };
  volume: number;
  surfaceArea: number;
  baseArea: number;
  lateralArea: number;
  faces: SolidFace[];
  slantHeight: number | null;
  lateralEdge: number | null;
  spaceDiagonal: number | null;
  faceDiagonal: number | null;
  circumference: number | null;
  diameter: number | null;
  surfaceToVolume: number;
  boundingBoxVolume: number;
  fillRatio: number;
  equivalentCubeSide: number;
  equivalentSphereRadius: number;
  /** Ψ = π^(1/3)·(6V)^(2/3) / A — 1 for a sphere, smaller for less compact solids. */
  sphericity: number;
};

function ok(...values: Array<number | undefined>): boolean {
  return values.every((v) => typeof v === "number" && Number.isFinite(v) && v > 0);
}

/** Full breakdown of a solid from its dimensions, or null when a required dimension is missing/invalid. */
export function solidMetrics(d: SolidDims): SolidMetrics | null {
  let extents: SolidMetrics["extents"];
  let volume: number;
  let faces: SolidFace[];
  let baseArea: number;
  let lateralArea: number;
  let slantHeight: number | null = null;
  let lateralEdge: number | null = null;
  let spaceDiagonal: number | null = null;
  let faceDiagonal: number | null = null;
  let circumference: number | null = null;
  let diameter: number | null = null;

  switch (d.shape) {
    case "cube": {
      if (!ok(d.side)) return null;
      const s = d.side as number;
      extents = { x: s, y: s, z: s };
      volume = s ** 3;
      baseArea = s * s;
      faces = (["top", "bottom", "front", "back", "left", "right"] as const).map((key) => ({ key, area: s * s }));
      lateralArea = 4 * s * s;
      spaceDiagonal = s * Math.sqrt(3);
      faceDiagonal = s * Math.SQRT2;
      break;
    }
    case "rectangular-prism": {
      if (!ok(d.length, d.width, d.height)) return null;
      const [l, w, h] = [d.length, d.width, d.height] as number[];
      extents = { x: l, y: h, z: w };
      volume = l * w * h;
      baseArea = l * w;
      faces = [
        { key: "top", area: l * w },
        { key: "bottom", area: l * w },
        { key: "front", area: l * h },
        { key: "back", area: l * h },
        { key: "left", area: w * h },
        { key: "right", area: w * h },
      ];
      lateralArea = 2 * h * (l + w);
      spaceDiagonal = Math.sqrt(l * l + w * w + h * h);
      faceDiagonal = Math.sqrt(l * l + w * w);
      break;
    }
    case "sphere": {
      if (!ok(d.radius)) return null;
      const r = d.radius as number;
      extents = { x: 2 * r, y: 2 * r, z: 2 * r };
      volume = (4 / 3) * Math.PI * r ** 3;
      baseArea = Math.PI * r * r;
      lateralArea = 4 * Math.PI * r * r;
      faces = [{ key: "surface", area: lateralArea }];
      circumference = 2 * Math.PI * r;
      diameter = 2 * r;
      break;
    }
    case "cylinder": {
      if (!ok(d.radius, d.height)) return null;
      const [r, h] = [d.radius, d.height] as number[];
      extents = { x: 2 * r, y: h, z: 2 * r };
      volume = Math.PI * r * r * h;
      baseArea = Math.PI * r * r;
      lateralArea = 2 * Math.PI * r * h;
      faces = [
        { key: "top", area: baseArea },
        { key: "bottom", area: baseArea },
        { key: "lateral", area: lateralArea },
      ];
      circumference = 2 * Math.PI * r;
      diameter = 2 * r;
      spaceDiagonal = Math.sqrt(4 * r * r + h * h);
      break;
    }
    case "cone": {
      if (!ok(d.radius, d.height)) return null;
      const [r, h] = [d.radius, d.height] as number[];
      extents = { x: 2 * r, y: h, z: 2 * r };
      volume = (Math.PI * r * r * h) / 3;
      baseArea = Math.PI * r * r;
      slantHeight = Math.sqrt(r * r + h * h);
      lateralArea = Math.PI * r * slantHeight;
      faces = [
        { key: "base", area: baseArea },
        { key: "lateral", area: lateralArea },
      ];
      circumference = 2 * Math.PI * r;
      diameter = 2 * r;
      break;
    }
    case "square-pyramid": {
      if (!ok(d.baseSide, d.height)) return null;
      const [a, h] = [d.baseSide, d.height] as number[];
      extents = { x: a, y: h, z: a };
      volume = (a * a * h) / 3;
      baseArea = a * a;
      slantHeight = Math.sqrt(h * h + (a / 2) ** 2);
      lateralEdge = Math.sqrt(h * h + (a * a) / 2);
      const tri = (a * slantHeight) / 2;
      faces = [
        { key: "base", area: baseArea },
        { key: "front", area: tri },
        { key: "right", area: tri },
        { key: "back", area: tri },
        { key: "left", area: tri },
      ];
      lateralArea = 4 * tri;
      faceDiagonal = a * Math.SQRT2;
      break;
    }
    default:
      return null;
  }

  const surfaceArea = faces.reduce((sum, f) => sum + f.area, 0);
  const boundingBoxVolume = extents.x * extents.y * extents.z;
  return {
    shape: d.shape,
    extents,
    volume,
    surfaceArea,
    baseArea,
    lateralArea,
    faces,
    slantHeight,
    lateralEdge,
    spaceDiagonal,
    faceDiagonal,
    circumference,
    diameter,
    surfaceToVolume: surfaceArea / volume,
    boundingBoxVolume,
    fillRatio: volume / boundingBoxVolume,
    equivalentCubeSide: Math.cbrt(volume),
    equivalentSphereRadius: Math.cbrt((3 * volume) / (4 * Math.PI)),
    sphericity: (Math.cbrt(Math.PI) * Math.pow(6 * volume, 2 / 3)) / surfaceArea,
  };
}

/** Exact unit-conversion factors used by the live tables (1 unit read as the named length unit). */
export const VOLUME_FACTORS = {
  m3ToLiters: 1000,
  m3ToUsGallons: 264.1720524,
  m3ToCubicFeet: 35.31466672,
  cm3ToMilliliters: 1,
  in3ToCubicCm: 16.387064,
} as const;

export const AREA_FACTORS = {
  m2ToSquareFeet: 10.76391042,
  m2ToSquareCm: 10000,
  m2ToSquareInches: 1550.0031,
  m2ToHectares: 0.0001,
  m2ToAcres: 0.000247105381,
  ft2ToSquareMeters: 0.09290304,
} as const;

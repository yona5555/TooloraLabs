export type { Solid3DShape, VolumeCalculatorError as VolumeError, VolumeCalculatorOutput as VolumeResult } from "@tooloralabs/tools";

export type Solid3DDraft = {
  shape: import("@tooloralabs/tools").Solid3DShape;
  side: string;
  length: string;
  width: string;
  height: string;
  radius: string;
  baseSide: string;
};

export function emptySolid3DDraft(): Solid3DDraft {
  return { shape: "cube", side: "", length: "", width: "", height: "", radius: "", baseSide: "" };
}

/** Real, non-degenerate example dimensions for every solid — applied whenever the shape selector
 * changes, so no shape is ever left with empty fields (which would silently zero out every live
 * indicator and the hero until the visitor happens to type something). */
export const SHAPE_DEFAULTS: Record<import("@tooloralabs/tools").Solid3DShape, Partial<Solid3DDraft>> = {
  cube: { side: "3" },
  "rectangular-prism": { length: "5", width: "3", height: "4" },
  sphere: { radius: "3" },
  cylinder: { radius: "2.5", height: "6" },
  cone: { radius: "3", height: "5" },
  "square-pyramid": { baseSide: "4", height: "5" },
};

export type { AreaShape, AreaCalculatorError as AreaError, AreaCalculatorOutput as AreaResult } from "@tooloralabs/tools";

export type AreaDraft = {
  shape: import("@tooloralabs/tools").AreaShape;
  side: string;
  width: string;
  height: string;
  base: string;
  radius: string;
  semiMajorAxis: string;
  semiMinorAxis: string;
  base1: string;
  base2: string;
  angleDegrees: string;
};

export function emptyAreaDraft(): AreaDraft {
  return {
    shape: "square",
    side: "",
    width: "",
    height: "",
    base: "",
    radius: "",
    semiMajorAxis: "",
    semiMinorAxis: "",
    base1: "",
    base2: "",
    angleDegrees: "",
  };
}

/** Real, non-degenerate example dimensions for every shape — applied whenever the shape selector
 * changes, so no shape is ever left with empty fields (which would silently zero out every
 * live indicator and the hero until the visitor happens to type something). */
export const SHAPE_DEFAULTS: Record<import("@tooloralabs/tools").AreaShape, Partial<AreaDraft>> = {
  square: { side: "4" },
  rectangle: { width: "6", height: "3.5" },
  triangle: { base: "6", height: "4" },
  circle: { radius: "3" },
  ellipse: { semiMajorAxis: "5", semiMinorAxis: "3" },
  trapezoid: { base1: "7", base2: "4", height: "3" },
  parallelogram: { base: "6", height: "3.5" },
  sector: { radius: "4", angleDegrees: "120" },
};

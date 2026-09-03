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

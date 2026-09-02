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

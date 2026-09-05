import type { TriangleResult } from "@tooloralabs/tools";
export type { TriangleResult, TriangleError, TrianglePoint } from "@tooloralabs/tools";

export const TRIANGLE_MODES = ["sss", "sas", "asa", "aas"] as const;
export type TriangleMode = (typeof TRIANGLE_MODES)[number];

export const EMPTY_TRIANGLE_RESULT: TriangleResult = {
  valid: false,
  error: null,
  a: 0,
  b: 0,
  c: 0,
  angleA: 0,
  angleB: 0,
  angleC: 0,
  area: 0,
  perimeter: 0,
  vertices: [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ],
};

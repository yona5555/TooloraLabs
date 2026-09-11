import type { TriangleResult } from "@tooloralabs/tools";
export type { TriangleResult, TriangleError, TrianglePoint } from "@tooloralabs/tools";

export const TRIANGLE_MODES = ["sss", "sas", "asa", "aas"] as const;
export type TriangleMode = (typeof TRIANGLE_MODES)[number];

export type TriangleScenario = { key: string; sides: [string, string, string] };

/** SSS-mode examples spanning acute, right, and obtuse triangles. */
export const TRIANGLE_SCENARIOS: TriangleScenario[] = [
  { key: "rightTriangle", sides: ["3", "4", "5"] },
  { key: "acuteTriangle", sides: ["5", "6", "7"] },
  { key: "obtuseTriangle", sides: ["2", "3", "4"] },
  { key: "slimObtuseTriangle", sides: ["2", "2", "3.9"] },
];

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

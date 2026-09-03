export type { GraphingCalculatorError as GraphError, GraphPoint, GraphingCalculatorOutput as GraphResult } from "@tooloralabs/tools";

export type GraphDraft = {
  expression: string;
  xMin: string;
  xMax: string;
};

export function emptyGraphDraft(): GraphDraft {
  return { expression: "x^2", xMin: "-10", xMax: "10" };
}

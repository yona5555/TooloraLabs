export type { GraphingCalculatorError as GraphError, GraphPoint, GraphingCalculatorOutput as GraphResult } from "@tooloralabs/tools";

export type GraphDraft = {
  expression: string;
  xMin: string;
  xMax: string;
};

/** Default study: a cubic with three roots, a maximum, a minimum and an inflection point, so every indicator shows real content on load. */
export function emptyGraphDraft(): GraphDraft {
  return { expression: "x^3 - 3*x", xMin: "-3", xMax: "3" };
}

/** Compact number for tables and labels: up to 4 decimals, no "-0". */
export function fmtNum(n: number, digits = 4): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 1e7 || abs < 1e-4)) return n.toExponential(3);
  const f = 10 ** digits;
  const r = Math.round(n * f) / f;
  return Object.is(r, -0) ? "0" : String(r);
}

/** Quick examples shown under the input card; each loads a real function into the tool. */
export const GRAPH_EXAMPLES: Array<{ id: string; expression: string; xMin: string; xMax: string }> = [
  { id: "cubic", expression: "x^3 - 3*x", xMin: "-3", xMax: "3" },
  { id: "parabola", expression: "x^2 - 4", xMin: "-4", xMax: "4" },
  { id: "sine", expression: "sin(x)", xMin: "-6.28", xMax: "6.28" },
  { id: "damped", expression: "exp(-x/4) * cos(2*x)", xMin: "0", xMax: "10" },
  { id: "sqrt", expression: "sqrt(x)", xMin: "0", xMax: "16" },
  { id: "reciprocal", expression: "1 / x", xMin: "-5", xMax: "5" },
  { id: "gaussian", expression: "exp(-x^2)", xMin: "-3", xMax: "3" },
];

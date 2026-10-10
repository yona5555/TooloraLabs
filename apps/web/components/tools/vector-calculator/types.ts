import { parseLocalizedNumber } from "@tooloralabs/core";
import type { Vec3 } from "@tooloralabs/tools";

export type {
  VectorCalculatorError as VectorError,
  VectorCalculatorOutput as VectorResult,
} from "@tooloralabs/tools";

export type VectorDraft = { ax: string; ay: string; az: string; bx: string; by: string; bz: string };

export const VECTOR_DEFAULTS: VectorDraft = { ax: "3", ay: "4", az: "0", bx: "1", by: "2", bz: "2" };

function num(s: string): number {
  const n = parseLocalizedNumber(s);
  return Number.isFinite(n) ? n : 0;
}

export function parseVectorDraft(d: VectorDraft): { a: Vec3; b: Vec3 } {
  return { a: [num(d.ax), num(d.ay), num(d.az)], b: [num(d.bx), num(d.by), num(d.bz)] };
}

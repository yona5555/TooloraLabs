"use client";
import { useMemo } from "react";
import { formatLocalizedNumber, parseLocalizedNumber } from "@tooloralabs/core";
import { MatrixCalculator, type Mat2, type MatrixCalculatorOutput } from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";
import { resolveDigitStyle } from "@/lib/digit-style";

export const MATRIX_DEFAULTS = { a11: "4", a12: "7", a21: "2", a22: "6", b11: "1", b12: "0", b21: "0", b22: "1" };
export type MatrixDraft = typeof MATRIX_DEFAULTS;
export type MatrixKey = keyof MatrixDraft;

export const { LiveProvider: MatrixLiveProvider, useLiveState: useMatrixLive } = createLiveToolState<MatrixDraft>();

const tool = new MatrixCalculator();

export function parseMatrixDraft(d: MatrixDraft) {
  const n = (s: string) => parseLocalizedNumber(s) || 0;
  const A: Mat2 = [n(d.a11), n(d.a12), n(d.a21), n(d.a22)];
  const B: Mat2 = [n(d.b11), n(d.b12), n(d.b21), n(d.b22)];
  return { A, B };
}

export function computeMatrix(d: MatrixDraft): MatrixCalculatorOutput {
  const { A, B } = parseMatrixDraft(d);
  return tool.execute({ a11: A[0], a12: A[1], a21: A[2], a22: A[3], b11: B[0], b12: B[1], b21: B[2], b22: B[3] }, { locale: "en-US" }).data;
}

export type MatrixModel = {
  A: Mat2;
  B: Mat2;
  result: MatrixCalculatorOutput;
  /** Localized number (digit style follows the inputs). */
  f: (v: number, max?: number) => string;
  /** A 2x2 matrix as "[a, b; c, d]". */
  fm: (m: Mat2, max?: number) => string;
};

export function buildMatrixModel(d: MatrixDraft): MatrixModel {
  const { A, B } = parseMatrixDraft(d);
  const ds = resolveDigitStyle(...Object.values(d));
  const f = (v: number, max = 3) => (Number.isFinite(v) ? formatLocalizedNumber(Math.abs(v) < 1e-12 ? 0 : v, ds, { maximumFractionDigits: max }) : "∞");
  const fm = (m: Mat2, max = 3) => `[${f(m[0], max)}, ${f(m[1], max)}; ${f(m[2], max)}, ${f(m[3], max)}]`;
  return { A, B, result: computeMatrix(d), f, fm };
}

/** The live A/B matrices and the tool's own result, shared by every indicator on the page. */
export function useMatrixModel(): MatrixModel {
  const { dims } = useMatrixLive();
  return useMemo(() => buildMatrixModel(dims), [dims]);
}

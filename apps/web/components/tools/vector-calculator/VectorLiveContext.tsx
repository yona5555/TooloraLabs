"use client";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { analyzeVectors, type Vec3 } from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";
import { resolveDigitStyle } from "@/lib/digit-style";
import { parseVectorDraft, type VectorDraft } from "./types";

export const { LiveProvider: VectorLiveProvider, useLiveState: useVectorLive } = createLiveToolState<VectorDraft>();

/**
 * Every live indicator reads the same analysis of the tool's current inputs: `f` formats for
 * display in the visitor's digit style, `n` is the western short form used inside formulas.
 */
export function useVectorAnalysis() {
  const { dims, setDim } = useVectorLive();
  const na = useTranslations("tools.vector-calculator.live3d")("notApplicable");
  const analysis = useMemo(() => {
    const { a, b } = parseVectorDraft(dims);
    return analyzeVectors(a, b);
  }, [dims]);
  const ds = resolveDigitStyle(dims.ax, dims.ay, dims.az, dims.bx, dims.by, dims.bz);
  const f = (v: number, max = 3) => formatLocalizedNumber(v, ds, { maximumFractionDigits: max });
  const n = (v: number, max = 3) => formatLocalizedNumber(v, "western", { maximumFractionDigits: max });
  const vf = (v: Vec3, max = 3) => `(${v.map((c) => f(c, max)).join(", ")})`;
  const vn = (v: Vec3, max = 3) => `(${v.map((c) => n(c, max)).join(", ")})`;
  /** An angle (or other nullable) value, or "N/A" when a zero vector makes it undefined. */
  const deg = (v: number | null, max = 2) => (v === null ? na : `${f(v, max)}°`);
  const opt = (v: number | null, max = 3) => (v === null ? na : f(v, max));
  return { r: analysis, dims, setDim, f, n, vf, vn, deg, opt, na };
}

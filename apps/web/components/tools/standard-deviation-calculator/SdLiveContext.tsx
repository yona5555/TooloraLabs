"use client";
import { useMemo } from "react";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { analyzeSpread, type SpreadAnalysis } from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";
import { resolveDigitStyle } from "@/lib/digit-style";
import { parseDataSet } from "./types";

export type SdDraft = { rawData: string };

export const { LiveProvider: SdLiveProvider, useLiveState: useSdLive } = createLiveToolState<SdDraft>();

export type SdModel = {
  values: number[];
  a: SpreadAnalysis | null;
  /** Localized number (digit style follows the inputs). */
  f: (v: number, max?: number) => string;
  /** Percent with one decimal, e.g. 0.6827 → "68.3%". */
  pct: (share: number) => string;
};

export function buildSdModel(draft: SdDraft): SdModel {
  const values = parseDataSet(draft.rawData).filter((v) => Number.isFinite(v));
  const ds = resolveDigitStyle(draft.rawData);
  const f = (v: number, max = 3) => formatLocalizedNumber(Math.abs(v) < 1e-12 ? 0 : v, ds, { maximumFractionDigits: max });
  const pct = (share: number) => `${formatLocalizedNumber(share * 100, ds, { maximumFractionDigits: 1 })}%`;
  return { values, a: analyzeSpread(values), f, pct };
}

/** The live data set and its full spread analysis, shared by the Result card and every indicator. */
export function useSdModel(): SdModel {
  const { dims } = useSdLive();
  return useMemo(() => buildSdModel(dims), [dims]);
}

/** Writes a new value at `index` back into the raw input (used by the drag lab). */
export function replaceValue(values: number[], index: number, next: number): string {
  return values.map((v, i) => String(i === index ? Number(next.toFixed(6)) : v)).join(", ");
}

/** Band colour index by |z|: 0 within 1σ, 1 within 2σ, 2 within 3σ, 3 beyond. */
export function bandOf(z: number): 0 | 1 | 2 | 3 {
  const az = Math.abs(z);
  return az <= 1 + 1e-9 ? 0 : az <= 2 + 1e-9 ? 1 : az <= 3 + 1e-9 ? 2 : 3;
}

/** Tailwind fill classes per band (light/dark), shared by the SVG indicators. */
export const BAND_FILL = [
  "fill-emerald-500 dark:fill-emerald-400",
  "fill-amber-500 dark:fill-amber-400",
  "fill-orange-600 dark:fill-orange-400",
  "fill-red-600 dark:fill-red-400",
] as const;

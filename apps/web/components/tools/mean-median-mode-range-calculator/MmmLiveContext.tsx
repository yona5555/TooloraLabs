"use client";
import { useMemo } from "react";
import { formatLocalizedNumber, parseLocalizedNumber } from "@tooloralabs/core";
import { analyzeDataSet, type MmmAnalysis } from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";
import { resolveDigitStyle } from "@/lib/digit-style";
import type { MeanMedianModeRangeDraft } from "./types";

export const { LiveProvider: MmmLiveProvider, useLiveState: useMmmLive } = createLiveToolState<MeanMedianModeRangeDraft>();

export function parseDraftValues(values: string[]): { values: number[]; draftIndex: number[] } {
  const out: number[] = [];
  const draftIndex: number[] = [];
  values.forEach((s, i) => {
    if (!s.trim()) return;
    const n = parseLocalizedNumber(s);
    if (Number.isNaN(n) || !Number.isFinite(n)) return;
    out.push(n);
    draftIndex.push(i);
  });
  return { values: out, draftIndex };
}

export type MmmModel = {
  /** Parsed values in input order, and where each sits in the draft (for drag write-back). */
  values: number[];
  draftIndex: number[];
  a: MmmAnalysis | null;
  /** Localized number (digit style follows the inputs). */
  f: (v: number, max?: number) => string;
};

export function buildMmmModel(draft: MeanMedianModeRangeDraft): MmmModel {
  const { values, draftIndex } = parseDraftValues(draft.values);
  const ds = resolveDigitStyle(...draft.values);
  const f = (v: number, max = 3) => formatLocalizedNumber(Math.abs(v) < 1e-12 ? 0 : v, ds, { maximumFractionDigits: max });
  return { values, draftIndex, a: analyzeDataSet(values), f };
}

/** The live data set and its full analysis, shared by the Result card and every indicator. */
export function useMmmModel(): MmmModel {
  const { dims } = useMmmLive();
  return useMemo(() => buildMmmModel(dims), [dims]);
}

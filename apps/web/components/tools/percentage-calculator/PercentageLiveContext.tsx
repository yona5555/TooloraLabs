"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { percentageFrame, type PercentageFrame } from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";
import { resolveDigitStyle } from "@/lib/digit-style";
import type { PercentageMode } from "./types";

/**
 * Above-the-fold inputs (raw strings) plus the last valid pair of numbers, shared by the Result
 * card, the 3D table and every indicator. `a`/`b` never hold a division-by-zero pair.
 */
export type PercentageLiveDims = { mode: PercentageMode; first: string; second: string; a: number; b: number };
export const { LiveProvider: PercentageLiveProvider, useLiveState: usePercentageLive } = createLiveToolState<PercentageLiveDims>();

export type PercentageFormatters = {
  /** Display number in the visitor's digit style. */
  f: (v: number, max?: number) => string;
  /** Western digits for formulas (always LTR). */
  n: (v: number, max?: number) => string;
  /** Signed percent, e.g. "+25%". */
  sp: (v: number, max?: number) => string;
};

export type PercentageLive = {
  mode: PercentageMode;
  a: number;
  b: number;
  frame: PercentageFrame;
  fmt: PercentageFormatters;
  /** Localized labels of the two inputs in the active mode. */
  labelA: string;
  labelB: string;
};

/** The live (last valid) percentage frame plus number formatters matching the typed digits. */
export function usePercentage(): PercentageLive {
  const { dims } = usePercentageLive();
  const tForm = useTranslations("tools.percentage-calculator.form");
  const ds = resolveDigitStyle(dims.first, dims.second);
  const f = (v: number, max = 4) => formatLocalizedNumber(v, ds, { maximumFractionDigits: max });
  const n = (v: number, max = 3) => formatLocalizedNumber(v, "western", { maximumFractionDigits: max });
  const sp = (v: number, max = 2) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${f(Math.abs(v), max)}%`;
  return {
    mode: dims.mode,
    a: dims.a,
    b: dims.b,
    frame: percentageFrame(dims.mode, dims.a, dims.b),
    fmt: { f, n, sp },
    labelA: tForm(`firstLabel.${dims.mode}`),
    labelB: tForm(`secondLabel.${dims.mode}`),
  };
}

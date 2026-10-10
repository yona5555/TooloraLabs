"use client";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { createLiveToolState } from "@/lib/create-live-tool-state";
import { resolveDigitStyle } from "@/lib/digit-style";
import type { CircleKnownField } from "./types";

/** Above-the-fold input plus the last valid radius, shared by the Result card and every indicator. */
export type CircleLiveDims = { knownField: CircleKnownField; value: string; radius: number };
export const { LiveProvider: CircleLiveProvider, useLiveState: useCircleLive } = createLiveToolState<CircleLiveDims>();

export type CircleFormatters = {
  /** Display number in the visitor's digit style. */
  f: (v: number, max?: number) => string;
  /** Western digits for formulas (always LTR). */
  n: (v: number, max?: number) => string;
};

/** The live radius plus number formatters matching the digits the visitor typed. */
export function useCircleRadius(): { r: number; knownField: CircleKnownField; fmt: CircleFormatters } {
  const { dims } = useCircleLive();
  const ds = resolveDigitStyle(dims.value);
  return {
    r: dims.radius,
    knownField: dims.knownField,
    fmt: {
      f: (v, max = 4) => formatLocalizedNumber(v, ds, { maximumFractionDigits: max }),
      n: (v, max = 3) => formatLocalizedNumber(v, "western", { maximumFractionDigits: max }),
    },
  };
}

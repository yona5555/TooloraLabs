import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

/** Shared number formatters for the crypto indicators, so every card rounds prices the same way. */
export function cryptoFormatters(digitStyle: DigitStyle) {
  const usd = (v: number) =>
    formatLocalizedNumber(v, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: Math.abs(v) < 1 ? 6 : 2 });
  const compactUsd = (v: number) =>
    formatLocalizedNumber(v, digitStyle, { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 });
  const compact = (v: number) => formatLocalizedNumber(v, digitStyle, { notation: "compact", maximumFractionDigits: 2 });
  const num = (v: number, max = 2) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: max });
  const amount = (v: number) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: v !== 0 && Math.abs(v) < 1 ? 8 : 4 });
  const signedPct = (v: number, max = 2) => `${v > 0 ? "+" : ""}${formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: max })}%`;
  return { usd, compactUsd, compact, num, amount, signedPct };
}

export const changeColor = (v: number | null | undefined) =>
  v == null ? "text-zinc-400" : v >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400";

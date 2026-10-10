import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { sciParts } from "@tooloralabs/tools";

/** Number formatters in the visitor's digit style (Western or Arabic-Indic, following what they typed). */
export function rngFormatters(digitStyle: DigitStyle) {
  const num = (v: number, max = 2) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: max });
  const int = (v: number) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: 0 });
  const pct = (fraction: number, max = 1) => {
    const p = fraction * 100;
    // Tiny odds would round to 0%; show them with enough significant digits to stay honest.
    if (p > 0 && p < 0.1) return `${formatLocalizedNumber(p, digitStyle, { maximumSignificantDigits: 2 })}%`;
    return `${formatLocalizedNumber(p, digitStyle, { maximumFractionDigits: max })}%`;
  };
  /** A magnitude given as log10: exact below a trillion, otherwise mantissa × 10^exponent. */
  const big = (log10: number) => {
    if (!Number.isFinite(log10)) return "—";
    if (log10 < 12) return int(Math.round(10 ** log10));
    const { mantissa, exponent } = sciParts(log10);
    return `${num(mantissa, 2)} × 10^${int(exponent)}`;
  };
  /** "1 in X" odds for a probability. */
  const oneIn = (p: number) => (p <= 0 ? "—" : p >= 1 ? int(1) : `1 : ${big(-Math.log10(p))}`);
  return { num, int, pct, big, oneIn, digitStyle };
}

export type RngFormatters = ReturnType<typeof rngFormatters>;

/** A CSS percentage rounded to 3 decimals, so the server HTML and the client render match exactly. */
export const pc = (x: number) => `${Math.round(x * 1000) / 1000}%`;

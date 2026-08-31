export type CurrencyCode = "USD" | "EUR" | "GBP" | "SAR" | "AED" | "EGP" | "JPY" | "INR";

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ["USD", "EUR", "GBP", "SAR", "AED", "EGP", "JPY", "INR"];

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

/**
 * Approximate, fixed conversion rates relative to 1 USD. Intentionally not sourced from a live
 * exchange-rate API — this site's calculators are illustrative financial-planning tools, not
 * trading tools, so a fixed reference rate (refreshed occasionally by hand) is precise enough,
 * and it avoids adding a network dependency to every currency switch. Every non-USD display
 * pairs with an "approximate conversion" note for exactly this reason.
 */
export const USD_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  SAR: 3.75,
  AED: 3.67,
  EGP: 49,
  JPY: 156,
  INR: 83.5,
};

export function isSupportedCurrency(value: string | null | undefined): value is CurrencyCode {
  return !!value && (SUPPORTED_CURRENCIES as string[]).includes(value);
}

/** Converts an amount from one supported currency to another using the fixed reference rates above. */
export function convertAmount(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to || !Number.isFinite(amount)) return amount;
  const usd = amount / USD_EXCHANGE_RATES[from];
  return usd * USD_EXCHANGE_RATES[to];
}

/**
 * Currency conversion rounds to a whole unit — the underlying values are already approximate
 * (fixed reference rates, not live), and keeping input fields as clean whole numbers after a
 * currency switch matches how every field was seeded (whole-number defaults) in the first place.
 */
export function convertAmountString(value: string, from: CurrencyCode, to: CurrencyCode, parse: (raw: string) => number): string {
  const parsed = parse(value);
  if (!Number.isFinite(parsed)) return value;
  return String(Math.round(convertAmount(parsed, from, to)));
}

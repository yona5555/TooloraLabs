export type CurrencyRate = {
  /** ISO 4217 three-letter currency code. */
  code: string;
  name: string;
  /** Units of this currency per 1 USD. */
  ratePerUsd: number;
};

/** Converts an amount of one fiat currency into another, using USD as the common pivot (both rates are units-per-USD). */
export function convertCurrencyAmount(amount: number, fromRatePerUsd: number, toRatePerUsd: number): number {
  if (
    !Number.isFinite(amount) ||
    !Number.isFinite(fromRatePerUsd) ||
    !Number.isFinite(toRatePerUsd) ||
    fromRatePerUsd <= 0
  ) {
    return 0;
  }
  return (amount / fromRatePerUsd) * toRatePerUsd;
}

export function filterCurrenciesByQuery(currencies: CurrencyRate[], query: string): CurrencyRate[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return currencies;
  return currencies.filter(
    (currency) => currency.name.toLowerCase().includes(normalized) || currency.code.toLowerCase().includes(normalized)
  );
}

export function findCurrencyByCode(currencies: CurrencyRate[], code: string): CurrencyRate | undefined {
  return currencies.find((currency) => currency.code === code);
}

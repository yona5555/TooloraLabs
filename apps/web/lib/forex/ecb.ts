/** Currencies the ECB publishes a daily reference rate for (plus EUR itself). */
export const ECB_CURRENCIES = [
  "AUD", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "EUR", "GBP", "HKD", "HUF", "IDR", "ILS", "INR", "ISK",
  "JPY", "KRW", "MXN", "MYR", "NOK", "NZD", "PHP", "PLN", "RON", "SEK", "SGD", "THB", "TRY", "USD", "ZAR",
] as const;

const ECB_SET = new Set<string>(ECB_CURRENCIES);
export const hasEcbHistory = (code: string) => ECB_SET.has(code);

/**
 * The key of a paid market-data API, or `null` when it is not configured (CI, preview builds, local
 * checkouts without .env.local). Not configured is a normal state, not a failure: the caller makes no
 * request, logs nothing and returns `null`, and its page renders the same "data unavailable" state it
 * shows for a failed request. Production sets every key, so this branch never runs there.
 */
export function apiKey(name: "METALPRICE_API_KEY" | "OILPRICE_API_KEY" | "EXCHANGE_RATE_API_KEY"): string | null {
  return process.env[name] || null;
}

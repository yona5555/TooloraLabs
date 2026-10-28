/** Every paid market-data API key. A Vercel Production build without any of them fails (see below). */
export const MARKET_API_KEYS = ["METALPRICE_API_KEY", "OILPRICE_API_KEY", "EXCHANGE_RATE_API_KEY"] as const;

export type MarketApiKey = (typeof MARKET_API_KEYS)[number];

/**
 * The key of a paid market-data API, or `null` when it is not configured (CI, preview builds, local
 * checkouts without .env.local). Not configured is a normal state, not a failure: the caller makes no
 * request, logs nothing and returns `null`, and its page renders the same "data unavailable" state it
 * shows for a failed request. Production cannot reach this branch: its build fails first.
 */
export function apiKey(name: MarketApiKey): string | null {
  return process.env[name] || null;
}

/**
 * Build-time guard, called once from next.config.ts during `next build`. On Vercel Production
 * (VERCEL_ENV=production) a missing key would silently ship "data unavailable" pages, so the build stops
 * and names each missing variable (never a value). Every other environment keeps the no-key path above.
 */
export function assertMarketApiKeysForProduction(env: Record<string, string | undefined>): void {
  if (env.VERCEL_ENV !== "production") return;
  const missing = MARKET_API_KEYS.filter((name) => !env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Production build stopped: missing ${missing.join(", ")} in the Vercel Production environment. ` +
        "Set it in Vercel → Project → Settings → Environment Variables (Production) and redeploy.",
    );
  }
}

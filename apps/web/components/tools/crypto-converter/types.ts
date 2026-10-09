import type { CryptoCoin, CryptoGlobalStats } from "@tooloralabs/tools";

/** A display currency: ISO code, CoinGecko's English name, and units per 1 USD. */
export type FiatRate = { code: string; name: string; perUsd: number };

export const USD_RATE: FiatRate = { code: "USD", name: "US Dollar", perUsd: 1 };

export type { CryptoCoin, CryptoGlobalStats };

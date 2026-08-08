export type CryptoCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  priceChangePercentage24h: number | null;
  marketCap: number;
  marketCapRank: number | null;
};

export type CryptoGlobalStats = {
  totalMarketCapUsd: number;
  btcDominancePercentage: number;
  activeCryptocurrencies: number;
};

export type FiatRates = {
  usd: 1;
  sar: number;
};

/** Converts an amount of one crypto asset into another, using each coin's USD price as the common pivot. */
export function convertCryptoAmount(amount: number, fromPriceUsd: number, toPriceUsd: number): number {
  if (!Number.isFinite(amount) || !Number.isFinite(fromPriceUsd) || !Number.isFinite(toPriceUsd) || toPriceUsd <= 0) {
    return 0;
  }
  return (amount * fromPriceUsd) / toPriceUsd;
}

/** Converts a USD-denominated value into another fiat currency given that currency's units-per-USD rate. */
export function convertUsdToFiat(valueUsd: number, fiatPerUsd: number): number {
  if (!Number.isFinite(valueUsd) || !Number.isFinite(fiatPerUsd)) return 0;
  return valueUsd * fiatPerUsd;
}

export function filterCoinsByQuery(coins: CryptoCoin[], query: string): CryptoCoin[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return coins;
  return coins.filter(
    (coin) => coin.name.toLowerCase().includes(normalized) || coin.symbol.toLowerCase().includes(normalized)
  );
}

export type InvestmentReturn = {
  coinsPurchased: number;
  amountInvested: number;
  valueNow: number;
  profitLoss: number;
  profitLossPercentage: number;
  isProfit: boolean;
};

/**
 * What an `amountInvested` (in USD) would be worth today, had it bought a
 * crypto asset at `priceThenUsd` and been held until now at `priceNowUsd`.
 */
export function calculateInvestmentReturn(
  amountInvested: number,
  priceThenUsd: number,
  priceNowUsd: number
): InvestmentReturn | null {
  if (
    !Number.isFinite(amountInvested) ||
    amountInvested <= 0 ||
    !Number.isFinite(priceThenUsd) ||
    priceThenUsd <= 0 ||
    !Number.isFinite(priceNowUsd) ||
    priceNowUsd < 0
  ) {
    return null;
  }

  const coinsPurchased = amountInvested / priceThenUsd;
  const valueNow = coinsPurchased * priceNowUsd;
  const profitLoss = valueNow - amountInvested;
  const profitLossPercentage = (profitLoss / amountInvested) * 100;

  return {
    coinsPurchased,
    amountInvested,
    valueNow,
    profitLoss,
    profitLossPercentage,
    isProfit: profitLoss >= 0,
  };
}

/** CoinGecko's public API caps historical data at 365 days back for non-paid usage. */
export const MAX_HISTORY_DAYS = 365;

function utcDayStart(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * Compares calendar days (UTC), not exact timestamps — `referenceDate` is
 * usually "now", which is always later in the day than a `date` built from
 * a bare YYYY-MM-DD string (midnight UTC). Diffing raw timestamps would
 * make "exactly 365 days ago" fail by a few fractional hours almost every
 * time, rejecting the very boundary date the UI itself offers as the
 * earliest selectable one.
 */
export function isWithinSupportedHistory(date: Date, referenceDate: Date = new Date()): boolean {
  const diffDays = Math.round((utcDayStart(referenceDate) - utcDayStart(date)) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= MAX_HISTORY_DAYS;
}

export function findCoinById(coins: CryptoCoin[], id: string): CryptoCoin | undefined {
  return coins.find((coin) => coin.id === id);
}

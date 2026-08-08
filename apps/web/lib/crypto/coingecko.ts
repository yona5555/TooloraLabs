import type { CryptoCoin, CryptoGlobalStats } from "@tooloralabs/tools";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const PAGE_REVALIDATE_SECONDS = 3600;
const ON_DEMAND_REVALIDATE_SECONDS = 60;

type CoinGeckoMarketCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  market_cap: number;
  market_cap_rank: number | null;
};

function mapMarketCoin(raw: CoinGeckoMarketCoin): CryptoCoin {
  return {
    id: raw.id,
    symbol: raw.symbol,
    name: raw.name,
    image: raw.image,
    currentPrice: raw.current_price,
    priceChangePercentage24h: raw.price_change_percentage_24h,
    marketCap: raw.market_cap,
    marketCapRank: raw.market_cap_rank,
  };
}

/** Top N coins by market cap — the page's main list, refreshed hourly via ISR. */
export async function getTopCoins(limit = 100): Promise<CryptoCoin[]> {
  const url = `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`;
  const res = await fetch(url, { next: { revalidate: PAGE_REVALIDATE_SECONDS } });
  if (!res.ok) {
    throw new Error(`CoinGecko markets request failed: ${res.status}`);
  }
  const data = (await res.json()) as CoinGeckoMarketCoin[];
  return data.map(mapMarketCoin);
}

/** Full market data for specific coin ids — used once a visitor picks a coin outside the top list. */
export async function getCoinsByIds(ids: string[]): Promise<CryptoCoin[]> {
  if (ids.length === 0) return [];
  const url = `${COINGECKO_BASE}/coins/markets?vs_currency=usd&ids=${ids.join(",")}&price_change_percentage=24h`;
  const res = await fetch(url, { next: { revalidate: ON_DEMAND_REVALIDATE_SECONDS } });
  if (!res.ok) {
    throw new Error(`CoinGecko markets-by-id request failed: ${res.status}`);
  }
  const data = (await res.json()) as CoinGeckoMarketCoin[];
  return data.map(mapMarketCoin);
}

export type CoinSearchResult = {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  marketCapRank: number | null;
};

export async function searchCoins(query: string): Promise<CoinSearchResult[]> {
  if (!query.trim()) return [];
  const url = `${COINGECKO_BASE}/search?query=${encodeURIComponent(query.trim())}`;
  const res = await fetch(url, { next: { revalidate: ON_DEMAND_REVALIDATE_SECONDS } });
  if (!res.ok) {
    throw new Error(`CoinGecko search request failed: ${res.status}`);
  }
  const json = (await res.json()) as {
    coins: { id: string; name: string; symbol: string; thumb: string; market_cap_rank: number | null }[];
  };
  return json.coins.slice(0, 10).map((coin) => ({
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol,
    thumb: coin.thumb,
    marketCapRank: coin.market_cap_rank,
  }));
}

export async function getGlobalStats(): Promise<CryptoGlobalStats | null> {
  const res = await fetch(`${COINGECKO_BASE}/global`, { next: { revalidate: PAGE_REVALIDATE_SECONDS } });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    data: {
      total_market_cap?: Record<string, number>;
      market_cap_percentage?: Record<string, number>;
      active_cryptocurrencies?: number;
    };
  };
  const data = json.data;
  return {
    totalMarketCapUsd: data.total_market_cap?.usd ?? 0,
    btcDominancePercentage: data.market_cap_percentage?.btc ?? 0,
    activeCryptocurrencies: data.active_cryptocurrencies ?? 0,
  };
}

/** SAR units per 1 USD, derived from BTC's value in each currency via CoinGecko's exchange-rates endpoint. */
export async function getUsdToSarRate(): Promise<number | null> {
  const res = await fetch(`${COINGECKO_BASE}/exchange_rates`, { next: { revalidate: PAGE_REVALIDATE_SECONDS } });
  if (!res.ok) return null;
  const json = (await res.json()) as { rates: Record<string, { value: number }> };
  const usd = json.rates.usd?.value;
  const sar = json.rates.sar?.value;
  if (!usd || !sar) return null;
  return sar / usd;
}

export type PricePoint = { timestamp: number; price: number };

export async function getCoinMarketChart(coinId: string, days: number): Promise<PricePoint[]> {
  const url = `${COINGECKO_BASE}/coins/${encodeURIComponent(coinId)}/market_chart?vs_currency=usd&days=${days}`;
  const res = await fetch(url, { next: { revalidate: PAGE_REVALIDATE_SECONDS } });
  if (!res.ok) {
    throw new Error(`CoinGecko market_chart request failed: ${res.status}`);
  }
  const json = (await res.json()) as { prices: [number, number][] };
  return json.prices.map(([timestamp, price]) => ({ timestamp, price }));
}

function toCoinGeckoDate(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

export async function getCoinPriceOnDate(coinId: string, date: Date): Promise<number | null> {
  const url = `${COINGECKO_BASE}/coins/${encodeURIComponent(coinId)}/history?date=${toCoinGeckoDate(date)}&localization=false`;
  const res = await fetch(url, { next: { revalidate: PAGE_REVALIDATE_SECONDS } });
  if (!res.ok) return null;
  const json = (await res.json()) as { market_data?: { current_price?: Record<string, number> } };
  return json.market_data?.current_price?.usd ?? null;
}

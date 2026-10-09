/**
 * Live Bitcoin network data from mempool.space and the Crypto Fear & Greed Index from
 * alternative.me — both free and keyless. Each fetch is cached server-side so every visitor
 * shares one upstream request per window.
 */
const MEMPOOL_BASE = "https://mempool.space/api";
const FNG_URL = "https://api.alternative.me/fng/?limit=31";

async function getJson<T>(url: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export type LiveBlock = {
  height: number;
  hash: string;
  previousHash: string;
  timestamp: number;
  txCount: number;
  size: number;
  weight: number;
  totalFees: number;
  medianFee: number;
  feeRange: number[];
  reward: number;
  pool: string;
};

type RawBlock = {
  id: string;
  height: number;
  timestamp: number;
  tx_count: number;
  size: number;
  weight: number;
  previousblockhash: string;
  extras?: { totalFees?: number; medianFee?: number; feeRange?: number[]; reward?: number; pool?: { name?: string } };
};

export async function getLatestBlocks(): Promise<LiveBlock[] | null> {
  const raw = await getJson<RawBlock[]>(`${MEMPOOL_BASE}/v1/blocks`, 30);
  if (!raw?.length) return null;
  return raw.slice(0, 8).map((b) => ({
    height: b.height,
    hash: b.id,
    previousHash: b.previousblockhash,
    timestamp: b.timestamp,
    txCount: b.tx_count,
    size: b.size,
    weight: b.weight,
    totalFees: b.extras?.totalFees ?? 0,
    medianFee: b.extras?.medianFee ?? 0,
    feeRange: b.extras?.feeRange ?? [],
    reward: b.extras?.reward ?? 0,
    pool: b.extras?.pool?.name ?? "",
  }));
}

export type FeeSnapshot = {
  fastest: number;
  halfHour: number;
  hour: number;
  economy: number;
  minimum: number;
  /** Fee-rate percentiles (sat/vB) of the next projected block. */
  nextBlockRange: number[];
};

export async function getFees(): Promise<FeeSnapshot | null> {
  const [rec, projected] = await Promise.all([
    getJson<{ fastestFee: number; halfHourFee: number; hourFee: number; economyFee: number; minimumFee: number }>(
      `${MEMPOOL_BASE}/v1/fees/recommended`,
      30
    ),
    getJson<{ feeRange: number[] }[]>(`${MEMPOOL_BASE}/v1/fees/mempool-blocks`, 30),
  ]);
  if (!rec) return null;
  return {
    fastest: rec.fastestFee,
    halfHour: rec.halfHourFee,
    hour: rec.hourFee,
    economy: rec.economyFee,
    minimum: rec.minimumFee,
    nextBlockRange: projected?.[0]?.feeRange ?? [],
  };
}

export type ChainTip = { height: number; timestamp: number; avgBlockSeconds: number };

export async function getChainTip(): Promise<ChainTip | null> {
  const [blocks, diff] = await Promise.all([
    getJson<RawBlock[]>(`${MEMPOOL_BASE}/v1/blocks`, 30),
    getJson<{ timeAvg: number }>(`${MEMPOOL_BASE}/v1/difficulty-adjustment`, 300),
  ]);
  if (!blocks?.length) return null;
  return { height: blocks[0].height, timestamp: blocks[0].timestamp, avgBlockSeconds: diff?.timeAvg ? diff.timeAvg / 1000 : 600 };
}

export type FearGreedPoint = { value: number; timestamp: number };

export async function getFearGreed(): Promise<FearGreedPoint[] | null> {
  const json = await getJson<{ data?: { value: string; timestamp: string }[] }>(FNG_URL, 3600);
  if (!json?.data?.length) return null;
  // Newest first from the API; return oldest → newest for charting.
  return json.data.map((d) => ({ value: Number(d.value), timestamp: Number(d.timestamp) })).reverse();
}

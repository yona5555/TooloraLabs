/** Bitcoin network math: halving schedule, fee costs, block metrics and Fear & Greed zones. */

export const HALVING_INTERVAL = 210_000;
export const INITIAL_BLOCK_REWARD_BTC = 50;
/** Consensus cap on block weight (BIP 141); a block's fill is its weight against this. */
export const MAX_BLOCK_WEIGHT = 4_000_000;
/** Target spacing between blocks, used when no measured average is available. */
export const TARGET_BLOCK_SECONDS = 600;
/** A typical 1-input / 2-output native SegWit (P2WPKH) payment is ~141 vbytes. */
export const TYPICAL_TX_VBYTES = 141;

/** Block subsidy in BTC at a height: 50 BTC halved once every 210,000 blocks. */
export function blockRewardAtHeight(height: number): number {
  if (!Number.isFinite(height) || height < 0) return 0;
  const era = Math.floor(height / HALVING_INTERVAL);
  return era >= 64 ? 0 : INITIAL_BLOCK_REWARD_BTC / 2 ** era;
}

/** First block height of the next halving after `height`. */
export function nextHalvingHeight(height: number): number {
  return (Math.floor(Math.max(0, height) / HALVING_INTERVAL) + 1) * HALVING_INTERVAL;
}

export type HalvingCountdown = {
  nextHeight: number;
  blocksRemaining: number;
  secondsRemaining: number;
  estimatedTime: number;
  currentReward: number;
  nextReward: number;
  /** Share of the current era already mined, 0–100. */
  eraProgress: number;
};

/**
 * Countdown to the next halving from the chain tip. `avgBlockSeconds` should be the network's
 * measured recent average (it drifts from 600 s between difficulty adjustments).
 */
export function halvingCountdown(
  tipHeight: number,
  tipTimeSeconds: number,
  avgBlockSeconds: number = TARGET_BLOCK_SECONDS
): HalvingCountdown {
  const nextHeight = nextHalvingHeight(tipHeight);
  const blocksRemaining = nextHeight - tipHeight;
  const spacing = avgBlockSeconds > 0 ? avgBlockSeconds : TARGET_BLOCK_SECONDS;
  const secondsRemaining = blocksRemaining * spacing;
  return {
    nextHeight,
    blocksRemaining,
    secondsRemaining,
    estimatedTime: tipTimeSeconds + secondsRemaining,
    currentReward: blockRewardAtHeight(tipHeight),
    nextReward: blockRewardAtHeight(nextHeight),
    eraProgress: ((HALVING_INTERVAL - blocksRemaining) / HALVING_INTERVAL) * 100,
  };
}

/** Fee in BTC and USD for a transaction of `vbytes` at `satPerVbyte`. */
export function transactionFee(satPerVbyte: number, vbytes: number, btcPriceUsd: number): { sats: number; btc: number; usd: number } {
  const sats = Math.max(0, satPerVbyte) * Math.max(0, vbytes);
  const btc = sats / 1e8;
  return { sats, btc, usd: btc * Math.max(0, btcPriceUsd) };
}

/** How full a block is, 0–100, from its weight units. */
export function blockFillPercent(weight: number): number {
  if (!Number.isFinite(weight) || weight <= 0) return 0;
  return Math.min(100, (weight / MAX_BLOCK_WEIGHT) * 100);
}

/** Average fee per transaction in sats, excluding the coinbase transaction that pays no fee. */
export function averageFeePerTx(totalFeesSats: number, txCount: number): number {
  const payers = txCount - 1;
  return payers > 0 ? totalFeesSats / payers : 0;
}

export type FearGreedZone = "extremeFear" | "fear" | "neutral" | "greed" | "extremeGreed";

/** Alternative.me's published bands: 0–24, 25–44, 45–55, 56–75, 76–100. */
export const FEAR_GREED_ZONES: { zone: FearGreedZone; min: number; max: number }[] = [
  { zone: "extremeFear", min: 0, max: 24 },
  { zone: "fear", min: 25, max: 44 },
  { zone: "neutral", min: 45, max: 55 },
  { zone: "greed", min: 56, max: 75 },
  { zone: "extremeGreed", min: 76, max: 100 },
];

export function fearGreedZone(value: number): FearGreedZone {
  const v = Math.round(Math.min(100, Math.max(0, value)));
  return (FEAR_GREED_ZONES.find((z) => v >= z.min && v <= z.max) ?? FEAR_GREED_ZONES[2]).zone;
}

/** Arithmetic mean, or 0 for an empty list. */
export function mean(values: number[]): number {
  return values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
}

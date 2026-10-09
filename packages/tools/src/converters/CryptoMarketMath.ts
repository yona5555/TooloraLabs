/** One OHLC candle. `time` is the bucket start in Unix seconds (UTC); `volume` is in base-coin units. */
export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

/** Candle intervals the chart offers; minutes ("m") and months ("M") are kept distinct on purpose. */
export type CandleTimeframe = "10m" | "15m" | "30m" | "1h" | "4h" | "6h" | "1D" | "1M" | "1Y";

export const CANDLE_TIMEFRAMES: CandleTimeframe[] = ["10m", "15m", "30m", "1h", "4h", "6h", "1D", "1M", "1Y"];

export function isCandleTimeframe(value: string): value is CandleTimeframe {
  return (CANDLE_TIMEFRAMES as string[]).includes(value);
}

function mergeGroup(group: Candle[], time: number): Candle {
  let high = -Infinity;
  let low = Infinity;
  let volume = 0;
  for (const c of group) {
    if (c.high > high) high = c.high;
    if (c.low < low) low = c.low;
    volume += c.volume;
  }
  return { time, open: group[0].open, high, low, close: group[group.length - 1].close, volume };
}

/**
 * Merges candles into fixed-length buckets of `bucketSeconds` (e.g. two 5-minute candles into
 * one 10-minute candle). Buckets are aligned to the Unix epoch so a 10-minute candle always
 * starts on :00, :10, :20…, and input order does not matter.
 */
export function aggregateCandles(candles: Candle[], bucketSeconds: number): Candle[] {
  if (bucketSeconds <= 0) return [];
  const sorted = [...candles].sort((a, b) => a.time - b.time);
  const out: Candle[] = [];
  let group: Candle[] = [];
  let bucket = NaN;
  for (const c of sorted) {
    const b = Math.floor(c.time / bucketSeconds) * bucketSeconds;
    if (b !== bucket && group.length > 0) {
      out.push(mergeGroup(group, bucket));
      group = [];
    }
    bucket = b;
    group.push(c);
  }
  if (group.length > 0) out.push(mergeGroup(group, bucket));
  return out;
}

/** Merges daily candles into calendar-month or calendar-year candles (UTC), timed at the period's first day. */
export function aggregateCandlesByCalendar(candles: Candle[], unit: "month" | "year"): Candle[] {
  const sorted = [...candles].sort((a, b) => a.time - b.time);
  const out: Candle[] = [];
  let group: Candle[] = [];
  let key = "";
  let keyTime = 0;
  for (const c of sorted) {
    const d = new Date(c.time * 1000);
    const y = d.getUTCFullYear();
    const m = unit === "month" ? d.getUTCMonth() : 0;
    const k = `${y}-${m}`;
    if (k !== key && group.length > 0) {
      out.push(mergeGroup(group, keyTime));
      group = [];
    }
    key = k;
    keyTime = Date.UTC(y, m, 1) / 1000;
    group.push(c);
  }
  if (group.length > 0) out.push(mergeGroup(group, keyTime));
  return out;
}

/** Simple moving average of closes; entries before the first full window are `null`. */
export function movingAverage(candles: Candle[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close;
    if (i >= period) sum -= candles[i - period].close;
    out.push(period > 0 && i >= period - 1 ? sum / period : null);
  }
  return out;
}

/** Percentage change from a candle's open to its close. */
export function candleChangePercent(candle: Candle): number {
  if (candle.open === 0) return 0;
  return ((candle.close - candle.open) / candle.open) * 100;
}

export type PeriodExtremes = { high: number; highTime: number; low: number; lowTime: number };

/** Highest high and lowest low across the candles, with the time each occurred. */
export function periodExtremes(candles: Candle[]): PeriodExtremes | null {
  if (candles.length === 0) return null;
  let hi = candles[0];
  let lo = candles[0];
  for (const c of candles) {
    if (c.high > hi.high) hi = c;
    if (c.low < lo.low) lo = c;
  }
  return { high: hi.high, highTime: hi.time, low: lo.low, lowTime: lo.time };
}

/**
 * Clamps exchange bad prints: a single candle's wick that strays below `minFraction` of its
 * body (or above 1 / `minFraction` of it) is a known artifact of thin order books (e.g. a
 * $0.06 BTC-USD print in Coinbase's daily history) and would squash every other candle on a
 * shared price axis. Apply to the base candles before aggregating.
 */
export function clampBadWicks(candles: Candle[], minFraction = 0.5): Candle[] {
  return candles.map((c) => {
    const bodyLow = Math.min(c.open, c.close);
    const bodyHigh = Math.max(c.open, c.close);
    const low = c.low < bodyLow * minFraction ? bodyLow : c.low;
    const high = c.high > bodyHigh / minFraction ? bodyHigh : c.high;
    return low === c.low && high === c.high ? c : { ...c, low, high };
  });
}

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

export type Volatility = {
  /** Standard deviation of daily log returns, in percent. */
  dailyPercent: number;
  /** Daily figure scaled by √365 (crypto trades every day of the year), in percent. */
  annualizedPercent: number;
  returns: number;
};

/** Realized volatility over the last `window` daily returns (needs `window + 1` daily closes). */
export function realizedVolatility(dailyCandles: Candle[], window = 30): Volatility | null {
  const closes = dailyCandles.slice(-(window + 1)).map((c) => c.close);
  if (closes.length < 3 || closes.some((c) => !(c > 0))) return null;
  const returns = closes.slice(1).map((c, i) => Math.log(c / closes[i]));
  const avg = returns.reduce((s, r) => s + r, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + (r - avg) ** 2, 0) / (returns.length - 1);
  const daily = Math.sqrt(variance) * 100;
  return { dailyPercent: daily, annualizedPercent: daily * Math.sqrt(365), returns: returns.length };
}

export type VolatilityZone = "low" | "medium" | "high";

/** Crypto-scale bands for annualized volatility: under 40% low, 40–80% medium, above 80% high. */
export const VOLATILITY_ZONE_LIMITS = { low: 40, medium: 80 } as const;

export function volatilityZone(annualizedPercent: number): VolatilityZone {
  if (annualizedPercent < VOLATILITY_ZONE_LIMITS.low) return "low";
  if (annualizedPercent < VOLATILITY_ZONE_LIMITS.medium) return "medium";
  return "high";
}

export type SensitivityPoint = { shiftPercent: number; fromPrice: number; converted: number };

/** Converted amount if the source coin's price moved by −pct / 0 / +pct, the target price held. */
export function conversionSensitivity(amount: number, fromPriceUsd: number, toPriceUsd: number, pct = 10): SensitivityPoint[] {
  return [-pct, 0, pct].map((shiftPercent) => {
    const fromPrice = fromPriceUsd * (1 + shiftPercent / 100);
    const ok = Number.isFinite(amount) && toPriceUsd > 0;
    return { shiftPercent, fromPrice, converted: ok ? (amount * fromPrice) / toPriceUsd : 0 };
  });
}

export type SupplyBreakdown = {
  /** The bar's 100% reference: max supply when capped, otherwise total supply. */
  basis: "max" | "total";
  circulatingPercent: number;
  /** Issued but not circulating (locked, treasury, vesting). */
  lockedPercent: number;
  /** Not yet issued (only when a max supply exists). */
  unissuedPercent: number;
};

export function supplyBreakdown(circulating: number | null | undefined, total: number | null | undefined, max: number | null | undefined): SupplyBreakdown | null {
  const circ = circulating ?? 0;
  const tot = Math.max(total ?? 0, circ);
  const cap = max && max > 0 ? Math.max(max, tot) : null;
  const basisValue = cap ?? tot;
  if (!(basisValue > 0) || !(circ > 0)) return null;
  const circulatingPercent = (circ / basisValue) * 100;
  const lockedPercent = ((tot - circ) / basisValue) * 100;
  return {
    basis: cap ? "max" : "total",
    circulatingPercent,
    lockedPercent,
    unissuedPercent: cap ? Math.max(0, 100 - circulatingPercent - lockedPercent) : 0,
  };
}

/** Percentage change from a reference price to the current one (e.g. "−24% from ATH"). */
export function percentFrom(reference: number, current: number): number {
  return reference > 0 ? ((current - reference) / reference) * 100 : 0;
}

/** Position of `value` between `min` and `max` on a log10 scale, 0–1 (clamped). */
export function logScalePosition(value: number, min: number, max: number): number {
  if (!(value > 0) || !(min > 0) || !(max > min)) return 0;
  const p = (Math.log10(value) - Math.log10(min)) / (Math.log10(max) - Math.log10(min));
  return Math.min(1, Math.max(0, p));
}

/** Biggest 24h gainers and losers among coins that report a change. */
export function topMovers<T extends { priceChangePercentage24h: number | null }>(coins: T[], count = 5): { gainers: T[]; losers: T[] } {
  const ranked = coins.filter((c) => c.priceChangePercentage24h !== null && Number.isFinite(c.priceChangePercentage24h));
  const sorted = [...ranked].sort((a, b) => (b.priceChangePercentage24h as number) - (a.priceChangePercentage24h as number));
  return {
    gainers: sorted.slice(0, count).filter((c) => (c.priceChangePercentage24h as number) > 0),
    losers: sorted.slice(-count).reverse().filter((c) => (c.priceChangePercentage24h as number) < 0),
  };
}

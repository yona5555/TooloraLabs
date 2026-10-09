import type { Candle, Volatility, VolatilityZone } from "./CryptoMarketMath";

/** One daily reference rate (e.g. an ECB fixing): `date` is YYYY-MM-DD, `rate` is units of target per 1 base. */
export type DailyRate = { date: string; rate: number };

/** Daily rates of many currencies against USD on shared dates: `rates[code][i]` is units of `code` per 1 USD on `dates[i]`. */
export type UsdRateTable = { dates: string[]; rates: Record<string, number[]> };

const DAY_SECONDS = 86400;

const toUnix = (date: string) => Date.parse(`${date}T00:00:00Z`) / 1000;

/** Start of the bucket a date falls in: the Monday of its ISO week, or the 1st of its month (UTC). */
function bucketStart(date: string, unit: "week" | "month"): number {
  const t = toUnix(date);
  if (unit === "month") return Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, 1) / 1000;
  const weekday = (new Date(t * 1000).getUTCDay() + 6) % 7; // Monday = 0
  return t - weekday * DAY_SECONDS;
}

/**
 * Weekly or monthly OHLC candles built only from daily reference rates: open is the bucket's first
 * fixing, close its last, high/low the extremes among its fixings. Nothing is invented — intraday
 * swings between fixings are simply not in the data, so wicks are honest but narrower than an
 * exchange's. Volume is 0 (reference rates have none).
 */
export function dailyToCandles(points: DailyRate[], unit: "week" | "month"): Candle[] {
  const out: Candle[] = [];
  for (const p of points) {
    if (!(p.rate > 0)) continue;
    const time = bucketStart(p.date, unit);
    const last = out[out.length - 1];
    if (last && last.time === time) {
      last.high = Math.max(last.high, p.rate);
      last.low = Math.min(last.low, p.rate);
      last.close = p.rate;
    } else {
      out.push({ time, open: p.rate, high: p.rate, low: p.rate, close: p.rate, volume: 0 });
    }
  }
  return out;
}

/** Daily fixings as flat "candles" (open = high = low = close) for a line chart. */
export function dailyToLine(points: DailyRate[]): Candle[] {
  return points.filter((p) => p.rate > 0).map((p) => ({ time: toUnix(p.date), open: p.rate, high: p.rate, low: p.rate, close: p.rate, volume: 0 }));
}

/** Units of `target` per 1 `base` on every date, crossed through USD (USD itself is 1 on every date). */
export function crossSeries(table: UsdRateTable, base: string, target: string): DailyRate[] {
  const series = (code: string) => (code === "USD" ? table.dates.map(() => 1) : table.rates[code]);
  const b = series(base);
  const t = series(target);
  if (!b || !t) return [];
  return table.dates.flatMap((date, i) => (b[i] > 0 && t[i] > 0 ? [{ date, rate: t[i] / b[i] }] : []));
}

/**
 * Annualized realized volatility of a daily rate series over the last `window` returns, using
 * √252 (forex fixings exist on business days only, unlike crypto's 365).
 */
export function fxVolatility(rates: number[], window = 30): Volatility | null {
  const closes = rates.slice(-(window + 1));
  if (closes.length < 3 || closes.some((c) => !(c > 0))) return null;
  const returns = closes.slice(1).map((c, i) => Math.log(c / closes[i]));
  const avg = returns.reduce((s, r) => s + r, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + (r - avg) ** 2, 0) / (returns.length - 1);
  const daily = Math.sqrt(variance) * 100;
  return { dailyPercent: daily, annualizedPercent: daily * Math.sqrt(252), returns: returns.length };
}

/** Forex-scale bands for annualized volatility: majors usually sit at 5–10%; under 7% calm, above 12% stormy. */
export const FX_VOLATILITY_ZONE_LIMITS = { low: 7, medium: 12 } as const;

export function fxVolatilityZone(annualizedPercent: number): VolatilityZone {
  if (annualizedPercent < FX_VOLATILITY_ZONE_LIMITS.low) return "low";
  if (annualizedPercent < FX_VOLATILITY_ZONE_LIMITS.medium) return "medium";
  return "high";
}

export type CurrencyStrength = { code: string; changePercent: number };

/**
 * Relative strength over `lookback` fixings: each currency's change in USD value minus the average
 * change of the whole basket (log returns, in %). A positive score means it gained against the
 * basket average — USD included — so the scores always sum to about zero.
 */
export function currencyStrength(table: UsdRateTable, codes: string[], lookback = 30): CurrencyStrength[] {
  const n = table.dates.length;
  if (n < 2) return [];
  const from = Math.max(0, n - 1 - lookback);
  const moves = codes.flatMap((code) => {
    if (code === "USD") return [{ code, log: 0 }];
    const s = table.rates[code];
    if (!s || !(s[from] > 0) || !(s[n - 1] > 0)) return [];
    // USD value of one unit is 1/rate, so its log change is ln(rate_from / rate_now).
    return [{ code, log: Math.log(s[from] / s[n - 1]) }];
  });
  if (moves.length === 0) return [];
  const mean = moves.reduce((sum, m) => sum + m.log, 0) / moves.length;
  return moves.map((m) => ({ code: m.code, changePercent: (m.log - mean) * 100 })).sort((a, b) => b.changePercent - a.changePercent);
}

/** One-day change of each currency's USD value between the last two fixings, strongest first. */
export function dailyMovers(table: UsdRateTable, codes: string[]): CurrencyStrength[] {
  const n = table.dates.length;
  if (n < 2) return [];
  return codes
    .flatMap((code) => {
      const s = table.rates[code];
      if (!s || !(s[n - 2] > 0) || !(s[n - 1] > 0)) return [];
      return [{ code, changePercent: (s[n - 2] / s[n - 1] - 1) * 100 }];
    })
    .sort((a, b) => b.changePercent - a.changePercent);
}

export type RateMark = { date: string; rate: number };
export type PairMilestones = { first: RateMark; high: RateMark; low: RateMark; last: RateMark; yearHigh: RateMark; yearLow: RateMark };

/** First, all-time high/low, 52-week high/low and latest fixing of a pair's full history. */
export function pairMilestones(points: DailyRate[]): PairMilestones | null {
  if (points.length === 0) return null;
  let high = points[0];
  let low = points[0];
  for (const p of points) {
    if (p.rate > high.rate) high = p;
    if (p.rate < low.rate) low = p;
  }
  const last = points[points.length - 1];
  const yearAgo = new Date(toUnix(last.date) * 1000 - 365 * DAY_SECONDS * 1000).toISOString().slice(0, 10);
  const year = points.filter((p) => p.date > yearAgo);
  let yearHigh = year[0] ?? last;
  let yearLow = year[0] ?? last;
  for (const p of year) {
    if (p.rate > yearHigh.rate) yearHigh = p;
    if (p.rate < yearLow.rate) yearLow = p;
  }
  return { first: points[0], high, low, last, yearHigh, yearLow };
}

/** Percent change from the fixing `days` calendar days before the last one (or the closest earlier fixing). */
export function changeOverDays(points: DailyRate[], days: number): number | null {
  if (points.length < 2) return null;
  const last = points[points.length - 1];
  const cutoff = new Date(toUnix(last.date) * 1000 - days * DAY_SECONDS * 1000).toISOString().slice(0, 10);
  let ref: DailyRate | undefined;
  for (const p of points) {
    if (p.date <= cutoff) ref = p;
    else break;
  }
  return ref && ref.rate > 0 ? (last.rate / ref.rate - 1) * 100 : null;
}

/** Where `value` sits between `low` (0) and `high` (100), clamped. */
export function rangePosition(value: number, low: number, high: number): number {
  if (!(high > low)) return 50;
  return Math.min(100, Math.max(0, ((value - low) / (high - low)) * 100));
}

/** Cross rates for a set of currencies: `matrix[i][j]` is units of `codes[j]` per 1 `codes[i]`. */
export function crossRateMatrix(codes: string[], ratePerUsd: Record<string, number>): (number | null)[][] {
  return codes.map((row) =>
    codes.map((col) => {
      const r = ratePerUsd[row];
      const c = ratePerUsd[col];
      return r > 0 && c > 0 ? c / r : null;
    })
  );
}

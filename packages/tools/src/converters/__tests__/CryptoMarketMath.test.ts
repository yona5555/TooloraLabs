import { describe, it, expect } from "vitest";
import {
  aggregateCandles,
  aggregateCandlesByCalendar,
  movingAverage,
  candleChangePercent,
  periodExtremes,
  isCandleTimeframe,
  clampBadWicks,
  realizedVolatility,
  volatilityZone,
  conversionSensitivity,
  supplyBreakdown,
  percentFrom,
  logScalePosition,
  topMovers,
  type Candle,
} from "../CryptoMarketMath";

const c = (time: number, open: number, high: number, low: number, close: number, volume = 1): Candle => ({
  time,
  open,
  high,
  low,
  close,
  volume,
});

describe("aggregateCandles", () => {
  it("merges two 5-minute candles into one epoch-aligned 10-minute candle", () => {
    const out = aggregateCandles([c(600, 10, 12, 9, 11, 2), c(900, 11, 15, 10, 14, 3), c(1200, 14, 14, 13, 13, 1)], 600);
    expect(out).toEqual([c(600, 10, 15, 9, 14, 5), c(1200, 14, 14, 13, 13, 1)]);
  });

  it("ignores input order", () => {
    const out = aggregateCandles([c(900, 11, 15, 10, 14), c(600, 10, 12, 9, 11)], 600);
    expect(out[0].open).toBe(10);
    expect(out[0].close).toBe(14);
  });

  it("returns empty for a non-positive bucket", () => {
    expect(aggregateCandles([c(0, 1, 1, 1, 1)], 0)).toEqual([]);
  });
});

describe("aggregateCandlesByCalendar", () => {
  const jan1 = Date.UTC(2024, 0, 1) / 1000;
  const jan31 = Date.UTC(2024, 0, 31) / 1000;
  const feb1 = Date.UTC(2024, 1, 1) / 1000;
  const days = [c(jan1, 100, 110, 90, 105), c(jan31, 105, 130, 100, 120), c(feb1, 120, 125, 80, 85)];

  it("groups by UTC calendar month", () => {
    const out = aggregateCandlesByCalendar(days, "month");
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ time: jan1, open: 100, high: 130, low: 90, close: 120, volume: 2 });
    expect(out[1]).toMatchObject({ time: feb1, open: 120, close: 85 });
  });

  it("groups by UTC calendar year", () => {
    const out = aggregateCandlesByCalendar(days, "year");
    expect(out).toEqual([c(jan1, 100, 130, 80, 85, 3)]);
  });
});

describe("movingAverage", () => {
  it("is null until the window fills, then averages closes", () => {
    const candles = [1, 2, 3, 4].map((v, i) => c(i, v, v, v, v));
    expect(movingAverage(candles, 3)).toEqual([null, null, 2, 3]);
  });
});

describe("candleChangePercent / periodExtremes / isCandleTimeframe", () => {
  it("computes open-to-close change", () => {
    expect(candleChangePercent(c(0, 200, 220, 190, 210))).toBeCloseTo(5);
    expect(candleChangePercent(c(0, 0, 1, 0, 1))).toBe(0);
  });

  it("finds the highest high and lowest low with their times", () => {
    expect(periodExtremes([c(1, 5, 9, 4, 6), c(2, 6, 8, 2, 7)])).toEqual({ high: 9, highTime: 1, low: 2, lowTime: 2 });
    expect(periodExtremes([])).toBeNull();
  });

  it("distinguishes minutes from months", () => {
    expect(isCandleTimeframe("1M")).toBe(true);
    expect(isCandleTimeframe("1m")).toBe(false);
  });
});

describe("clampBadWicks", () => {
  it("clamps an implausible wick to the candle body and leaves normal candles untouched", () => {
    const bad = c(0, 1000, 1100, 0.06, 1050);
    const ok = c(1, 1000, 1100, 900, 1050);
    expect(clampBadWicks([bad, ok])).toEqual([c(0, 1000, 1100, 1000, 1050), ok]);
    expect(clampBadWicks([c(2, 10, 100, 9, 11)])[0].high).toBe(11);
  });
});

describe("realizedVolatility / volatilityZone", () => {
  it("is zero for a flat series and annualizes by √365", () => {
    const flat = [1, 2, 3, 4].map((i) => c(i, 100, 100, 100, 100));
    expect(realizedVolatility(flat)?.dailyPercent).toBe(0);
    const zigzag = [100, 110, 100, 110, 100].map((v, i) => c(i, v, v, v, v));
    const vol = realizedVolatility(zigzag, 30)!;
    expect(vol.returns).toBe(4);
    expect(vol.annualizedPercent).toBeCloseTo(vol.dailyPercent * Math.sqrt(365));
    expect(vol.dailyPercent).toBeGreaterThan(9);
  });

  it("needs at least three closes", () => {
    expect(realizedVolatility([c(0, 1, 1, 1, 1), c(1, 1, 1, 1, 1)])).toBeNull();
  });

  it("bands annualized volatility", () => {
    expect(volatilityZone(25)).toBe("low");
    expect(volatilityZone(40)).toBe("medium");
    expect(volatilityZone(95)).toBe("high");
  });
});

describe("conversionSensitivity", () => {
  it("shifts the source price by ±pct", () => {
    const [down, now, up] = conversionSensitivity(2, 100, 50, 10);
    expect(down).toEqual({ shiftPercent: -10, fromPrice: 90, converted: 3.6 });
    expect(now.converted).toBe(4);
    expect(up.converted).toBeCloseTo(4.4);
    expect(conversionSensitivity(1, 1, 0)[1].converted).toBe(0);
  });
});

describe("supplyBreakdown", () => {
  it("splits a capped supply into circulating / locked / unissued", () => {
    expect(supplyBreakdown(19_000_000, 19_000_000, 21_000_000)).toMatchObject({ basis: "max", lockedPercent: 0 });
    const b = supplyBreakdown(50, 80, 100)!;
    expect([b.circulatingPercent, b.lockedPercent, b.unissuedPercent]).toEqual([50, 30, 20]);
  });

  it("falls back to total supply when uncapped", () => {
    expect(supplyBreakdown(120, 120, null)).toEqual({ basis: "total", circulatingPercent: 100, lockedPercent: 0, unissuedPercent: 0 });
    expect(supplyBreakdown(null, null, null)).toBeNull();
  });
});

describe("percentFrom / logScalePosition / topMovers", () => {
  it("computes percent change from a reference", () => {
    expect(percentFrom(200, 150)).toBe(-25);
    expect(percentFrom(0, 5)).toBe(0);
  });

  it("places values on a log scale", () => {
    expect(logScalePosition(1_000, 10, 100_000)).toBeCloseTo(0.5);
    expect(logScalePosition(1, 10, 100)).toBe(0);
    expect(logScalePosition(0, 10, 100)).toBe(0);
  });

  it("ranks gainers and losers and drops coins without data", () => {
    const coins = [5, -3, null, 12, -8, 0].map((v, i) => ({ id: i, priceChangePercentage24h: v }));
    const { gainers, losers } = topMovers(coins, 2);
    expect(gainers.map((g) => g.priceChangePercentage24h)).toEqual([12, 5]);
    expect(losers.map((l) => l.priceChangePercentage24h)).toEqual([-8, -3]);
  });
});

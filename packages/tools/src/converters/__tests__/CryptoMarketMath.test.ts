import { describe, it, expect } from "vitest";
import {
  aggregateCandles,
  aggregateCandlesByCalendar,
  movingAverage,
  candleChangePercent,
  periodExtremes,
  isCandleTimeframe,
  clampBadWicks,
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

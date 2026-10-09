import { describe, it, expect } from "vitest";
import {
  changeOverDays,
  crossRateMatrix,
  crossSeries,
  currencyStrength,
  dailyMovers,
  dailyToCandles,
  dailyToLine,
  fxVolatility,
  fxVolatilityZone,
  pairMilestones,
  rangePosition,
  type UsdRateTable,
} from "../ForexMarketMath";

// 2026-01-05 is a Monday.
const days = [
  { date: "2026-01-05", rate: 1.1 },
  { date: "2026-01-06", rate: 1.3 },
  { date: "2026-01-07", rate: 0.9 },
  { date: "2026-01-09", rate: 1.0 },
  { date: "2026-01-12", rate: 1.2 },
  { date: "2026-02-02", rate: 1.5 },
];

describe("dailyToCandles", () => {
  it("builds weekly OHLC from fixings only", () => {
    const w = dailyToCandles(days, "week");
    expect(w).toHaveLength(3);
    expect(w[0]).toEqual({ time: Date.UTC(2026, 0, 5) / 1000, open: 1.1, high: 1.3, low: 0.9, close: 1.0, volume: 0 });
    expect(w[1].open).toBe(1.2);
    expect(w[1].close).toBe(1.2);
  });
  it("builds monthly candles on the 1st", () => {
    const m = dailyToCandles(days, "month");
    expect(m).toHaveLength(2);
    expect(m[0].time).toBe(Date.UTC(2026, 0, 1) / 1000);
    expect(m[0]).toMatchObject({ open: 1.1, high: 1.3, low: 0.9, close: 1.2 });
    expect(m[1]).toMatchObject({ open: 1.5, close: 1.5 });
  });
  it("puts a Sunday in the week that started the Monday before", () => {
    const w = dailyToCandles([{ date: "2026-01-11", rate: 2 }], "week");
    expect(w[0].time).toBe(Date.UTC(2026, 0, 5) / 1000);
  });
  it("line candles are flat", () => {
    const l = dailyToLine(days.slice(0, 1));
    expect(l[0]).toMatchObject({ open: 1.1, high: 1.1, low: 1.1, close: 1.1 });
  });
});

const table: UsdRateTable = {
  dates: ["d1", "d2", "d3"],
  rates: { EUR: [0.9, 0.9, 0.8], JPY: [150, 150, 150] },
};

describe("crossSeries", () => {
  it("crosses through USD", () => {
    expect(crossSeries(table, "EUR", "JPY")[2].rate).toBeCloseTo(187.5);
    expect(crossSeries(table, "USD", "EUR")[0].rate).toBe(0.9);
    expect(crossSeries(table, "EUR", "USD")[2].rate).toBeCloseTo(1.25);
    expect(crossSeries(table, "XXX", "EUR")).toEqual([]);
  });
});

describe("currencyStrength", () => {
  it("scores against the basket mean and sums to zero", () => {
    const s = currencyStrength(table, ["USD", "EUR", "JPY"], 2);
    expect(s[0].code).toBe("EUR");
    const eurLog = Math.log(0.9 / 0.8);
    expect(s[0].changePercent).toBeCloseTo((eurLog - eurLog / 3) * 100);
    expect(s.reduce((a, b) => a + b.changePercent, 0)).toBeCloseTo(0);
  });
});

describe("dailyMovers", () => {
  it("measures each currency's one-day USD value change", () => {
    const m = dailyMovers(table, ["EUR", "JPY"]);
    expect(m[0]).toEqual({ code: "EUR", changePercent: (0.9 / 0.8 - 1) * 100 });
    expect(m[1].changePercent).toBe(0);
  });
});

describe("fxVolatility", () => {
  it("annualizes with √252", () => {
    const v = fxVolatility([1, 1.01, 1, 1.01, 1], 30)!;
    expect(v.returns).toBe(4);
    expect(v.annualizedPercent).toBeCloseTo(v.dailyPercent * Math.sqrt(252));
    expect(fxVolatility([1, 1])).toBeNull();
  });
  it("zones", () => {
    expect(fxVolatilityZone(5)).toBe("low");
    expect(fxVolatilityZone(9)).toBe("medium");
    expect(fxVolatilityZone(15)).toBe("high");
  });
});

describe("pairMilestones / changeOverDays / rangePosition", () => {
  it("finds extremes and the 52-week window", () => {
    const pts = [
      { date: "2020-01-01", rate: 2 },
      { date: "2025-06-01", rate: 1.4 },
      { date: "2025-12-01", rate: 1.6 },
      { date: "2026-01-01", rate: 1.5 },
    ];
    const m = pairMilestones(pts)!;
    expect(m.high.date).toBe("2020-01-01");
    expect(m.low.rate).toBe(1.4);
    expect(m.yearHigh.rate).toBe(1.6);
    expect(m.yearLow.rate).toBe(1.4);
    expect(changeOverDays(pts, 31)).toBeCloseTo((1.5 / 1.6 - 1) * 100);
    expect(rangePosition(1.5, 1.4, 1.6)).toBeCloseTo(50);
    expect(rangePosition(3, 1, 2)).toBe(100);
  });
});

describe("crossRateMatrix", () => {
  it("is reciprocal across the diagonal", () => {
    const m = crossRateMatrix(["USD", "EUR", "JPY"], { USD: 1, EUR: 0.8, JPY: 160 });
    expect(m[0][0]).toBe(1);
    expect(m[1][2]).toBe(200);
    expect(m[2][1]! * m[1][2]!).toBeCloseTo(1);
  });
});

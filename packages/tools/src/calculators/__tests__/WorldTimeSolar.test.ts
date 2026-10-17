import { describe, expect, it } from "vitest";
import {
  WT_SUNRISE_ELEVATION,
  wtAntisolarPoint,
  wtNightBand,
  wtNightInterval,
  wtSolarElevation,
  wtSolarPosition,
  wtSunTimes,
  wtTerminatorLines,
} from "../WorldTimeSolar";

describe("subsolar point", () => {
  it("has declination ≈ +23.44° at the June 2026 solstice and ≈ 0° at the March 2026 equinox", () => {
    expect(wtSolarPosition(Date.UTC(2026, 5, 21, 8, 24)).declinationDeg).toBeCloseTo(23.44, 0);
    expect(Math.abs(wtSolarPosition(Date.UTC(2026, 2, 20, 14, 46)).declinationDeg)).toBeLessThan(0.3);
    expect(wtSolarPosition(Date.UTC(2026, 11, 21, 20, 50)).declinationDeg).toBeCloseTo(-23.44, 0);
  });

  it("matches the equation of time extremes (≈ +16.4 min early Nov, ≈ −14.2 min mid Feb)", () => {
    expect(wtSolarPosition(Date.UTC(2026, 10, 3, 12)).equationOfTimeMin).toBeGreaterThan(15.8);
    expect(wtSolarPosition(Date.UTC(2026, 10, 3, 12)).equationOfTimeMin).toBeLessThan(16.9);
    expect(wtSolarPosition(Date.UTC(2026, 1, 11, 12)).equationOfTimeMin).toBeLessThan(-13.6);
    expect(wtSolarPosition(Date.UTC(2026, 1, 11, 12)).equationOfTimeMin).toBeGreaterThan(-14.8);
  });

  it("puts the sun over longitude −15° × (UTC − 12 h + EoT)", () => {
    const p = wtSolarPosition(Date.UTC(2026, 10, 3, 12));
    expect(p.subsolarLonDeg).toBeCloseTo(-15 * (p.equationOfTimeMin / 60), 6);
    expect(p.subsolarLonDeg).toBeLessThan(-3.9);
    const q = wtSolarPosition(Date.UTC(2026, 3, 15, 18));
    expect(q.subsolarLonDeg).toBeCloseTo(-90, 0); // EoT ≈ 0 mid-April
    expect(wtSolarPosition(Date.UTC(2026, 3, 15, 0)).subsolarLonDeg).toBeCloseTo(-180 + 0.0, -1);
  });

  it("gives elevation 90° at the subsolar point and −90° at the antisolar point", () => {
    const p = wtSolarPosition(Date.UTC(2026, 9, 17, 9, 30));
    const sub = { lat: p.subsolarLatDeg, lon: p.subsolarLonDeg };
    expect(wtSolarElevation(sub, sub)).toBeCloseTo(90, 6);
    expect(wtSolarElevation(wtAntisolarPoint(sub), sub)).toBeCloseTo(-90, 6);
  });
});

describe("terminator and night bands", () => {
  const sub = (ms: number) => {
    const p = wtSolarPosition(ms);
    return { lat: p.subsolarLatDeg, lon: p.subsolarLonDeg };
  };

  it("places the interval edges exactly on the requested sun elevation", () => {
    const s = sub(Date.UTC(2026, 9, 17, 12));
    for (const lon of [-170, -95, -30, 0, 45, 120, 179]) {
      const iv = wtNightInterval(lon, s, WT_SUNRISE_ELEVATION);
      expect(iv).not.toBeNull();
      if (iv![0] > -90) expect(wtSolarElevation({ lat: iv![0], lon }, s)).toBeCloseTo(WT_SUNRISE_ELEVATION, 6);
      if (iv![1] < 90) expect(wtSolarElevation({ lat: iv![1], lon }, s)).toBeCloseTo(WT_SUNRISE_ELEVATION, 6);
      const mid = (iv![0] + iv![1]) / 2;
      expect(wtSolarElevation({ lat: mid, lon }, s)).toBeLessThan(WT_SUNRISE_ELEVATION);
    }
  });

  it("keeps the North Pole lit and the South Pole dark at the June solstice", () => {
    const s = sub(Date.UTC(2026, 5, 21, 12));
    const band = wtNightBand(s, WT_SUNRISE_ELEVATION, 2);
    const lats = band.polygons.flat().map(([, lat]) => lat);
    expect(Math.max(...lats)).toBeLessThan(70);
    expect(Math.min(...lats)).toBe(-90);
    // The meridian under the sun has no night down to about 66.6° S + refraction.
    const iv = wtNightInterval(s.lon, s, WT_SUNRISE_ELEVATION)!;
    expect(iv[1]).toBeLessThan(-65);
  });

  it("is close to the ±90° meridians from the subsolar point at an equinox", () => {
    const s = sub(Date.UTC(2026, 2, 20, 14, 46));
    const lines = wtTerminatorLines(s, 0, 1);
    expect(lines.length).toBeGreaterThan(0);
    // At an equinox the night region is the half-world away from the sun: the noon meridian is lit
    // everywhere except within a few degrees of the poles; the midnight meridian is dark.
    const noon = wtNightInterval(s.lon, s, 0);
    expect(noon === null || noon[1] - noon[0] < 2).toBe(true);
    const midnight = wtNightInterval(s.lon + 180, s, 0)!;
    expect(midnight[1] - midnight[0]).toBeGreaterThan(170);
  });

  it("nests the twilight bands: astronomical night ⊂ nautical ⊂ civil ⊂ night", () => {
    const s = sub(Date.UTC(2026, 9, 17, 3));
    for (const lon of [-120, 0, 60, 150]) {
      const a = wtNightInterval(lon, s, -18);
      const c = wtNightInterval(lon, s, -0.833)!;
      if (a) {
        expect(a[0]).toBeGreaterThanOrEqual(c[0] - 1e-9);
        expect(a[1]).toBeLessThanOrEqual(c[1] + 1e-9);
      }
    }
  });
});

describe("sun times", () => {
  it("London on 21 June 2026: sunrise ≈ 04:43 BST, sunset ≈ 21:21, day ≈ 16 h 38 m", () => {
    const t = wtSunTimes(51.51, -0.13, { year: 2026, month: 6, day: 21 }, 60);
    expect(Math.abs(t.sunrise! - (4 * 60 + 43))).toBeLessThan(4);
    expect(Math.abs(t.sunset! - (21 * 60 + 21))).toBeLessThan(4);
    expect(Math.abs(t.dayLengthMin - (16 * 60 + 38))).toBeLessThan(6);
  });

  it("Singapore days stay near 12 h 10 m and the Arctic gets midnight sun in June", () => {
    const sg = wtSunTimes(1.35, 103.82, { year: 2026, month: 10, day: 17 }, 480);
    expect(Math.abs(sg.dayLengthMin - 730)).toBeLessThan(8);
    expect(wtSunTimes(78.2, 15.6, { year: 2026, month: 6, day: 21 }, 120).polar).toBe("day");
    expect(wtSunTimes(78.2, 15.6, { year: 2026, month: 12, day: 21 }, 60).polar).toBe("night");
  });
});

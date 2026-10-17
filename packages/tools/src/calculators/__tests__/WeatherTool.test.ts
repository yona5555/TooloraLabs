import { describe, it, expect } from "vitest";
import {
  dewPointC,
  heatIndexC,
  windChillC,
  feelsLike,
  dewComfort,
  pressureTrend,
  uvLevel,
  beaufort,
  compass16,
  moonPhase,
  haversineKm,
  SYNODIC_MONTH_DAYS,
} from "../WeatherScience";
import { parseMetForecast, buildDailyForecast, nextHours, currentStep, pressureTendency, type MetLocationforecast } from "../WeatherForecastModel";
import { parseUsgsFeed, parseEonetFeed, quakeRadius, hazardsByDistance, countHazards } from "../WeatherHazards";
import { WX_CITIES, wxFindCity, wxCityName, wxDefaultCity, wxSearchCities } from "../WeatherCities";

describe("dew point and feels-like", () => {
  it("dew point equals air temperature at 100% humidity and matches a Magnus reference", () => {
    expect(dewPointC(20, 100)).toBeCloseTo(20, 6);
    expect(dewPointC(25, 50)).toBeCloseTo(13.9, 1);
  });

  it("heat index matches the NWS table (90 °F, 60 % → 100 °F)", () => {
    expect(heatIndexC(32.22, 60)).toBeCloseTo(37.8, 0);
  });

  it("wind chill matches Environment Canada (−10 °C, 20 km/h → −17.9 °C)", () => {
    expect(windChillC(-10, 20)).toBeCloseTo(-17.9, 1);
  });

  it("picks the formula by temperature and wind", () => {
    expect(feelsLike(-5, 70, 25).method).toBe("windChill");
    expect(feelsLike(5, 70, 3).method).toBe("air");
    expect(feelsLike(33, 60, 10).method).toBe("heatIndex");
    expect(feelsLike(18, 60, 30)).toEqual({ valueC: 18, method: "air" });
  });

  it("classifies dew-point comfort", () => {
    expect(dewComfort(4)).toBe("dry");
    expect(dewComfort(12)).toBe("comfortable");
    expect(dewComfort(18)).toBe("sticky");
    expect(dewComfort(22)).toBe("oppressive");
    expect(dewComfort(27)).toBe("severe");
  });
});

describe("scales", () => {
  it("pressure tendency uses a ±1 hPa steady band", () => {
    expect(pressureTrend(1.6)).toBe("rising");
    expect(pressureTrend(-2)).toBe("falling");
    expect(pressureTrend(0.4)).toBe("steady");
  });

  it("UV categories follow WHO bands", () => {
    expect(uvLevel(2.4)).toBe("low");
    expect(uvLevel(5)).toBe("moderate");
    expect(uvLevel(7.4)).toBe("high");
    expect(uvLevel(10)).toBe("veryHigh");
    expect(uvLevel(12)).toBe("extreme");
  });

  it("Beaufort force and 16-point compass", () => {
    expect(beaufort(0.2)).toBe(0);
    expect(beaufort(5)).toBe(3);
    expect(beaufort(40)).toBe(12);
    expect(compass16(0)).toBe("n");
    expect(compass16(359)).toBe("n");
    expect(compass16(225)).toBe("sw");
    expect(compass16(-90)).toBe("w");
  });
});

describe("moon phase", () => {
  it("is new at the reference new moon and full half a month later", () => {
    const ref = Date.UTC(2000, 0, 6, 18, 14);
    expect(moonPhase(ref).phase).toBe("newMoon");
    expect(moonPhase(ref).illumination).toBeCloseTo(0, 6);
    const full = moonPhase(ref + (SYNODIC_MONTH_DAYS / 2) * 86_400_000);
    expect(full.phase).toBe("fullMoon");
    expect(full.illumination).toBeCloseTo(1, 6);
  });

  it("is close to a known full moon (2024-04-23 23:49 UTC)", () => {
    const m = moonPhase(Date.UTC(2024, 3, 23, 23, 49));
    expect(m.phase).toBe("fullMoon");
    expect(m.illumination).toBeGreaterThan(0.98);
    expect(m.nextNewMoonMs).toBeGreaterThan(Date.UTC(2024, 3, 23, 23, 49));
  });
});

describe("haversine", () => {
  it("Riyadh → Jeddah is about 850 km", () => {
    expect(haversineKm({ lat: 24.71, lon: 46.68 }, { lat: 21.49, lon: 39.19 })).toBeGreaterThan(830);
    expect(haversineKm({ lat: 24.71, lon: 46.68 }, { lat: 21.49, lon: 39.19 })).toBeLessThan(870);
  });
});

const step = (time: string, temp: number, extra: Record<string, unknown> = {}) => ({
  time,
  data: {
    instant: { details: { air_temperature: temp, relative_humidity: 50, wind_speed: 5, wind_from_direction: 90, air_pressure_at_sea_level: 1010, cloud_area_fraction: 20, ultraviolet_index_clear_sky: 3 } },
    ...extra,
  },
});

const hourly = (h: number, temp: number, symbol = "clearsky_day", mm = 0) =>
  step(`2026-10-17T${String(h).padStart(2, "0")}:00:00Z`, temp, {
    next_1_hours: { summary: { symbol_code: symbol }, details: { precipitation_amount: mm } },
    next_6_hours: { summary: { symbol_code: symbol }, details: { precipitation_amount: mm * 6, air_temperature_max: temp + 1, air_temperature_min: temp - 1 } },
  });

const met: MetLocationforecast = {
  properties: {
    meta: { updated_at: "2026-10-17T06:00:00Z" },
    timeseries: [
      ...Array.from({ length: 24 }, (_, h) => hourly(h, 10 + h / 2, h === 12 ? "rain" : "cloudy", h === 12 ? 2 : 0.1)),
      step("2026-10-18T00:00:00Z", 8, {
        next_6_hours: { summary: { symbol_code: "snow" }, details: { precipitation_amount: 3, air_temperature_max: 9, air_temperature_min: 4 } },
      }),
      step("2026-10-18T06:00:00Z", 12, {
        next_6_hours: { summary: { symbol_code: "partlycloudy_day" }, details: { precipitation_amount: 0, air_temperature_max: 15, air_temperature_min: 12 } },
      }),
      step("2026-10-18T12:00:00Z", 14, {
        next_6_hours: { summary: { symbol_code: "fair_day" }, details: { precipitation_amount: 1, air_temperature_max: 16, air_temperature_min: 13 } },
      }),
      step("2026-10-19T00:00:00Z", 7, { next_6_hours: { summary: { symbol_code: "fog" }, details: { precipitation_amount: 0 } } }),
    ],
  },
};

describe("MET Norway forecast model", () => {
  const fc = parseMetForecast(met);

  it("parses steps with units converted and period lengths detected", () => {
    expect(fc.steps).toHaveLength(28);
    expect(fc.updatedAt).toBe(Date.parse("2026-10-17T06:00:00Z"));
    expect(fc.steps[0].stepHours).toBe(1);
    expect(fc.steps[0].windKmh).toBeCloseTo(18, 6);
    expect(fc.steps[24].stepHours).toBe(6);
    expect(fc.steps[24].precipMm).toBe(3);
    expect(fc.steps[23].stepHours).toBe(1);
  });

  it("current step, next hours and pressure tendency", () => {
    const now = Date.parse("2026-10-17T05:30:00Z");
    expect(currentStep(fc.steps, now)?.t).toBe(Date.parse("2026-10-17T05:00:00Z"));
    const next = nextHours(fc.steps, now, 48);
    expect(next[0].t).toBe(Date.parse("2026-10-17T05:00:00Z"));
    expect(next.every((s) => s.stepHours === 1)).toBe(true);
    expect(pressureTendency(fc.steps, now)).toEqual({ deltaHpa: 0, trend: "steady" });
  });

  it("builds local daily summaries in the given zone", () => {
    const days = buildDailyForecast(fc.steps, "UTC");
    expect(days.map((d) => d.date)).toEqual(["2026-10-17", "2026-10-18"]);
    expect(days[0].minC).toBe(10);
    expect(days[0].maxC).toBe(21.5);
    expect(days[0].category).toBe("rain");
    expect(days[0].precipMm).toBeCloseTo(2 + 23 * 0.1, 6);
    expect(days[1].minC).toBe(4);
    expect(days[1].maxC).toBe(16);
    expect(days[1].precipMm).toBe(4);
    expect(days[1].category).toBe("fair");
  });

  it("shifts day boundaries with the time zone", () => {
    const days = buildDailyForecast(fc.steps, "Asia/Riyadh");
    expect(days[0].date).toBe("2026-10-17");
    expect(days[0].coveredHours).toBe(21);
  });

  it("survives an empty response", () => {
    expect(parseMetForecast({} as MetLocationforecast).steps).toEqual([]);
    expect(currentStep([], 0)).toBeNull();
  });
});

describe("hazards", () => {
  const quakes = parseUsgsFeed({
    features: [
      { id: "us1", properties: { mag: 6.1, place: "10 km N of X", time: 1, url: "https://earthquake.usgs.gov/x", title: "M 6.1", tsunami: 1 }, geometry: { coordinates: [140, 35, 10] } },
      { id: "us2", properties: { mag: null, place: null, time: 2, url: null, title: "M ?", tsunami: 0 }, geometry: { coordinates: [46, 24, 5] } },
    ],
  });
  const events = parseEonetFeed({
    events: [
      {
        id: "E1",
        title: "Tropical Cyclone 01P",
        categories: [{ id: "severeStorms" }],
        sources: [{ id: "JTWC", url: "https://example.org/jtwc" }],
        geometry: [
          { date: "2026-10-16T00:00:00Z", type: "Point", coordinates: [-163, -10], magnitudeValue: 35, magnitudeUnit: "kts" },
          { date: "2026-10-17T00:00:00Z", type: "Point", coordinates: [-164, -12], magnitudeValue: 60, magnitudeUnit: "kts" },
        ],
      },
      { id: "E2", title: "Fire", categories: [{ id: "wildfires" }], sources: [], geometry: [{ date: "2026-10-17T00:00:00Z", type: "Polygon", coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2]]] }] },
      { id: "E3", title: "Ice", categories: [{ id: "seaLakeIce" }], sources: [], geometry: [{ date: "2026-10-17T00:00:00Z", type: "Point", coordinates: [0, 80] }] },
    ],
  });

  it("parses USGS earthquakes", () => {
    expect(quakes[0]).toMatchObject({ id: "usgs-us1", kind: "earthquake", lat: 35, lon: 140, magnitude: 6.1, depthKm: 10, tsunami: true, source: "USGS" });
    expect(quakes[1].magnitude).toBeNull();
    expect(quakes[1].title).toBe("M ?");
  });

  it("parses EONET events with the latest position, polygon centroids and source links", () => {
    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({ kind: "storm", lat: -12, lon: -164, magnitude: 60, magnitudeUnit: "kts", url: "https://example.org/jtwc", source: "JTWC" });
    expect(events[1]).toMatchObject({ kind: "wildfire", lat: 1, lon: 1, url: null, source: "EONET" });
  });

  it("sizes, sorts and counts", () => {
    expect(quakeRadius(2.5)).toBe(3);
    expect(quakeRadius(9)).toBe(20);
    expect(quakeRadius(5)).toBeGreaterThan(quakeRadius(4));
    const near = hazardsByDistance([...quakes, ...events], { lat: 24.7, lon: 46.7 });
    expect(near[0].id).toBe("usgs-us2");
    expect(countHazards([...quakes, ...events])).toEqual({ earthquake: 2, wildfire: 1, storm: 1, volcano: 0 });
  });
});

describe("curated city list", () => {
  it("has unique ids, valid coordinates and six names each", () => {
    const ids = new Set(WX_CITIES.map((c) => c.id));
    expect(ids.size).toBe(WX_CITIES.length);
    for (const c of WX_CITIES) {
      expect(Math.abs(c.lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(c.lon)).toBeLessThanOrEqual(180);
      expect(Object.keys(c.name).sort()).toEqual(["ar", "de", "en", "es", "fr", "hi"]);
    }
    expect(WX_CITIES.filter((c) => c.onMap).length).toBeGreaterThanOrEqual(40);
  });

  it("defaults by locale and localises names", () => {
    expect(wxDefaultCity("ar").id).toBe("riyadh");
    expect(wxDefaultCity("fr").id).toBe("paris");
    expect(wxDefaultCity("xx").id).toBe("new-york");
    expect(wxCityName(wxFindCity("cairo")!, "fr")).toBe("Le Caire");
    expect(wxCityName(wxFindCity("jeddah")!, "ar")).toBe("جدة");
  });

  it("searches across languages, accents and Arabic letter variants", () => {
    expect(wxSearchCities("jed")[0].id).toBe("jeddah");
    expect(wxSearchCities("مكه")[0].id).toBe("mecca");
    expect(wxSearchCities("bogota")[0].id).toBe("bogota");
    expect(wxSearchCities("Pékin")[0].id).toBe("beijing");
    expect(wxSearchCities("").length).toBe(WX_CITIES.length);
  });
});

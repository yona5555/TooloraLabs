import { describe, it, expect } from "vitest";
import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  convertTemperature,
  kmhToMph,
  mphToKmh,
  convertWindSpeed,
  msToKmh,
  hpaToInHg,
  mmToInches,
  weatherTemp,
  metSymbolCategory,
  isNightSymbol,
  precipitationKind,
} from "../WeatherConverter";

describe("celsiusToFahrenheit / fahrenheitToCelsius", () => {
  it("converts known reference points", () => {
    expect(celsiusToFahrenheit(0)).toBeCloseTo(32, 5);
    expect(celsiusToFahrenheit(100)).toBeCloseTo(212, 5);
    expect(fahrenheitToCelsius(32)).toBeCloseTo(0, 5);
    expect(fahrenheitToCelsius(212)).toBeCloseTo(100, 5);
  });

  it("returns 0 for non-finite input", () => {
    expect(celsiusToFahrenheit(NaN)).toBe(0);
    expect(fahrenheitToCelsius(Infinity)).toBe(0);
  });
});

describe("convertTemperature", () => {
  it("returns the same value when units match", () => {
    expect(convertTemperature(21, "celsius", "celsius")).toBe(21);
  });

  it("converts celsius to fahrenheit and back", () => {
    expect(convertTemperature(25, "celsius", "fahrenheit")).toBeCloseTo(77, 5);
    expect(convertTemperature(77, "fahrenheit", "celsius")).toBeCloseTo(25, 5);
  });
});

describe("kmhToMph / mphToKmh", () => {
  it("converts known reference points", () => {
    expect(kmhToMph(100)).toBeCloseTo(62.137, 2);
    expect(mphToKmh(60)).toBeCloseTo(96.56, 1);
  });

  it("returns 0 for non-finite input", () => {
    expect(kmhToMph(NaN)).toBe(0);
  });
});

describe("convertWindSpeed", () => {
  it("returns the same value when units match", () => {
    expect(convertWindSpeed(15, "kmh", "kmh")).toBe(15);
  });

  it("converts between km/h and mph", () => {
    expect(convertWindSpeed(10, "kmh", "mph")).toBeCloseTo(6.2137, 3);
  });
});

describe("MET Norway unit helpers", () => {
  it("converts m/s, hPa and mm", () => {
    expect(msToKmh(10)).toBeCloseTo(36, 6);
    expect(hpaToInHg(1013.25)).toBeCloseTo(29.92, 2);
    expect(mmToInches(25.4)).toBeCloseTo(1, 6);
    expect(msToKmh(NaN)).toBe(0);
  });

  it("switches temperature by unit system", () => {
    expect(weatherTemp(100, "us")).toBeCloseTo(212, 6);
    expect(weatherTemp(21, "metric")).toBe(21);
  });
});

describe("metSymbolCategory", () => {
  it("maps cloud and clear symbols with day/night suffixes", () => {
    expect(metSymbolCategory("clearsky_day")).toBe("clearSky");
    expect(metSymbolCategory("fair_night")).toBe("fair");
    expect(metSymbolCategory("partlycloudy_polartwilight")).toBe("partlyCloudy");
    expect(metSymbolCategory("cloudy")).toBe("cloudy");
    expect(metSymbolCategory("fog")).toBe("fog");
  });

  it("maps precipitation and thunder symbols", () => {
    expect(metSymbolCategory("lightrain")).toBe("lightRain");
    expect(metSymbolCategory("heavyrain")).toBe("heavyRain");
    expect(metSymbolCategory("rainshowers_day")).toBe("rainShowers");
    expect(metSymbolCategory("heavysleetshowers_night")).toBe("sleet");
    expect(metSymbolCategory("lightsnow")).toBe("snow");
    expect(metSymbolCategory("snowshowers_day")).toBe("snowShowers");
    expect(metSymbolCategory("heavyrainshowersandthunder_day")).toBe("thunderstorm");
  });

  it("returns unknown for missing or unrecognized symbols", () => {
    expect(metSymbolCategory(undefined)).toBe("unknown");
    expect(metSymbolCategory("volcanic_ash")).toBe("unknown");
  });

  it("detects night symbols and precipitation kinds", () => {
    expect(isNightSymbol("clearsky_night")).toBe(true);
    expect(isNightSymbol("clearsky_day")).toBe(false);
    expect(precipitationKind("snowShowers")).toBe("snow");
    expect(precipitationKind("thunderstorm")).toBe("rain");
    expect(precipitationKind("fair")).toBeNull();
  });
});

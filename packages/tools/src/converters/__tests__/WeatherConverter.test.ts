import { describe, it, expect } from "vitest";
import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  convertTemperature,
  kmhToMph,
  mphToKmh,
  convertWindSpeed,
  getWeatherCategory,
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

describe("getWeatherCategory", () => {
  it("maps clear-sky and cloud codes", () => {
    expect(getWeatherCategory(0)).toBe("clearSky");
    expect(getWeatherCategory(1)).toBe("mainlyClear");
    expect(getWeatherCategory(2)).toBe("partlyCloudy");
    expect(getWeatherCategory(3)).toBe("overcast");
  });

  it("maps fog codes", () => {
    expect(getWeatherCategory(45)).toBe("fog");
    expect(getWeatherCategory(48)).toBe("fog");
  });

  it("maps precipitation codes", () => {
    expect(getWeatherCategory(61)).toBe("rain");
    expect(getWeatherCategory(71)).toBe("snow");
    expect(getWeatherCategory(80)).toBe("rainShowers");
    expect(getWeatherCategory(85)).toBe("snowShowers");
  });

  it("maps thunderstorm codes", () => {
    expect(getWeatherCategory(95)).toBe("thunderstorm");
    expect(getWeatherCategory(96)).toBe("thunderstormHail");
    expect(getWeatherCategory(99)).toBe("thunderstormHail");
  });

  it("returns unknown for an unrecognized code", () => {
    expect(getWeatherCategory(12345)).toBe("unknown");
  });
});

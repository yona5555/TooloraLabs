import { describe, it, expect } from "vitest";
import { UnitConverter } from "../UnitConverter";

const tool = new UnitConverter();
const ctx = { locale: "en-US" };

describe("UnitConverter", () => {
  it("converts length (km to m)", () => {
    const output = tool.execute(
      { category: "length", from: "km", to: "m", value: 1 },
      ctx
    );
    expect(output.success).toBe(true);
    expect(output.data.result).toBe(1000);
  });

  it("converts length (in to cm)", () => {
    const output = tool.execute(
      { category: "length", from: "in", to: "cm", value: 1 },
      ctx
    );
    expect(output.data.result).toBeCloseTo(2.54, 5);
  });

  it("converts weight (kg to lb)", () => {
    const output = tool.execute(
      { category: "weight", from: "kg", to: "lb", value: 1 },
      ctx
    );
    expect(output.data.result).toBeCloseTo(2.20462, 4);
  });

  it("converts temperature (celsius to fahrenheit)", () => {
    const output = tool.execute(
      { category: "temperature", from: "celsius", to: "fahrenheit", value: 100 },
      ctx
    );
    expect(output.data.result).toBe(212);
  });

  it("converts temperature (fahrenheit to celsius)", () => {
    const output = tool.execute(
      { category: "temperature", from: "fahrenheit", to: "celsius", value: 32 },
      ctx
    );
    expect(output.data.result).toBe(0);
  });

  it("converts temperature (celsius to kelvin)", () => {
    const output = tool.execute(
      { category: "temperature", from: "celsius", to: "kelvin", value: 0 },
      ctx
    );
    expect(output.data.result).toBe(273.15);
  });

  it("returns a failure result for an unknown unit", () => {
    const output = tool.execute(
      { category: "length", from: "km", to: "parsecs", value: 1 },
      ctx
    );
    expect(output.success).toBe(false);
  });

  it("converts area (m2 to sqft)", () => {
    const output = tool.execute({ category: "area", from: "m2", to: "sqft", value: 1 }, ctx);
    expect(output.data.result).toBeCloseTo(10.7639, 3);
  });

  it("converts area (hectare to m2)", () => {
    const output = tool.execute({ category: "area", from: "hectare", to: "m2", value: 1 }, ctx);
    expect(output.data.result).toBe(10000);
  });

  it("converts volume (gal to l)", () => {
    const output = tool.execute({ category: "volume", from: "gal", to: "l", value: 1 }, ctx);
    expect(output.data.result).toBeCloseTo(3.785412, 4);
  });

  it("converts speed (kmh to mph)", () => {
    const output = tool.execute({ category: "speed", from: "kmh", to: "mph", value: 100 }, ctx);
    expect(output.data.result).toBeCloseTo(62.1371, 3);
  });

  it("converts speed (knot to mps)", () => {
    const output = tool.execute({ category: "speed", from: "knot", to: "mps", value: 1 }, ctx);
    expect(output.data.result).toBeCloseTo(0.514444, 5);
  });

  it("returns conversions to every unit in the category", () => {
    const output = tool.execute({ category: "length", from: "m", to: "ft", value: 1 }, ctx);
    expect(output.data.allConversions.km).toBeCloseTo(0.001, 5);
    expect(output.data.allConversions.ft).toBeCloseTo(3.28084, 4);
    expect(output.data.allConversions.mi).toBeCloseTo(0.000621371, 5);
    expect(Object.keys(output.data.allConversions)).toHaveLength(8);
  });

  it("returns all-unit conversions for temperature too", () => {
    const output = tool.execute(
      { category: "temperature", from: "celsius", to: "fahrenheit", value: 0 },
      ctx
    );
    expect(output.data.allConversions.celsius).toBe(0);
    expect(output.data.allConversions.fahrenheit).toBe(32);
    expect(output.data.allConversions.kelvin).toBeCloseTo(273.15, 2);
  });
});

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
});

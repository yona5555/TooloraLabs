import { describe, it, expect } from "vitest";
import { parseLocalizedNumber } from "../parseLocalizedNumber";

describe("parseLocalizedNumber", () => {
  it("parses regular latin digits", () => {
    expect(parseLocalizedNumber("168")).toBe(168);
  });

  it("parses arabic-indic digits", () => {
    expect(parseLocalizedNumber("١٦٨")).toBe(168);
  });

  it("parses mixed and decimal values", () => {
    expect(parseLocalizedNumber("٦٨.٥")).toBe(68.5);
  });

  it("returns NaN for invalid input", () => {
    expect(Number.isNaN(parseLocalizedNumber("abc"))).toBe(true);
  });
});

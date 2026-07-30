import { describe, it, expect } from "vitest";
import { detectDigitStyle } from "../detectDigitStyle";

describe("detectDigitStyle", () => {
  it("detects western digits", () => {
    expect(detectDigitStyle("123")).toBe("western");
  });

  it("detects arabic-indic digits", () => {
    expect(detectDigitStyle("١٢٣")).toBe("eastern");
  });

  it("detects extended arabic-indic (persian) digits", () => {
    expect(detectDigitStyle("۱۲۳")).toBe("eastern");
  });

  it("detects eastern digits mixed with other characters", () => {
    expect(detectDigitStyle("السعر ١٢٣.٥")).toBe("eastern");
  });

  it("defaults to western for empty input", () => {
    expect(detectDigitStyle("")).toBe("western");
  });

  it("defaults to western when no digits are present", () => {
    expect(detectDigitStyle("abc")).toBe("western");
  });
});

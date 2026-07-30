import { describe, it, expect } from "vitest";
import { formatLocalizedNumber } from "../formatLocalizedNumber";

describe("formatLocalizedNumber", () => {
  it("formats with western digits by default", () => {
    expect(formatLocalizedNumber(1234.5, "western")).toBe("1,234.5");
  });

  it("formats with eastern digits", () => {
    expect(formatLocalizedNumber(1234.5, "eastern")).toBe("١٬٢٣٤٫٥");
  });

  it("respects Intl.NumberFormat options for western digits", () => {
    expect(
      formatLocalizedNumber(1234.5, "western", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    ).toBe("1,234.50");
  });

  it("respects Intl.NumberFormat options for eastern digits", () => {
    expect(
      formatLocalizedNumber(0.5, "eastern", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    ).toBe("٠٫٥٠");
  });

  it("formats currency-style output for the eastern digit style", () => {
    const result = formatLocalizedNumber(1500, "eastern", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
    expect(result).toContain("١٬٥٠٠");
  });
});

import { describe, expect, it } from "vitest";
import { RomanNumeralCalculator } from "../RomanNumeralCalculator";

const ctx = { locale: "en-US" };

describe("RomanNumeralCalculator", () => {
  const tool = new RomanNumeralCalculator();

  it("converts a simple Arabic number to Roman", () => {
    const result = tool.execute({ direction: "toRoman", arabicValue: 8 }, ctx);
    expect(result.data.error).toBeNull();
    expect(result.data.romanValue).toBe("VIII");
  });

  it("converts a number requiring subtractive notation", () => {
    const result = tool.execute({ direction: "toRoman", arabicValue: 1994 }, ctx);
    expect(result.data.romanValue).toBe("MCMXCIV");
  });

  it("converts the maximum standard value", () => {
    const result = tool.execute({ direction: "toRoman", arabicValue: 3999 }, ctx);
    expect(result.data.romanValue).toBe("MMMCMXCIX");
  });

  it("converts the minimum value", () => {
    const result = tool.execute({ direction: "toRoman", arabicValue: 1 }, ctx);
    expect(result.data.romanValue).toBe("I");
  });

  it("rejects an Arabic value of zero", () => {
    const result = tool.execute({ direction: "toRoman", arabicValue: 0 }, ctx);
    expect(result.data.error).toBe("out-of-range");
  });

  it("rejects an Arabic value above 3999", () => {
    const result = tool.execute({ direction: "toRoman", arabicValue: 4000 }, ctx);
    expect(result.data.error).toBe("out-of-range");
  });

  it("rejects a non-integer Arabic value", () => {
    const result = tool.execute({ direction: "toRoman", arabicValue: 4.5 }, ctx);
    expect(result.data.error).toBe("out-of-range");
  });

  it("converts a simple Roman numeral to Arabic", () => {
    const result = tool.execute({ direction: "toArabic", romanValue: "VIII" }, ctx);
    expect(result.data.error).toBeNull();
    expect(result.data.arabicValue).toBe(8);
  });

  it("converts a Roman numeral with subtractive notation", () => {
    const result = tool.execute({ direction: "toArabic", romanValue: "MCMXCIV" }, ctx);
    expect(result.data.arabicValue).toBe(1994);
  });

  it("is case-insensitive for Roman input", () => {
    const result = tool.execute({ direction: "toArabic", romanValue: "mcmxciv" }, ctx);
    expect(result.data.arabicValue).toBe(1994);
  });

  it("rejects malformed Roman numerals like IIII", () => {
    const result = tool.execute({ direction: "toArabic", romanValue: "IIII" }, ctx);
    expect(result.data.error).toBe("invalid-roman");
  });

  it("rejects malformed Roman numerals like VX", () => {
    const result = tool.execute({ direction: "toArabic", romanValue: "VX" }, ctx);
    expect(result.data.error).toBe("invalid-roman");
  });

  it("rejects non-Roman characters", () => {
    const result = tool.execute({ direction: "toArabic", romanValue: "ABC" }, ctx);
    expect(result.data.error).toBe("invalid-roman");
  });

  it("rejects empty input for both directions", () => {
    const r1 = tool.execute({ direction: "toArabic", romanValue: "" }, ctx);
    expect(r1.data.error).toBe("empty-input");
    const r2 = tool.execute({ direction: "toRoman", arabicValue: undefined }, ctx);
    expect(r2.data.error).toBe("empty-input");
  });
});

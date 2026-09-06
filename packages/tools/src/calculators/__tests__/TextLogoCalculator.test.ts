import { describe, expect, it } from "vitest";
import { TextLogoCalculator } from "../TextLogoCalculator";

const ctx = { locale: "en-US" };

describe("TextLogoCalculator", () => {
  const tool = new TextLogoCalculator();

  it("converts text to bold Unicode style", () => {
    const result = tool.execute({ text: "AZaz09", style: "bold" }, ctx);
    expect(result.data.error).toBeNull();
    expect(result.data.styledText).toBe("𝐀𝐙𝐚𝐳𝟎𝟗");
  });

  it("converts text to italic style with the h exception", () => {
    const result = tool.execute({ text: "hi", style: "italic" }, ctx);
    expect(result.data.styledText).toBe("ℎ𝑖");
  });

  it("leaves digits unchanged for italic (no italic digit variant in Unicode)", () => {
    const result = tool.execute({ text: "5", style: "italic" }, ctx);
    expect(result.data.styledText).toBe("5");
  });

  it("converts text to bold italic style", () => {
    const result = tool.execute({ text: "Ab", style: "boldItalic" }, ctx);
    expect(result.data.styledText).toBe("𝑨𝒃");
  });

  it("converts text to double-struck style with legacy letterlike exceptions", () => {
    const result = tool.execute({ text: "CHNPQRZ", style: "doubleStruck" }, ctx);
    expect(result.data.styledText).toBe("ℂℍℕℙℚℝℤ");
  });

  it("converts double-struck lowercase and digits without gaps", () => {
    const result = tool.execute({ text: "a5", style: "doubleStruck" }, ctx);
    expect(result.data.styledText).toBe("𝕒𝟝");
  });

  it("converts text to monospace style", () => {
    const result = tool.execute({ text: "Ab1", style: "monospace" }, ctx);
    expect(result.data.styledText).toBe("𝙰𝚋𝟷");
  });

  it("converts text to fullwidth style", () => {
    const result = tool.execute({ text: "Ab1", style: "fullwidth" }, ctx);
    expect(result.data.styledText).toBe("Ａｂ１");
  });

  it("converts text to circled style with the zero exception", () => {
    const result = tool.execute({ text: "A0z5", style: "circled" }, ctx);
    expect(result.data.styledText).toBe("Ⓐ⓪ⓩ⑤");
  });

  it("leaves spaces and punctuation unchanged in every style", () => {
    const result = tool.execute({ text: "Hi, world!", style: "bold" }, ctx);
    expect(result.data.styledText).toContain(", ");
    expect(result.data.styledText.endsWith("!")).toBe(true);
  });

  it("rejects empty text", () => {
    const result = tool.execute({ text: "   ", style: "bold" }, ctx);
    expect(result.data.error).toBe("empty-text");
  });

  it("falls back to bold for an unrecognized style", () => {
    const result = tool.execute({ text: "A", style: "nonexistent" as never }, ctx);
    expect(result.data.styledText).toBe("𝐀");
  });
});

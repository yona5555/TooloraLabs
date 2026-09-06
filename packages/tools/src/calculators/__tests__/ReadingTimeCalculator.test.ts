import { describe, expect, it } from "vitest";
import { ReadingTimeCalculator, READING_SPEED_PRESETS } from "../ReadingTimeCalculator";

const ctx = { locale: "en-US" };

function words(count: number): string {
  return Array.from({ length: count }, (_, i) => `word${i}`).join(" ");
}

describe("ReadingTimeCalculator", () => {
  const tool = new ReadingTimeCalculator();

  it("computes reading time at the average preset", () => {
    const result = tool.execute({ text: words(230), wordsPerMinute: READING_SPEED_PRESETS.average }, ctx);
    expect(result.data.error).toBeNull();
    expect(result.data.wordCount).toBe(230);
    expect(result.data.minutes).toBe(1);
    expect(result.data.seconds).toBe(0);
  });

  it("computes reading time under one minute", () => {
    const result = tool.execute({ text: words(115), wordsPerMinute: 230 }, ctx);
    expect(result.data.minutes).toBe(0);
    expect(result.data.seconds).toBe(30);
  });

  it("computes reading time over multiple minutes", () => {
    const result = tool.execute({ text: words(690), wordsPerMinute: 230 }, ctx);
    expect(result.data.minutes).toBe(3);
    expect(result.data.seconds).toBe(0);
  });

  it("counts words correctly with extra whitespace", () => {
    const result = tool.execute({ text: "  hello   world  ", wordsPerMinute: 200 }, ctx);
    expect(result.data.wordCount).toBe(2);
  });

  it("rejects empty text", () => {
    const result = tool.execute({ text: "   ", wordsPerMinute: 200 }, ctx);
    expect(result.data.error).toBe("empty-text");
  });

  it("rejects a zero or negative reading rate", () => {
    const result = tool.execute({ text: "hello world", wordsPerMinute: 0 }, ctx);
    expect(result.data.error).toBe("invalid-rate");
  });

  it("rejects an unreasonably high reading rate", () => {
    const result = tool.execute({ text: "hello world", wordsPerMinute: 5000 }, ctx);
    expect(result.data.error).toBe("invalid-rate");
  });

  it("exposes the three standard presets", () => {
    expect(READING_SPEED_PRESETS.slow).toBe(150);
    expect(READING_SPEED_PRESETS.average).toBe(230);
    expect(READING_SPEED_PRESETS.fast).toBe(300);
  });

  it("rounds seconds correctly without producing 60 seconds", () => {
    const result = tool.execute({ text: words(299), wordsPerMinute: 300 }, ctx);
    expect(result.data.seconds).toBeLessThan(60);
  });
});

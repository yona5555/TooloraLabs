import { describe, expect, it } from "vitest";
import { SpeechWordCountCalculator, SPEECH_PACE_PRESETS } from "../SpeechWordCountCalculator";

const ctx = { locale: "en-US" };

function words(count: number): string {
  return Array.from({ length: count }, (_, i) => `word${i}`).join(" ");
}

describe("SpeechWordCountCalculator", () => {
  const tool = new SpeechWordCountCalculator();

  it("computes speaking time at the normal preset", () => {
    const result = tool.execute({ text: words(140), wordsPerMinute: SPEECH_PACE_PRESETS.normal }, ctx);
    expect(result.data.error).toBeNull();
    expect(result.data.wordCount).toBe(140);
    expect(result.data.minutes).toBe(1);
    expect(result.data.seconds).toBe(0);
  });

  it("computes speaking time under one minute", () => {
    const result = tool.execute({ text: words(70), wordsPerMinute: 140 }, ctx);
    expect(result.data.minutes).toBe(0);
    expect(result.data.seconds).toBe(30);
  });

  it("computes speaking time over multiple minutes", () => {
    const result = tool.execute({ text: words(420), wordsPerMinute: 140 }, ctx);
    expect(result.data.minutes).toBe(3);
    expect(result.data.seconds).toBe(0);
  });

  it("uses a slower pace for the formal preset than the fast preset", () => {
    expect(SPEECH_PACE_PRESETS.formal).toBeLessThan(SPEECH_PACE_PRESETS.normal);
    expect(SPEECH_PACE_PRESETS.normal).toBeLessThan(SPEECH_PACE_PRESETS.fast);
  });

  it("counts words correctly with extra whitespace", () => {
    const result = tool.execute({ text: "  hello   world  ", wordsPerMinute: 140 }, ctx);
    expect(result.data.wordCount).toBe(2);
  });

  it("rejects empty text", () => {
    const result = tool.execute({ text: "   ", wordsPerMinute: 140 }, ctx);
    expect(result.data.error).toBe("empty-text");
  });

  it("rejects a zero or negative pace", () => {
    const result = tool.execute({ text: "hello world", wordsPerMinute: 0 }, ctx);
    expect(result.data.error).toBe("invalid-rate");
  });

  it("rejects an unreasonably high pace", () => {
    const result = tool.execute({ text: "hello world", wordsPerMinute: 1000 }, ctx);
    expect(result.data.error).toBe("invalid-rate");
  });
});

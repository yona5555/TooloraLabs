import { describe, expect, it } from "vitest";
import { TextToSpeechCalculator } from "../TextToSpeechCalculator";

const ctx = { locale: "en-US" };

describe("TextToSpeechCalculator", () => {
  const tool = new TextToSpeechCalculator();

  it("returns a single chunk for short text", () => {
    const result = tool.execute({ text: "Hello world.", rate: 1, pitch: 1 }, ctx);
    expect(result.data.error).toBeNull();
    expect(result.data.chunks).toEqual(["Hello world."]);
    expect(result.data.characterCount).toBe(12);
  });

  it("splits long text into multiple chunks at sentence boundaries", () => {
    const sentence = "This is a sentence that repeats. ";
    const text = sentence.repeat(20).trim();
    const result = tool.execute({ text, rate: 1, pitch: 1, maxChunkLength: 100 }, ctx);
    expect(result.data.error).toBeNull();
    expect(result.data.chunks.length).toBeGreaterThan(1);
    for (const chunk of result.data.chunks) {
      expect(chunk.length).toBeLessThanOrEqual(100);
    }
    // Rejoining chunks should reconstruct all the original words.
    const rejoined = result.data.chunks.join(" ");
    expect(rejoined.split(/\s+/).length).toBe(text.split(/\s+/).length);
  });

  it("splits an extremely long single sentence by words", () => {
    const words = Array.from({ length: 50 }, (_, i) => `word${i}`);
    const text = words.join(" ") + ".";
    const result = tool.execute({ text, rate: 1, pitch: 1, maxChunkLength: 50 }, ctx);
    expect(result.data.error).toBeNull();
    expect(result.data.chunks.length).toBeGreaterThan(1);
    for (const chunk of result.data.chunks) {
      expect(chunk.length).toBeLessThanOrEqual(50);
    }
  });

  it("rejects empty text", () => {
    const result = tool.execute({ text: "   ", rate: 1, pitch: 1 }, ctx);
    expect(result.data.error).toBe("empty-text");
  });

  it("rejects a rate below the minimum", () => {
    const result = tool.execute({ text: "Hello", rate: 0.05, pitch: 1 }, ctx);
    expect(result.data.error).toBe("invalid-rate");
  });

  it("rejects a rate above the maximum", () => {
    const result = tool.execute({ text: "Hello", rate: 11, pitch: 1 }, ctx);
    expect(result.data.error).toBe("invalid-rate");
  });

  it("rejects a pitch outside 0-2", () => {
    const result = tool.execute({ text: "Hello", rate: 1, pitch: 2.5 }, ctx);
    expect(result.data.error).toBe("invalid-pitch");
  });

  it("accepts boundary rate and pitch values", () => {
    const result = tool.execute({ text: "Hello", rate: 0.1, pitch: 0 }, ctx);
    expect(result.data.error).toBeNull();
    const result2 = tool.execute({ text: "Hello", rate: 10, pitch: 2 }, ctx);
    expect(result2.data.error).toBeNull();
  });
});

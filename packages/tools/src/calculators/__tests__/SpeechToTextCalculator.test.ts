import { describe, expect, it } from "vitest";
import { SpeechToTextCalculator } from "../SpeechToTextCalculator";

const ctx = { locale: "en-US" };

describe("SpeechToTextCalculator", () => {
  const tool = new SpeechToTextCalculator();

  it("joins multiple segments with a single space", () => {
    const result = tool.execute({ segments: ["hello", "how are you"] }, ctx);
    expect(result.data.transcript).toBe("Hello how are you");
  });

  it("capitalizes the first letter of the transcript", () => {
    const result = tool.execute({ segments: ["this is a test"] }, ctx);
    expect(result.data.transcript).toBe("This is a test");
  });

  it("capitalizes the first letter after sentence-ending punctuation", () => {
    const result = tool.execute({ segments: ["hello there. how are you? i am fine!"] }, ctx);
    expect(result.data.transcript).toBe("Hello there. How are you? I am fine!");
  });

  it("collapses internal multiple spaces", () => {
    const result = tool.execute({ segments: ["hello    world"] }, ctx);
    expect(result.data.transcript).toBe("Hello world");
  });

  it("trims and skips empty segments", () => {
    const result = tool.execute({ segments: ["  hello  ", "", "   ", "world"] }, ctx);
    expect(result.data.transcript).toBe("Hello world");
  });

  it("returns an empty transcript and zero word count for no segments", () => {
    const result = tool.execute({ segments: [] }, ctx);
    expect(result.data.transcript).toBe("");
    expect(result.data.wordCount).toBe(0);
  });

  it("counts words correctly", () => {
    const result = tool.execute({ segments: ["the quick brown fox"] }, ctx);
    expect(result.data.wordCount).toBe(4);
  });

  it("does not alter already-capitalized text", () => {
    const result = tool.execute({ segments: ["Hello World. This Is Fine."] }, ctx);
    expect(result.data.transcript).toBe("Hello World. This Is Fine.");
  });
});

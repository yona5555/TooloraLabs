import { describe, expect, it } from "vitest";
import { LoremIpsumCalculator } from "../LoremIpsumCalculator";

const ctx = { locale: "en-US" };

function sequence(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("LoremIpsumCalculator", () => {
  const tool = new LoremIpsumCalculator();

  it("generates the exact word count requested", () => {
    const result = tool.execute({ unit: "words", count: 10, style: "classic", randomFn: sequence([0.1, 0.2, 0.3, 0.4]) }, ctx);
    expect(result.data.error).toBeNull();
    expect(result.data.wordCount).toBe(10);
  });

  it("capitalizes the first word", () => {
    const result = tool.execute({ unit: "words", count: 5, style: "classic", randomFn: sequence([0.5]) }, ctx);
    const firstWord = result.data.text.split(" ")[0];
    expect(firstWord[0]).toBe(firstWord[0].toUpperCase());
  });

  it("ends with a period", () => {
    const result = tool.execute({ unit: "words", count: 5, style: "classic", randomFn: sequence([0.5]) }, ctx);
    expect(result.data.text.endsWith(".")).toBe(true);
  });

  it("generates the requested number of sentences", () => {
    const result = tool.execute({ unit: "sentences", count: 3, style: "classic", randomFn: sequence([0.2, 0.4, 0.6, 0.8]) }, ctx);
    const sentenceCount = result.data.text.split(".").filter((s) => s.trim()).length;
    expect(sentenceCount).toBe(3);
  });

  it("generates the requested number of paragraphs separated by blank lines", () => {
    const result = tool.execute({ unit: "paragraphs", count: 2, style: "classic", randomFn: sequence([0.1, 0.3, 0.5, 0.7, 0.9]) }, ctx);
    const paragraphs = result.data.text.split("\n\n");
    expect(paragraphs).toHaveLength(2);
  });

  it("starts with the classic opening when requested", () => {
    const result = tool.execute({ unit: "sentences", count: 2, style: "classic", startWithLorem: true, randomFn: sequence([0.5]) }, ctx);
    expect(result.data.text.startsWith("Lorem ipsum dolor sit amet")).toBe(true);
  });

  it("ignores startWithLorem for modern style", () => {
    const result = tool.execute({ unit: "sentences", count: 1, style: "modern", startWithLorem: true, randomFn: sequence([0.1]) }, ctx);
    expect(result.data.text.startsWith("Lorem ipsum")).toBe(false);
  });

  it("uses modern vocabulary for modern style", () => {
    const result = tool.execute({ unit: "words", count: 20, style: "modern", randomFn: sequence([0.05, 0.15, 0.25, 0.35, 0.45]) }, ctx);
    expect(result.data.text.toLowerCase()).not.toMatch(/\blorem\b|\bipsum\b/);
  });

  it("rejects a count below the minimum", () => {
    const result = tool.execute({ unit: "words", count: 0, style: "classic" }, ctx);
    expect(result.data.error).toBe("invalid-count");
  });

  it("rejects a count above the maximum", () => {
    const result = tool.execute({ unit: "paragraphs", count: 51, style: "classic" }, ctx);
    expect(result.data.error).toBe("invalid-count");
  });

  it("is deterministic given the same randomFn sequence", () => {
    const makeRandomFn = () => sequence([0.1, 0.2, 0.3, 0.4, 0.5, 0.6]);
    const r1 = tool.execute({ unit: "sentences", count: 2, style: "classic", randomFn: makeRandomFn() }, ctx);
    const r2 = tool.execute({ unit: "sentences", count: 2, style: "classic", randomFn: makeRandomFn() }, ctx);
    expect(r1.data.text).toBe(r2.data.text);
  });
});

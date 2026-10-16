import { describe, expect, it } from "vitest";
import {
  LOREM_SENTENCES_PER_PARAGRAPH,
  LOREM_WORDS_PER_SENTENCE,
  LoremIpsumCalculator,
  loremWordBankSize,
  loremWordRange,
  seededLoremRandom,
  type LoremStyle,
  type LoremUnit,
} from "../LoremIpsumCalculator";
import { countWords, splitParagraphs, splitSentences } from "../../analyzers/textSegmentation";

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

  it("seededLoremRandom is deterministic per seed and stays in [0, 1)", () => {
    const a = seededLoremRandom(42);
    const b = seededLoremRandom(42);
    const c = seededLoremRandom(7);
    const seqA = Array.from({ length: 20 }, a);
    expect(seqA).toEqual(Array.from({ length: 20 }, b));
    expect(seqA).not.toEqual(Array.from({ length: 20 }, c));
    for (const v of seqA) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("reports the word bank sizes", () => {
    expect(loremWordBankSize("classic")).toBe(62);
    expect(loremWordBankSize("modern")).toBe(51);
  });

  it("loremWordRange rejects invalid counts and is exact for words", () => {
    expect(loremWordRange({ unit: "words", count: 0, style: "classic" })).toBeNull();
    expect(loremWordRange({ unit: "paragraphs", count: 51, style: "classic" })).toBeNull();
    expect(loremWordRange({ unit: "sentences", count: 2.5, style: "classic" })).toBeNull();
    expect(loremWordRange({ unit: "words", count: 12, style: "modern" })).toEqual({ min: 12, max: 12, expected: 12 });
  });

  it("loremWordRange counts the 8-word classic opening only for classic style", () => {
    expect(loremWordRange({ unit: "sentences", count: 3, style: "classic", startWithLorem: true })).toEqual({ min: 18, max: 36, expected: 27 });
    expect(loremWordRange({ unit: "sentences", count: 3, style: "modern", startWithLorem: true })).toEqual({ min: 15, max: 42, expected: 28.5 });
    expect(loremWordRange({ unit: "paragraphs", count: 2, style: "classic", startWithLorem: true })).toEqual({ min: 38, max: 176, expected: 93.5 });
  });

  it("generated text always falls inside loremWordRange and the structural limits", () => {
    const units: LoremUnit[] = ["paragraphs", "sentences", "words"];
    const styles: LoremStyle[] = ["classic", "modern"];
    for (const unit of units)
      for (const style of styles)
        for (const startWithLorem of [true, false])
          for (let seed = 1; seed <= 15; seed++) {
            const count = (seed % 6) + 1;
            const out = tool.execute({ unit, count, style, startWithLorem, randomFn: seededLoremRandom(seed) }, ctx).data;
            const range = loremWordRange({ unit, count, style, startWithLorem })!;
            expect(out.wordCount).toBe(countWords(out.text));
            expect(out.wordCount).toBeGreaterThanOrEqual(range.min);
            expect(out.wordCount).toBeLessThanOrEqual(range.max);
            const paragraphs = splitParagraphs(out.text);
            expect(paragraphs).toHaveLength(unit === "paragraphs" ? count : 1);
            const sentences = splitSentences(out.text);
            if (unit === "sentences") expect(sentences).toHaveLength(count);
            if (unit === "paragraphs") {
              for (const p of paragraphs) {
                const n = splitSentences(out.text.slice(p.start, p.end)).length;
                expect(n).toBeGreaterThanOrEqual(LOREM_SENTENCES_PER_PARAGRAPH.min);
                expect(n).toBeLessThanOrEqual(LOREM_SENTENCES_PER_PARAGRAPH.max + 1);
              }
            }
            if (unit !== "words")
              for (const s of sentences) {
                const n = countWords(out.text.slice(s.start, s.end));
                expect(n).toBeGreaterThanOrEqual(LOREM_WORDS_PER_SENTENCE.min);
                expect(n).toBeLessThanOrEqual(LOREM_WORDS_PER_SENTENCE.max);
              }
          }
  });
});

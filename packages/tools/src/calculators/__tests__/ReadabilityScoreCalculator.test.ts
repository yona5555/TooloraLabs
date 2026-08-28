import { describe, it, expect } from "vitest";
import { ReadabilityScoreCalculator, countSyllablesInWord } from "../ReadabilityScoreCalculator";

const context = { locale: "en-US" };
const calc = new ReadabilityScoreCalculator();

describe("countSyllablesInWord", () => {
  it("treats short words (length <= 3) as one syllable", () => {
    expect(countSyllablesInWord("the")).toBe(1);
    expect(countSyllablesInWord("a")).toBe(1);
    expect(countSyllablesInWord("I")).toBe(1);
    expect(countSyllablesInWord("on")).toBe(1);
    expect(countSyllablesInWord("cat")).toBe(1);
  });

  it("drops a standard silent trailing e", () => {
    expect(countSyllablesInWord("make")).toBe(1);
    expect(countSyllablesInWord("whale")).toBe(1);
    expect(countSyllablesInWord("hope")).toBe(1);
  });

  it("keeps the trailing e for syllabic consonant+le endings", () => {
    expect(countSyllablesInWord("simple")).toBe(2);
    expect(countSyllablesInWord("table")).toBe(2);
    expect(countSyllablesInWord("apple")).toBe(2);
    expect(countSyllablesInWord("little")).toBe(2);
  });

  it("handles the classic 'queue' edge case as a single syllable", () => {
    expect(countSyllablesInWord("queue")).toBe(1);
  });

  it("counts multi-syllable words via vowel groups", () => {
    expect(countSyllablesInWord("sunny")).toBe(2);
    expect(countSyllablesInWord("happy")).toBe(2);
  });

  it("returns 0 for a token with no letters at all", () => {
    expect(countSyllablesInWord("42")).toBe(0);
    expect(countSyllablesInWord("--")).toBe(0);
  });

  it("is case-insensitive and strips punctuation", () => {
    expect(countSyllablesInWord("THE.")).toBe(1);
    expect(countSyllablesInWord("Simple,")).toBe(2);
  });
});

describe("ReadabilityScoreCalculator", () => {
  it("computes word, sentence, and syllable counts for a short passage", () => {
    const text = "The cat sat on the mat. It was a sunny day, and the cat felt happy.";
    const r = calc.execute({ text }, context);
    expect(r.data.error).toBeNull();
    expect(r.data.wordCount).toBe(16);
    expect(r.data.sentenceCount).toBe(2);
    expect(r.data.syllableCount).toBe(18);
    expect(r.data.averageWordsPerSentence).toBe(8);
    expect(r.data.averageSyllablesPerWord).toBe(1.125);
  });

  it("applies the Flesch Reading Ease and Flesch-Kincaid Grade Level formulas", () => {
    const text = "The cat sat on the mat. It was a sunny day, and the cat felt happy.";
    const r = calc.execute({ text }, context);
    // 206.835 - 1.015*(16/2) - 84.6*(18/16)
    expect(r.data.fleschReadingEase).toBeCloseTo(103.54, 5);
    // 0.39*(16/2) + 11.8*(18/16) - 15.59
    expect(r.data.fleschKincaidGrade).toBeCloseTo(0.805, 5);
  });

  it("maps a high reading-ease score to the 'very-easy' band", () => {
    const text = "The cat sat on the mat. It was a sunny day, and the cat felt happy.";
    const r = calc.execute({ text }, context);
    expect(r.data.readingEaseLabel).toBe("very-easy");
  });

  it("maps a dense, jargon-heavy passage to a low, difficult band", () => {
    const text =
      "The implementation of interdisciplinary organizational methodologies necessitates comprehensive institutional reconceptualization, particularly regarding administrative accountability infrastructures.";
    const r = calc.execute({ text }, context);
    expect(r.data.error).toBeNull();
    expect(r.data.fleschReadingEase).toBeLessThan(30);
    expect(r.data.readingEaseLabel).toBe("very-confusing");
    expect(r.data.fleschKincaidGrade).toBeGreaterThan(12);
  });

  it("flags empty input", () => {
    const r = calc.execute({ text: "" }, context);
    expect(r.data.error).toBe("empty-text");
    expect(r.data.wordCount).toBe(0);
    expect(r.data.readingEaseLabel).toBeNull();
  });

  it("flags whitespace-only input", () => {
    const r = calc.execute({ text: "   \n\t  " }, context);
    expect(r.data.error).toBe("empty-text");
  });

  it("flags text with words but no terminal punctuation as having no sentences", () => {
    const r = calc.execute({ text: "This has words but no ending punctuation" }, context);
    expect(r.data.error).toBe("no-sentences");
    expect(r.data.wordCount).toBe(0);
    expect(r.data.sentenceCount).toBe(0);
  });

  it("handles a single short sentence", () => {
    const r = calc.execute({ text: "I am happy." }, context);
    expect(r.data.error).toBeNull();
    expect(r.data.wordCount).toBe(3);
    expect(r.data.sentenceCount).toBe(1);
  });

  it("counts multiple sentence terminators (?, !) correctly", () => {
    const r = calc.execute({ text: "Are you happy? Yes! I am." }, context);
    expect(r.data.error).toBeNull();
    expect(r.data.sentenceCount).toBe(3);
  });
});

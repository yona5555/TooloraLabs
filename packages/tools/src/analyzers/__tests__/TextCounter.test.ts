import { describe, it, expect } from "vitest";
import { TextCounter } from "../TextCounter";

const tool = new TextCounter();
const ctx = { locale: "en-US" };

describe("TextCounter", () => {
  it("counts words, characters, and sentences", () => {
    const output = tool.execute(
      { text: "Hello world. How are you?" },
      ctx
    );
    expect(output.data.words).toBe(5);
    expect(output.data.characters).toBe(25);
    expect(output.data.sentences).toBe(2);
  });

  it("counts characters without spaces separately", () => {
    const output = tool.execute({ text: "a b c" }, ctx);
    expect(output.data.characters).toBe(5);
    expect(output.data.charactersNoSpaces).toBe(3);
  });

  it("counts paragraphs separated by blank lines", () => {
    const output = tool.execute(
      { text: "First paragraph.\n\nSecond paragraph." },
      ctx
    );
    expect(output.data.paragraphs).toBe(2);
  });

  it("returns all zeros for empty input", () => {
    const output = tool.execute({ text: "" }, ctx);
    expect(output.data).toEqual({
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
      uniqueWords: 0,
      averageWordLength: 0,
      longestWord: "",
      topKeywords: [],
    });
  });

  it("estimates reading time at 200 words per minute", () => {
    const text = Array(201).fill("word").join(" ");
    const output = tool.execute({ text }, ctx);
    expect(output.data.words).toBe(201);
    expect(output.data.readingTimeMinutes).toBe(2);
  });

  it("counts unique words case-insensitively and ignoring punctuation", () => {
    const output = tool.execute({ text: "Cat cat CAT, dog." }, ctx);
    expect(output.data.uniqueWords).toBe(2);
  });

  it("computes average word length and the longest word", () => {
    const output = tool.execute({ text: "a bb ccc" }, ctx);
    expect(output.data.averageWordLength).toBe(2);
    expect(output.data.longestWord).toBe("ccc");
  });

  it("ranks top keywords by frequency, excluding stopwords", () => {
    const output = tool.execute(
      { text: "the quick fox jumps over the lazy fox and the quick fox runs" },
      ctx
    );
    expect(output.data.topKeywords[0]).toEqual({ word: "fox", count: 3 });
    expect(output.data.topKeywords.map((k) => k.word)).not.toContain("the");
  });

  it("returns an empty keyword list when every word is a stopword", () => {
    const output = tool.execute({ text: "the a an of to" }, ctx);
    expect(output.data.topKeywords).toEqual([]);
  });
});

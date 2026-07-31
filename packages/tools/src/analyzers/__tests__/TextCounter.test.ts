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
    });
  });

  it("estimates reading time at 200 words per minute", () => {
    const text = Array(201).fill("word").join(" ");
    const output = tool.execute({ text }, ctx);
    expect(output.data.words).toBe(201);
    expect(output.data.readingTimeMinutes).toBe(2);
  });
});

import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseTool } from "@tooloralabs/sdk";

export type TextCounterInput = {
  text: string;
};

export type TextCounterOutput = {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
};

const WORDS_PER_MINUTE = 200;

export class TextCounter extends BaseTool<TextCounterInput, TextCounterOutput> {
  metadata = {
    id: "word-counter",
    slug: "word-counter",
    name: "Word & Character Counter",
    category: "text-tools",
    description: "Count words, characters, sentences, and estimate reading time.",
    version: "1.0.0",
  };

  execute(
    input: TextCounterInput,
    _context: ToolContext
  ): ToolResult<TextCounterOutput> {
    const text = input.text;
    const trimmed = text.trim();

    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
    const sentences =
      trimmed === "" ? 0 : (trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? []).length;
    const paragraphs =
      trimmed === ""
        ? 0
        : trimmed.split(/\n+/).filter((p) => p.trim() !== "").length;
    const readingTimeMinutes =
      words === 0 ? 0 : Math.ceil(words / WORDS_PER_MINUTE);

    return {
      success: true,
      data: {
        characters,
        charactersNoSpaces,
        words,
        sentences,
        paragraphs,
        readingTimeMinutes,
      },
      metadata: {},
    };
  }
}

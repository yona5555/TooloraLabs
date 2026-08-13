import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseTool } from "@tooloralabs/sdk";

export type TextCounterInput = {
  text: string;
};

export type KeywordCount = {
  word: string;
  count: number;
};

export type TextCounterOutput = {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  uniqueWords: number;
  averageWordLength: number;
  longestWord: string;
  topKeywords: KeywordCount[];
};

const WORDS_PER_MINUTE = 200;

// Short, high-frequency function words excluded from keyword-density ranking
// so the top list surfaces topic words instead of grammatical glue.
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "at", "for", "with",
  "is", "are", "was", "were", "be", "been", "being", "this", "that", "these", "those",
  "it", "its", "as", "by", "from", "into", "than", "then", "so", "if", "not", "no",
  "do", "does", "did", "have", "has", "had", "i", "you", "he", "she", "we", "they",
  "his", "her", "their", "our", "your", "my", "me", "him", "them", "us", "will", "can",
  "في", "من", "إلى", "على", "عن", "مع", "هذا", "هذه", "ذلك", "تلك", "الذي", "التي",
  "و", "أو", "لا", "ما", "لم", "لن", "كان", "كانت", "يكون", "هو", "هي", "هم", "أنا",
  "أنت", "نحن", "أن", "إن", "قد", "كل", "بعض", "ثم", "حتى", "إذا",
]);

function extractWords(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}'-]+/gu) ?? [];
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export class TextCounter extends BaseTool<TextCounterInput, TextCounterOutput> {
  metadata = {
    id: "word-counter",
    slug: "word-counter",
    name: "Word & Character Counter",
    category: "text-tools",
    description:
      "Count words, characters, and sentences; estimate reading time; and see your top keywords by frequency.",
    version: "1.1.0",
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

    const wordTokens = extractWords(trimmed);
    const uniqueWords = new Set(wordTokens).size;
    const averageWordLength =
      wordTokens.length === 0
        ? 0
        : round(wordTokens.reduce((sum, w) => sum + w.length, 0) / wordTokens.length);
    const longestWord = wordTokens.reduce(
      (longest, w) => (w.length > longest.length ? w : longest),
      ""
    );

    const frequency = new Map<string, number>();
    for (const w of wordTokens) {
      if (w.length < 2 || STOPWORDS.has(w)) continue;
      frequency.set(w, (frequency.get(w) ?? 0) + 1);
    }
    const topKeywords: KeywordCount[] = [...frequency.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({ word, count }));

    return {
      success: true,
      data: {
        characters,
        charactersNoSpaces,
        words,
        sentences,
        paragraphs,
        readingTimeMinutes,
        uniqueWords,
        averageWordLength,
        longestWord,
        topKeywords,
      },
      metadata: {},
    };
  }
}

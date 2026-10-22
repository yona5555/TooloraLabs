import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseTool } from "@tooloralabs/sdk";
import { countSentences, splitParagraphs, tokenizeWords, wordLength } from "./textSegmentation";

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
export const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "at", "for", "with",
  "is", "are", "was", "were", "be", "been", "being", "this", "that", "these", "those",
  "it", "its", "as", "by", "from", "into", "than", "then", "so", "if", "not", "no",
  "do", "does", "did", "have", "has", "had", "i", "you", "he", "she", "we", "they",
  "his", "her", "their", "our", "your", "my", "me", "him", "them", "us", "will", "can",
  "في", "من", "إلى", "على", "عن", "مع", "هذا", "هذه", "ذلك", "تلك", "الذي", "التي",
  "و", "أو", "لا", "ما", "لم", "لن", "كان", "كانت", "يكون", "هو", "هي", "هم", "أنا",
  "أنت", "نحن", "أن", "إن", "قد", "كل", "بعض", "ثم", "حتى", "إذا",
]);

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
    version: "1.2.0",
  };

  execute(
    input: TextCounterInput,
    _context: ToolContext
  ): ToolResult<TextCounterOutput> {
    const text = input.text;

    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const tokens = tokenizeWords(text);
    const wordTokens = tokens.map((t) => t.key);
    const words = tokens.length;
    const sentences = countSentences(text);
    const paragraphs = splitParagraphs(text).length;
    const readingTimeMinutes =
      words === 0 ? 0 : Math.ceil(words / WORDS_PER_MINUTE);

    const uniqueWords = new Set(wordTokens).size;
    const averageWordLength =
      words === 0
        ? 0
        : round(tokens.reduce((sum, t) => sum + wordLength(t.word), 0) / words);
    const longestWord = tokens.reduce(
      (longest, t) => (wordLength(t.word) > wordLength(longest) ? t.word : longest),
      ""
    );

    const frequency = new Map<string, number>();
    for (const w of wordTokens) {
      if (wordLength(w) < 2 || STOPWORDS.has(w)) continue;
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

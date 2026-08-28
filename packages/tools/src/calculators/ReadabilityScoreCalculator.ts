import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type ReadabilityScoreCalculatorInput = {
  text: string;
};

export type ReadabilityScoreCalculatorError = "empty-text" | "no-sentences";

export type ReadabilityBand =
  | "very-easy"
  | "easy"
  | "fairly-easy"
  | "standard"
  | "fairly-difficult"
  | "difficult"
  | "very-confusing";

export type ReadabilityScoreCalculatorOutput = {
  error: ReadabilityScoreCalculatorError | null;
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  averageWordsPerSentence: number;
  averageSyllablesPerWord: number;
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  readingEaseLabel: ReadabilityBand | null;
};

function clean(value: number): number {
  return Number(value.toPrecision(10));
}

/**
 * Splits raw text into word tokens on whitespace, discarding tokens with no
 * letters or digits (stray punctuation, bullets, dashes on their own, etc.).
 */
function tokenizeWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => /[A-Za-z0-9]/.test(token));
}

/**
 * Splits raw text into sentence-like chunks by grouping runs of characters
 * that end in one or more sentence-terminating marks (. ! ?), optionally
 * followed by a closing quote or bracket. This is a heuristic — it does not
 * understand abbreviations (e.g. "Dr.") or decimal numbers — appropriate for
 * an estimate of readability rather than exact linguistic sentence parsing.
 */
function splitSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+[.!?]+(?:['")\]]*)/g);
  if (!matches) return [];
  return matches.map((s) => s.trim()).filter((s) => s.length > 0 && /[A-Za-z0-9]/.test(s));
}

/**
 * Heuristic English syllable counter based on vowel-group counting with a
 * standard silent-e adjustment. Not linguistically perfect, but handles the
 * classic tricky cases: short words ("the", "a"), words ending in a
 * consonant + silent "e" ("make"), and words ending in a syllabic
 * "consonant + le" ("simple", "table") where the trailing "e" is NOT silent.
 */
export function countSyllablesInWord(rawWord: string): number {
  const word = rawWord.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length === 0) return 0;
  if (word.length <= 3) return 1;

  let working = word;

  // A trailing "e" is silent unless it's part of a syllabic "consonant + le"
  // ending (simple, table, apple) — recognizable because the letter before
  // the "l" is itself a consonant rather than a vowel (compare "whale").
  const endsWithSyllabicLe = /[^aeiouy]le$/.test(working);
  if (working.endsWith("e") && !endsWithSyllabicLe) {
    working = working.slice(0, -1);
  }

  const vowelGroups = working.match(/[aeiouy]+/g);
  const count = vowelGroups ? vowelGroups.length : 0;
  return count === 0 ? 1 : count;
}

function bandFor(fleschReadingEase: number): ReadabilityBand {
  if (fleschReadingEase >= 90) return "very-easy";
  if (fleschReadingEase >= 80) return "easy";
  if (fleschReadingEase >= 70) return "fairly-easy";
  if (fleschReadingEase >= 60) return "standard";
  if (fleschReadingEase >= 50) return "fairly-difficult";
  if (fleschReadingEase >= 30) return "difficult";
  return "very-confusing";
}

export class ReadabilityScoreCalculator extends BaseCalculator<
  ReadabilityScoreCalculatorInput,
  ReadabilityScoreCalculatorOutput
> {
  metadata = {
    id: "readability-score-calculator",
    slug: "readability-score-calculator",
    name: "Readability Score Calculator",
    category: "text-tools",
    description:
      "Calculate the Flesch Reading Ease score and Flesch-Kincaid Grade Level for a passage of English text.",
    version: "1.0.0",
  };

  execute(
    input: ReadabilityScoreCalculatorInput,
    _context: ToolContext
  ): ToolResult<ReadabilityScoreCalculatorOutput> {
    const trimmed = input.text.trim();
    if (trimmed.length === 0) {
      return this.errorResult("empty-text");
    }

    const words = tokenizeWords(trimmed);
    if (words.length === 0) {
      return this.errorResult("empty-text");
    }

    const sentences = splitSentences(trimmed);
    if (sentences.length === 0) {
      return this.errorResult("no-sentences");
    }

    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const syllableCount = words.reduce((sum, word) => sum + countSyllablesInWord(word), 0);

    const averageWordsPerSentence = wordCount / sentenceCount;
    const averageSyllablesPerWord = syllableCount / wordCount;

    const fleschReadingEase =
      206.835 - 1.015 * averageWordsPerSentence - 84.6 * averageSyllablesPerWord;
    const fleschKincaidGrade =
      0.39 * averageWordsPerSentence + 11.8 * averageSyllablesPerWord - 15.59;

    return this.ok({
      wordCount,
      sentenceCount,
      syllableCount,
      averageWordsPerSentence,
      averageSyllablesPerWord,
      fleschReadingEase,
      fleschKincaidGrade,
      readingEaseLabel: bandFor(fleschReadingEase),
    });
  }

  private ok(
    data: Omit<ReadabilityScoreCalculatorOutput, "error">
  ): ToolResult<ReadabilityScoreCalculatorOutput> {
    return {
      success: true,
      data: {
        error: null,
        wordCount: data.wordCount,
        sentenceCount: data.sentenceCount,
        syllableCount: data.syllableCount,
        averageWordsPerSentence: clean(data.averageWordsPerSentence),
        averageSyllablesPerWord: clean(data.averageSyllablesPerWord),
        fleschReadingEase: clean(data.fleschReadingEase),
        fleschKincaidGrade: clean(data.fleschKincaidGrade),
        readingEaseLabel: data.readingEaseLabel,
      },
      metadata: {},
    };
  }

  private errorResult(
    error: ReadabilityScoreCalculatorError
  ): ToolResult<ReadabilityScoreCalculatorOutput> {
    return {
      success: true,
      data: {
        error,
        wordCount: 0,
        sentenceCount: 0,
        syllableCount: 0,
        averageWordsPerSentence: 0,
        averageSyllablesPerWord: 0,
        fleschReadingEase: 0,
        fleschKincaidGrade: 0,
        readingEaseLabel: null,
      },
      metadata: {},
    };
  }
}

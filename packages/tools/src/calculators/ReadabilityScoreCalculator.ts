import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";
import { splitSentences as splitSentenceSpans, tokenizeWords as tokenizeWordSpans } from "../analyzers/textSegmentation";

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

/** Word tokens (script-aware: diacritics and matras stay inside their word). */
function tokenizeWords(text: string): string[] {
  return tokenizeWordSpans(text).map((t) => t.word);
}

const TERMINATED = /[.!?\u061F\u061B\u06D4\u0964\u0965\u2026\u203C\u2047-\u2049\u3002\uFF01\uFF0E\uFF1F]["'\u201D\u2019\u00BB)\]}\u300D\u300F]*$/u;

/**
 * Sentence chunks, ending on . ! ? ؟ ؛ । and the other terminators the shared segmenter knows.
 * Only terminated chunks count, so a text without any end mark reports no sentences.
 */
function splitSentences(text: string): string[] {
  return splitSentenceSpans(text)
    .map((s) => text.slice(s.start, s.end))
    .filter((s) => TERMINATED.test(s));
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

/** Flesch Reading Ease from average words per sentence and syllables per word (Flesch, 1948). */
export function fleschReadingEaseOf(averageWordsPerSentence: number, averageSyllablesPerWord: number): number {
  return 206.835 - 1.015 * averageWordsPerSentence - 84.6 * averageSyllablesPerWord;
}

/** Flesch-Kincaid Grade Level from the same two averages (Kincaid et al., 1975). */
export function fleschKincaidGradeOf(averageWordsPerSentence: number, averageSyllablesPerWord: number): number {
  return 0.39 * averageWordsPerSentence + 11.8 * averageSyllablesPerWord - 15.59;
}

export type ReadabilitySentence = {
  index: number;
  /** UTF-16 offsets into the analyzed text. */
  start: number;
  end: number;
  /** Only terminated sentences count toward the score. */
  terminated: boolean;
  words: number;
  syllables: number;
};

export type ReadabilityWord = {
  word: string;
  key: string;
  start: number;
  end: number;
  syllables: number;
  /** Index into `sentences` of the sentence span that holds this word. */
  sentence: number;
};

/**
 * Per-sentence and per-word breakdown behind the score, with offsets into `text` (not trimmed), for
 * highlighting. Uses the same segmentation, terminator rule and syllable counter as `execute`.
 */
export function readabilityBreakdown(text: string): { sentences: ReadabilitySentence[]; words: ReadabilityWord[] } {
  const spans = splitSentenceSpans(text);
  const sentences: ReadabilitySentence[] = spans.map((s, index) => ({
    index,
    start: s.start,
    end: s.end,
    terminated: TERMINATED.test(text.slice(s.start, s.end)),
    words: 0,
    syllables: 0,
  }));
  const words: ReadabilityWord[] = [];
  let si = 0;
  for (const tok of tokenizeWordSpans(text)) {
    while (si < spans.length - 1 && tok.start >= spans[si].end) si++;
    const syllables = countSyllablesInWord(tok.word);
    const sentence = sentences[si];
    if (sentence) {
      sentence.words++;
      sentence.syllables += syllables;
    }
    words.push({ ...tok, syllables, sentence: si });
  }
  return { sentences, words };
}

export function readabilityBandFor(fleschReadingEase: number): ReadabilityBand {
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

    const fleschReadingEase = fleschReadingEaseOf(averageWordsPerSentence, averageSyllablesPerWord);
    const fleschKincaidGrade = fleschKincaidGradeOf(averageWordsPerSentence, averageSyllablesPerWord);

    return this.ok({
      wordCount,
      sentenceCount,
      syllableCount,
      averageWordsPerSentence,
      averageSyllablesPerWord,
      fleschReadingEase,
      fleschKincaidGrade,
      readingEaseLabel: readabilityBandFor(fleschReadingEase),
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

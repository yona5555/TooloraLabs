import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";
import { countWords } from "../analyzers/textSegmentation";

export type LoremUnit = "paragraphs" | "sentences" | "words";
export type LoremStyle = "classic" | "modern";

export type LoremIpsumInput = {
  unit: LoremUnit;
  count: number;
  style: LoremStyle;
  /** Only applies to "classic" style; ignored otherwise. */
  startWithLorem?: boolean;
  /** Injectable RNG for deterministic testing; defaults to Math.random. */
  randomFn?: () => number;
};

export type LoremIpsumError = "invalid-count";

export type LoremIpsumOutput = {
  error: LoremIpsumError | null;
  text: string;
  wordCount: number;
};

const MIN_COUNT = 1;
const MAX_COUNT = 50;
const MIN_WORDS_PER_SENTENCE = 5;
const MAX_WORDS_PER_SENTENCE = 14;
const MIN_SENTENCES_PER_PARAGRAPH = 3;
const MAX_SENTENCES_PER_PARAGRAPH = 6;

/** Allowed "How many" range. */
export const LOREM_COUNT_RANGE = { min: MIN_COUNT, max: MAX_COUNT } as const;
/** Every generated sentence has this many words (the classic opening sentence excepted). */
export const LOREM_WORDS_PER_SENTENCE = { min: MIN_WORDS_PER_SENTENCE, max: MAX_WORDS_PER_SENTENCE } as const;
/** Every generated paragraph has this many random sentences (plus the opening sentence in paragraph 1, when enabled). */
export const LOREM_SENTENCES_PER_PARAGRAPH = { min: MIN_SENTENCES_PER_PARAGRAPH, max: MAX_SENTENCES_PER_PARAGRAPH } as const;

const CLASSIC_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
  "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim",
  "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi",
  "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit",
  "voluptate", "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt",
  "mollit", "anim", "id", "est", "laborum",
];

const MODERN_WORDS = [
  "synergy", "leverage", "disrupt", "innovative", "scalable", "paradigm", "bandwidth", "ecosystem",
  "agile", "pivot", "streamline", "optimize", "framework", "holistic", "actionable", "robust",
  "seamless", "empower", "iterate", "onboard", "deliverable", "stakeholder", "roadmap", "bootstrap",
  "cloud-native", "growth", "engagement", "workflow", "insight", "strategy", "milestone", "value",
  "proposition", "collaborative", "dynamic", "cutting-edge", "user-centric", "monetize", "vertical",
  "incubate", "accelerate", "transform", "sustainable", "impactful", "curate", "amplify", "unlock",
  "next-generation", "data-driven", "customer-first", "outcomes",
];

const CLASSIC_OPENING = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

/** Number of distinct words in a style's word bank. */
export function loremWordBankSize(style: LoremStyle): number {
  return (style === "modern" ? MODERN_WORDS : CLASSIC_WORDS).length;
}

/**
 * Deterministic pseudo-random source (linear congruential generator) for `randomFn`, so the same
 * seed always produces the same text — e.g. identical server and client renders.
 */
export function seededLoremRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

export type LoremWordRange = { min: number; max: number; expected: number };

/**
 * The word count a valid input can produce: the structural minimum and maximum and the mean of the
 * uniform sentence/paragraph lengths. Returns null for an invalid count.
 */
export function loremWordRange(input: Pick<LoremIpsumInput, "unit" | "count" | "style" | "startWithLorem">): LoremWordRange | null {
  const { unit, count } = input;
  if (!Number.isInteger(count) || count < MIN_COUNT || count > MAX_COUNT) return null;
  if (unit === "words") return { min: count, max: count, expected: count };
  const opening = Boolean(input.startWithLorem) && input.style === "classic" ? countWords(CLASSIC_OPENING) : 0;
  const meanSentence = (MIN_WORDS_PER_SENTENCE + MAX_WORDS_PER_SENTENCE) / 2;
  if (unit === "sentences") {
    const random = opening ? count - 1 : count;
    return {
      min: opening + random * MIN_WORDS_PER_SENTENCE,
      max: opening + random * MAX_WORDS_PER_SENTENCE,
      expected: opening + random * meanSentence,
    };
  }
  const meanParagraph = (MIN_SENTENCES_PER_PARAGRAPH + MAX_SENTENCES_PER_PARAGRAPH) / 2;
  return {
    min: opening + count * MIN_SENTENCES_PER_PARAGRAPH * MIN_WORDS_PER_SENTENCE,
    max: opening + count * MAX_SENTENCES_PER_PARAGRAPH * MAX_WORDS_PER_SENTENCE,
    expected: opening + count * meanParagraph * meanSentence,
  };
}

function randomInt(min: number, max: number, randomFn: () => number): number {
  return Math.floor(randomFn() * (max - min + 1)) + min;
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function pickWord(wordBank: string[], randomFn: () => number): string {
  return wordBank[Math.floor(randomFn() * wordBank.length)];
}

function generateSentence(wordBank: string[], randomFn: () => number): string {
  const wordCount = randomInt(MIN_WORDS_PER_SENTENCE, MAX_WORDS_PER_SENTENCE, randomFn);
  const words = Array.from({ length: wordCount }, () => pickWord(wordBank, randomFn));
  return `${capitalize(words[0])} ${words.slice(1).join(" ")}.`;
}

function generateParagraph(wordBank: string[], randomFn: () => number): string {
  const sentenceCount = randomInt(MIN_SENTENCES_PER_PARAGRAPH, MAX_SENTENCES_PER_PARAGRAPH, randomFn);
  return Array.from({ length: sentenceCount }, () => generateSentence(wordBank, randomFn)).join(" ");
}

export class LoremIpsumCalculator extends BaseCalculator<LoremIpsumInput, LoremIpsumOutput> {
  metadata = {
    id: "lorem-ipsum-generator",
    slug: "lorem-ipsum-generator",
    name: "Lorem Ipsum Generator",
    category: "text-tools",
    description: "Generate placeholder text in paragraphs, sentences, or words, in classic or modern style.",
    version: "1.0.0",
  };

  execute(input: LoremIpsumInput, _context: ToolContext): ToolResult<LoremIpsumOutput> {
    const { unit, count, style } = input;
    const randomFn = input.randomFn ?? Math.random;

    if (!Number.isInteger(count) || count < MIN_COUNT || count > MAX_COUNT) {
      return this.error("invalid-count");
    }

    const wordBank = style === "modern" ? MODERN_WORDS : CLASSIC_WORDS;
    const useOpening = Boolean(input.startWithLorem) && style === "classic";

    let text: string;

    if (unit === "words") {
      let words: string[];
      if (useOpening) {
        const openingWords = CLASSIC_OPENING.replace(",", "").replace(".", "").split(" ");
        const extra = Math.max(0, count - openingWords.length);
        words = openingWords.slice(0, count).concat(Array.from({ length: extra }, () => pickWord(wordBank, randomFn)));
      } else {
        words = Array.from({ length: count }, () => pickWord(wordBank, randomFn));
      }
      text = `${capitalize(words[0])} ${words.slice(1).join(" ")}.`;
    } else if (unit === "sentences") {
      const sentences = Array.from({ length: count }, (_, i) =>
        i === 0 && useOpening ? CLASSIC_OPENING : generateSentence(wordBank, randomFn),
      );
      text = sentences.join(" ");
    } else {
      const paragraphs = Array.from({ length: count }, (_, i) => {
        const paragraph = generateParagraph(wordBank, randomFn);
        return i === 0 && useOpening ? `${CLASSIC_OPENING} ${paragraph}` : paragraph;
      });
      text = paragraphs.join("\n\n");
    }

    const wordCount = countWords(text);

    return {
      success: true,
      data: { error: null, text, wordCount },
      metadata: {},
    };
  }

  private error(error: LoremIpsumError): ToolResult<LoremIpsumOutput> {
    return { success: true, data: { error, text: "", wordCount: 0 }, metadata: {} };
  }
}

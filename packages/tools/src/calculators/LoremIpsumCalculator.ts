import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

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
  const wordCount = randomInt(5, 14, randomFn);
  const words = Array.from({ length: wordCount }, () => pickWord(wordBank, randomFn));
  return `${capitalize(words[0])} ${words.slice(1).join(" ")}.`;
}

function generateParagraph(wordBank: string[], randomFn: () => number): string {
  const sentenceCount = randomInt(3, 6, randomFn);
  return Array.from({ length: sentenceCount }, () => generateSentence(wordBank, randomFn)).join(" ");
}

const CLASSIC_OPENING = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

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

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

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

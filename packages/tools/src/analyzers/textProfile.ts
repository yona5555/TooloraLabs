import { STOPWORDS } from "./TextCounter";
import { countWords, splitParagraphs, splitSentences, tokenizeWords, wordLength } from "./textSegmentation";

/** Silent-reading speed TextCounter already uses for its reading-time estimate. */
export const READING_WPM = 200;
/** Typical presentation speaking pace (words per minute). */
export const SPEAKING_WPM = 130;
/** LIX counts a word as "long" above this many letters. */
const LIX_LONG_WORD = 6;

export type TextComposition = {
  letters: number;
  digits: number;
  spaces: number;
  punctuation: number;
  other: number;
};

export type SentenceSpan = { index: number; start: number; end: number; words: number };
export type ParagraphSpan = { index: number; words: number; sentences: number; characters: number };
export type KeywordDensity = { word: string; count: number; density: number };
export type LetterCount = { letter: string; count: number };

export type TextProfile = {
  /** Character classes in UTF-16 units, so they always add up to `text.length`. */
  composition: TextComposition;
  sentences: SentenceSpan[];
  paragraphs: ParagraphSpan[];
  keywords: KeywordDensity[];
  letters: LetterCount[];
  /** wordLengths[i] = number of word tokens with i + 1 letters; the last bucket is "15 or more". */
  wordLengths: number[];
  averageSentenceLength: number;
  longWords: number;
  /** LIX readability = words per sentence + 100 × long words / words (language-agnostic). */
  lix: number;
  readingSeconds: number;
  speakingSeconds: number;
};

const WORD_LENGTH_BUCKETS = 15;

function classify(ch: string): keyof TextComposition {
  if (/\s/u.test(ch)) return "spaces";
  if (/[\p{L}\p{M}]/u.test(ch)) return "letters";
  if (/\p{N}/u.test(ch)) return "digits";
  if (/\p{P}/u.test(ch)) return "punctuation";
  return "other";
}

/**
 * Deeper breakdown of a text for live indicators. Words, sentences and paragraphs use the same
 * script-aware segmentation as TextCounter (textSegmentation.ts) and the same stopwords, so every indicator agrees with the main counts.
 */
export function profileText(text: string, topKeywords = 8, topLetters = 12): TextProfile {
  const composition: TextComposition = { letters: 0, digits: 0, spaces: 0, punctuation: 0, other: 0 };
  const letterMap = new Map<string, number>();
  for (const ch of text) {
    const kind = classify(ch);
    composition[kind] += ch.length;
    if (kind === "letters" && /\p{L}/u.test(ch) && ch !== "\u0640") {
      const key = ch.toLowerCase();
      letterMap.set(key, (letterMap.get(key) ?? 0) + 1);
    }
  }

  const sentences: SentenceSpan[] = splitSentences(text).map((span, index) => ({
    index,
    ...span,
    words: countWords(text.slice(span.start, span.end)),
  }));

  const paragraphs: ParagraphSpan[] = splitParagraphs(text).map((span, index) => {
    const body = text.slice(span.start, span.end);
    return { index, words: countWords(body), sentences: splitSentences(body).length, characters: body.length };
  });

  const tokens = tokenizeWords(text);
  const frequency = new Map<string, number>();
  const wordLengths = new Array<number>(WORD_LENGTH_BUCKETS).fill(0);
  let longWords = 0;
  for (const { word, key: w } of tokens) {
    const len = wordLength(word);
    if (len > 0) wordLengths[Math.min(len, WORD_LENGTH_BUCKETS) - 1]++;
    if (len > LIX_LONG_WORD) longWords++;
    if (len < 2 || STOPWORDS.has(w)) continue;
    frequency.set(w, (frequency.get(w) ?? 0) + 1);
  }
  const keywords = [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topKeywords)
    .map(([word, count]) => ({ word, count, density: tokens.length ? count / tokens.length : 0 }));
  const letters = [...letterMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topLetters)
    .map(([letter, count]) => ({ letter, count }));

  const words = tokens.length;
  const averageSentenceLength = sentences.length ? words / sentences.length : 0;
  const lix = words && sentences.length ? averageSentenceLength + (100 * longWords) / Math.max(tokens.length, 1) : 0;

  return {
    composition,
    sentences,
    paragraphs,
    keywords,
    letters,
    wordLengths,
    averageSentenceLength,
    longWords,
    lix,
    readingSeconds: (words / READING_WPM) * 60,
    speakingSeconds: (words / SPEAKING_WPM) * 60,
  };
}

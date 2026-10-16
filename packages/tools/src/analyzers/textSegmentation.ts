/**
 * Script-aware word, sentence and paragraph segmentation shared by every text tool.
 *
 * - Combining marks (\p{M}) never split a word: Arabic harakat, tanween, shadda, sukun and the
 *   superscript alef, Devanagari matras, virama, nukta and anusvara all stay inside their word.
 *   Tatweel (U+0640) is a letter (\p{Lm}) and ZWNJ/ZWJ join Indic and Persian letters.
 * - Sentences end on Latin, Arabic, Urdu, Devanagari and full-width terminators. A sentence never
 *   crosses a line break, and a "." between two letters or digits (3.5, example.com) is not an end.
 */

const WORD_CHAR = "[\\p{L}\\p{M}\\p{N}]";
/** Joiners allowed inside a word: apostrophes, hyphens, ZWNJ/ZWJ, and decimal/thousands separators between digits. */
const JOINER = "(?:['\u2019\\-\u200C\u200D]|(?<=\\p{N})[.,\u066B\u066C](?=\\p{N}))";
const WORD_SOURCE = `${WORD_CHAR}+(?:${JOINER}${WORD_CHAR}+)*`;

/** A fresh global word-token regex (callers iterate it with matchAll). */
export function wordPattern(): RegExp {
  return new RegExp(WORD_SOURCE, "gu");
}

/** Arabic diacritics (harakat, tanween, shadda, sukun, superscript alef, Quranic marks) and tatweel. */
const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0640]/g;
/** Every mark and joiner that is not a letter of its own, for letter-length measurement. */
const NON_LETTER_IN_WORD = /[\p{M}\u0640\u200C\u200D'\u2019\-.,\u066B\u066C]/gu;

/**
 * Comparison key for a word: lower-case, NFC, with Arabic diacritics and tatweel removed, so
 * "كَتَبَ", "كتب" and "كتـــب" are the same word. Devanagari matras stay, since they change the word.
 */
export function normalizeWord(word: string): string {
  return word.normalize("NFC").toLowerCase().replace(ARABIC_DIACRITICS, "");
}

/** Number of letters and digits in a word, ignoring combining marks, tatweel and joiners. */
export function wordLength(word: string): number {
  return [...word.replace(NON_LETTER_IN_WORD, "")].length;
}

export type WordToken = { word: string; key: string; start: number; end: number };

/** Every word with its comparison key and UTF-16 position in `text`. */
export function tokenizeWords(text: string): WordToken[] {
  const out: WordToken[] = [];
  for (const m of text.matchAll(wordPattern())) {
    const start = m.index ?? 0;
    out.push({ word: m[0], key: normalizeWord(m[0]), start, end: start + m[0].length });
  }
  return out;
}

/** Normalized word keys in reading order. */
export function extractWords(text: string): string[] {
  return tokenizeWords(text).map((t) => t.key);
}

export function countWords(text: string): number {
  let n = 0;
  for (const _ of text.matchAll(wordPattern())) n++;
  return n;
}

/** Terminators that always end a sentence (Latin "." is handled separately). */
const HARD_END = new Set([
  "!", "?", "\u061F" /* ؟ */, "\u061B" /* ؛ */, "\u06D4" /* ۔ */, "\u0964" /* । */, "\u0965" /* ॥ */,
  "\u2026" /* … */, "\u203C", "\u2047", "\u2048", "\u2049", "\u3002" /* 。 */, "\uFF01", "\uFF1F", "\uFF0E",
]);
const CLOSER = /["'\u201D\u2019\u00BB)\]}\u300D\u300F]/;
const ALNUM = /[\p{L}\p{N}]/u;

function isEnd(text: string, i: number): boolean {
  const ch = text[i];
  if (HARD_END.has(ch)) return true;
  if (ch !== ".") return false;
  // "3.5", "example.com", "e.g" keep going; a "." followed by space, closer or end finishes the sentence.
  return !(ALNUM.test(text[i - 1] ?? "") && ALNUM.test(text[i + 1] ?? ""));
}

export type TextSpan = { start: number; end: number };

/** Sentence spans (trimmed, UTF-16 offsets into `text`) that contain at least one word. */
export function splitSentences(text: string): TextSpan[] {
  const spans: TextSpan[] = [];
  let start = 0;
  const push = (end: number) => {
    const raw = text.slice(start, end);
    const lead = raw.length - raw.trimStart().length;
    const body = raw.trim();
    if (body && ALNUM.test(body)) spans.push({ start: start + lead, end: start + lead + body.length });
    start = end;
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "\n" || ch === "\r") {
      push(i);
      continue;
    }
    if (!isEnd(text, i)) continue;
    let j = i + 1;
    while (j < text.length && (HARD_END.has(text[j]) || text[j] === ".")) j++;
    while (j < text.length && CLOSER.test(text[j])) j++;
    push(j);
    i = j - 1;
  }
  push(text.length);
  return spans;
}

export function countSentences(text: string): number {
  return splitSentences(text).length;
}

/** Paragraph spans: blocks of text separated by line breaks, each containing at least one non-space character. */
export function splitParagraphs(text: string): TextSpan[] {
  const spans: TextSpan[] = [];
  const re = /[^\r\n]+/g;
  for (const m of text.matchAll(re)) {
    const raw = m[0];
    const lead = raw.length - raw.trimStart().length;
    const body = raw.trim();
    if (!body) continue;
    const start = (m.index ?? 0) + lead;
    spans.push({ start, end: start + body.length });
  }
  return spans;
}

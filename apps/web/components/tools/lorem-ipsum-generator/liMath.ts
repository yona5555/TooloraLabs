/** Display helpers for the lorem-ipsum indicators. The text itself always comes from LoremIpsumCalculator. */
import { tokenizeWords, wordLength } from "@tooloralabs/tools";
import type { LiAnalysis } from "./LiLiveContext";

/** One greeked word bar: x and width in character units, `sentence` = global sentence index. */
export type GreekWord = { x: number; w: number; sentence: number };
export type GreekLine = { paragraph: number; words: GreekWord[]; last: boolean };

/**
 * Greeks the text into lines of `capacity` characters (a word is its letter count wide, plus one
 * space), the way a layout tool shows placeholder copy as bars. Stops after `maxLines`.
 */
export function greekLines(a: LiAnalysis, capacity: number, maxLines: number): { lines: GreekLine[]; total: number } {
  const lines: GreekLine[] = [];
  let total = 0;
  for (const p of a.paragraphs) {
    let line: GreekWord[] = [];
    let x = 0;
    const flush = (last: boolean) => {
      total++;
      if (lines.length < maxLines) lines.push({ paragraph: p.index, words: line, last });
      line = [];
      x = 0;
    };
    for (const s of a.sentences) {
      if (s.paragraph !== p.index) continue;
      // Token offsets are relative to the sentence; the word right before its final mark carries that mark.
      for (const tk of tokenizeWords(a.text.slice(s.start, s.end))) {
        const w = Math.max(1, wordLength(tk.word)) + (tk.end === s.end - s.start - 1 ? 1 : 0);
        if (x > 0 && x + w > capacity) flush(false);
        line.push({ x, w, sentence: s.index });
        x += w + 1;
      }
    }
    if (line.length) flush(true);
  }
  return { lines, total };
}

/** Average glyph width of a proportional sans-serif face, in em (≈ 0.5 for Latin text). */
export const GLYPH_EM = 0.5;
/** Bringhurst's comfortable measure for body text, in characters per line. */
export const MEASURE = { min: 45, max: 75 } as const;

/** Characters per line for a column `width` px wide at `fontSize` px. */
export function charsPerLine(width: number, fontSize: number): number {
  return Math.max(1, Math.floor(width / (fontSize * GLYPH_EM)));
}

/** Estimated wrapped line count: each paragraph takes ceil(characters ÷ chars-per-line) lines. */
export function estimatedLines(a: LiAnalysis, cpl: number): number {
  return a.paragraphs.reduce((sum, p) => sum + Math.ceil(p.characters / cpl), 0);
}

/** Typical English letter frequencies (% of letters; Lewand, "Cryptological Mathematics"). */
export const ENGLISH_LETTERS: Record<string, number> = {
  e: 12.7, t: 9.06, a: 8.17, o: 7.51, i: 6.97, n: 6.75, s: 6.33, h: 6.09, r: 5.99, d: 4.25, l: 4.03, c: 2.78, u: 2.76,
  m: 2.41, w: 2.36, f: 2.23, g: 2.02, y: 1.97, p: 1.93, b: 1.29, v: 0.98, k: 0.77, j: 0.15, x: 0.15, q: 0.1, z: 0.07,
};
export const VOWELS = new Set(["a", "e", "i", "o", "u"]);

/** Common placeholder slots in mockups, by character budget. */
export const FIT_TARGETS = [
  { key: "headline", max: 60 },
  { key: "meta", max: 160 },
  { key: "social", max: 280 },
  { key: "card", max: 500 },
  { key: "intro", max: 1000 },
] as const;

/** Five alternating paragraph/sentence colours. */
export const SEGMENT_FILLS = [
  "fill-blue-600 dark:fill-blue-500",
  "fill-sky-500 dark:fill-sky-400",
  "fill-indigo-500 dark:fill-indigo-400",
  "fill-cyan-600 dark:fill-cyan-500",
  "fill-violet-500 dark:fill-violet-400",
];
export const SEGMENT_DOTS = [
  "bg-blue-600 dark:bg-blue-500",
  "bg-sky-500 dark:bg-sky-400",
  "bg-indigo-500 dark:bg-indigo-400",
  "bg-cyan-600 dark:bg-cyan-500",
  "bg-violet-500 dark:bg-violet-400",
];

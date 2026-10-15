import { TextToSpeechCalculator } from "@tooloralabs/tools";

/**
 * Pure helpers for the text-to-speech visuals. Every chunk shown comes from the tool's own
 * TextToSpeechCalculator; listening times use one stated assumption: 150 words per minute at 1×
 * (the usual conversational pace), divided by the rate, since rate scales every utterance alike.
 */
export const ttsTool = new TextToSpeechCalculator();

export const WPM = 150;
export const RATE_MIN = 0.5;
export const RATE_MAX = 2;
export const RATE_STEP = 0.1;
export const RATE_SEED = 1;
/** The Web Speech spec range the tool validates against (rate 0.1–10). */
export const SPEC_RATE_MIN = 0.1;
export const SPEC_RATE_MAX = 10;
export const CHUNK_LIMIT = 200;

export const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
export const seconds = (words: number, rate: number) => (words * 60) / (WPM * rate);

/** The tool's own chunking (rate and pitch do not change chunks). */
export function chunksOf(text: string, max = CHUNK_LIMIT): string[] {
  return ttsTool.execute({ text, rate: 1, pitch: 1, maxChunkLength: max }, { locale: "en-US" }).data.chunks;
}

/** The same sentence split the tool uses before packing chunks. */
export const sentencesOf = (text: string) => (text.match(/[^.!?]+[.!?]*/g) ?? [text]).map((s) => s.trim()).filter(Boolean);

/** Stored example paragraph (eight sentences) for the indicator cards. */
export const STORY =
  "Speech synthesis turns written text into sound. The browser first splits your text into sentences at every full stop, question mark or exclamation mark. Sentences are then packed into chunks of at most two hundred characters. Each chunk becomes one utterance in a queue. The voice reads the queue in order, one utterance after another. A faster rate shortens every utterance by the same factor. Pitch changes how high the voice sounds, not how long it takes. Long sentences without punctuation are split between words instead.";

/** Stored example sentence with no punctuation at all, for the word-boundary fallback. */
export const LONG_SENTENCE =
  "this sentence has no full stop so the tool cannot break it at a sentence boundary and must fall back to cutting it between words whenever the next word would push the current piece past the two hundred character limit which keeps every utterance short enough for browsers that silently drop or truncate very long text and it keeps going with more and more words until the very end of the line";

export const firstWords = (s: string, n: number) => s.split(/\s+/).slice(0, n).join(" ");

/** Seconds as "12.4 s" or "1 min 05 s". */
export function fmtTime(sec: number): string {
  if (!Number.isFinite(sec)) return "—";
  if (sec < 60) return `${(Math.round(sec * 10) / 10).toFixed(1)} s`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec - m * 60);
  return s === 60 ? `${m + 1} min 00 s` : `${m} min ${String(s).padStart(2, "0")} s`;
}

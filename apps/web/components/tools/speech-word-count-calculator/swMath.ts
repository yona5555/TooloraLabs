/** Display helpers for the speech indicators. The delivery estimate itself comes from SpeechWordCountCalculator. */

/** Index of the word a steady-pace speaker is on after `seconds` at `wpm` (-1 when there are no words). */
export function speakerWordIndex(seconds: number, wpm: number, words: number): number {
  if (words <= 0 || wpm <= 0) return -1;
  return Math.max(0, Math.min(words - 1, Math.floor((seconds * wpm) / 60)));
}

/** The last span whose first word is at or before word `idx`. */
export function spanAt<T extends { wordStart: number }>(spans: T[], idx: number): T | undefined {
  let found = spans[0];
  for (const s of spans) {
    if (s.wordStart > idx) break;
    found = s;
  }
  return found;
}

const DIAL_STEPS = [1, 2, 3, 5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 360, 480, 720, 1440];

/** Smallest "nice" dial span (in minutes) that holds `seconds`. */
export function dialMinutes(seconds: number): number {
  const minutes = seconds / 60;
  return DIAL_STEPS.find((m) => m >= minutes) ?? Math.ceil(minutes / 60) * 60;
}

/** Colour set per pace preset, shared by the rings, comparison rows and curve. */
export const PACE_TONES = {
  formal: { stroke: "stroke-indigo-600 dark:stroke-indigo-400", bg: "bg-indigo-600 dark:bg-indigo-400", text: "text-indigo-700 dark:text-indigo-300" },
  normal: { stroke: "stroke-blue-600 dark:stroke-blue-500", bg: "bg-blue-600 dark:bg-blue-500", text: "text-blue-700 dark:text-blue-300" },
  fast: { stroke: "stroke-sky-500 dark:stroke-sky-400", bg: "bg-sky-500 dark:bg-sky-400", text: "text-sky-700 dark:text-sky-300" },
  custom: { stroke: "stroke-amber-500 dark:stroke-amber-400", bg: "bg-amber-500 dark:bg-amber-400", text: "text-amber-700 dark:text-amber-300" },
} as const;

/** Common speaking-slot lengths in minutes for the time-slot planner. */
export const SLOT_MINUTES = [1, 2, 3, 5, 7, 10, 15, 20, 30, 45, 60] as const;

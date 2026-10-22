/** Display helpers for the reading-time indicators. The estimate itself comes from ReadingTimeCalculator. */

/** Index of the word a uniform-pace reader is on after `seconds` at `wpm` (-1 when there are no words). */
export function readerWordIndex(seconds: number, wpm: number, words: number): number {
  if (words <= 0 || wpm <= 0) return -1;
  return Math.max(0, Math.min(words - 1, Math.floor((seconds * wpm) / 60)));
}

const DIAL_STEPS = [1, 2, 3, 5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 360, 480, 720, 1440];

/** Smallest "nice" dial span (in minutes) that holds `seconds`. */
export function dialMinutes(seconds: number): number {
  const minutes = seconds / 60;
  return DIAL_STEPS.find((m) => m >= minutes) ?? Math.ceil(minutes / 60) * 60;
}

/** Common editorial read-length bands (upper bound in seconds). */
export const LENGTH_ZONES = [
  { key: "quick", max: 60, fill: "bg-emerald-500 dark:bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300" },
  { key: "short", max: 180, fill: "bg-teal-500 dark:bg-teal-500", text: "text-teal-700 dark:text-teal-300" },
  { key: "medium", max: 420, fill: "bg-blue-600 dark:bg-blue-500", text: "text-blue-700 dark:text-blue-300" },
  { key: "long", max: 900, fill: "bg-violet-600 dark:bg-violet-500", text: "text-violet-700 dark:text-violet-300" },
  { key: "deep", max: 1800, fill: "bg-rose-500 dark:bg-rose-500", text: "text-rose-700 dark:text-rose-300" },
] as const;

export type LengthZoneKey = (typeof LENGTH_ZONES)[number]["key"];

/** Zone index for a duration and the marker position along an equal-width five-band strip (0–1). */
export function zoneOf(seconds: number): { index: number; position: number } {
  let lo = 0;
  for (let i = 0; i < LENGTH_ZONES.length; i++) {
    const hi = LENGTH_ZONES[i].max;
    if (seconds <= hi || i === LENGTH_ZONES.length - 1) {
      const within = Math.min(1, Math.max(0, (seconds - lo) / (hi - lo)));
      return { index: i, position: (i + within) / LENGTH_ZONES.length };
    }
    lo = hi;
  }
  return { index: 0, position: 0 };
}

/** Five paragraph/sentence colours that alternate along timelines and dials. */
export const SEGMENT_FILLS = [
  "fill-blue-600 dark:fill-blue-500",
  "fill-sky-500 dark:fill-sky-400",
  "fill-indigo-500 dark:fill-indigo-400",
  "fill-cyan-600 dark:fill-cyan-500",
  "fill-violet-500 dark:fill-violet-400",
];
export const SEGMENT_STROKES = [
  "stroke-blue-600 dark:stroke-blue-500",
  "stroke-sky-500 dark:stroke-sky-400",
  "stroke-indigo-500 dark:stroke-indigo-400",
  "stroke-cyan-600 dark:stroke-cyan-500",
  "stroke-violet-500 dark:stroke-violet-400",
];
export const SEGMENT_DOTS = [
  "bg-blue-600 dark:bg-blue-500",
  "bg-sky-500 dark:bg-sky-400",
  "bg-indigo-500 dark:bg-indigo-400",
  "bg-cyan-600 dark:bg-cyan-500",
  "bg-violet-500 dark:bg-violet-400",
];

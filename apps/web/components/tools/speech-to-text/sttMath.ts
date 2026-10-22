import { SpeechToTextCalculator } from "@tooloralabs/tools";

/**
 * Pure helpers for the speech-to-text visuals. Every transcript and word count shown comes from the
 * tool's own SpeechToTextCalculator (trim, collapse spaces, join with one space, capitalise sentence
 * starts, split on whitespace) run on stored recognizer-style segments.
 */
export const sttTool = new SpeechToTextCalculator();
export const run = (segments: string[]) => sttTool.execute({ segments }, { locale: "en-US" }).data;
export const clean = (segment: string) => segment.trim().replace(/\s+/g, " ");

/** Stored example: final segments as a recognizer returns them (lower case, uneven spacing). */
export const EXAMPLE_SEGMENTS = [
  " hello everyone and welcome to the weekly team meeting",
  "today we will review the budget. then we plan the launch date",
  "  please send   your notes by friday",
  "the design review moves to tuesday. any questions",
  "thanks everyone see you next week",
];

/** Stored lower-case text of eight sentences, for the capitalisation card. */
export const LOWER_SENTENCES = [
  "hello everyone.",
  "today we review the budget.",
  "then we plan the launch.",
  "please send notes by friday.",
  "the design review moves to tuesday.",
  "are there any questions?",
  "thanks for joining!",
  "see you next week.",
];

/** Stored recognition events for two phrases: interim guesses, then the final segment. */
export const EVENTS: { interim?: string; final?: string }[] = [
  { interim: "please" },
  { interim: "please send" },
  { interim: "please send your" },
  { interim: "please send your notes" },
  { interim: "please send your notes by" },
  { final: "please send your notes by friday" },
  { interim: "thanks" },
  { interim: "thanks every" },
  { final: "thanks everyone" },
];

/** Stored two-sentence samples per recognition language (as recognized, lower case where the script has case). */
export const LANG_SAMPLES = [
  { code: "en-US", text: "hello there. how are you today?" },
  { code: "es-ES", text: "hola a todos. cómo están hoy?" },
  { code: "fr-FR", text: "bonjour à tous. comment allez-vous?" },
  { code: "de-DE", text: "hallo zusammen. über das wetter reden wir später." },
  { code: "ar-SA", text: "مرحبا بالجميع. كيف حالكم اليوم؟" },
  { code: "hi-IN", text: "नमस्ते सभी को। आप कैसे हैं?" },
];

/** Letters the tool changed between input and transcript (its only change to letters is upper-casing). */
export function capitalised(before: string, after: string): number {
  let n = 0;
  for (let i = 0; i < Math.min(before.length, after.length); i++) if (before[i] !== after[i]) n++;
  return n;
}

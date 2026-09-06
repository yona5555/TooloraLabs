import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type SpeechPacePreset = "formal" | "normal" | "fast" | "custom";

export type SpeechWordCountInput = {
  text: string;
  wordsPerMinute: number;
};

export type SpeechWordCountError = "empty-text" | "invalid-rate";

export type SpeechWordCountOutput = {
  error: SpeechWordCountError | null;
  wordCount: number;
  totalSeconds: number;
  minutes: number;
  seconds: number;
};

const MIN_WPM = 1;
const MAX_WPM = 400;

/**
 * Typical public-speaking pace ranges, distinct from silent-reading speed: formal,
 * deliberate presentation delivery is markedly slower than casual reading, since spoken
 * delivery is paced by breath, articulation, and audience comprehension.
 */
export const SPEECH_PACE_PRESETS: Record<Exclude<SpeechPacePreset, "custom">, number> = {
  formal: 110,
  normal: 140,
  fast: 170,
};

export class SpeechWordCountCalculator extends BaseCalculator<SpeechWordCountInput, SpeechWordCountOutput> {
  metadata = {
    id: "speech-word-count-calculator",
    slug: "speech-word-count-calculator",
    name: "Speech Word Count Calculator",
    category: "text-tools",
    description: "Estimate how long a speech or presentation will take to deliver, based on word count and speaking pace.",
    version: "1.0.0",
  };

  execute(input: SpeechWordCountInput, _context: ToolContext): ToolResult<SpeechWordCountOutput> {
    const text = (input.text ?? "").trim();
    if (!text) {
      return this.error("empty-text");
    }

    if (!Number.isFinite(input.wordsPerMinute) || input.wordsPerMinute < MIN_WPM || input.wordsPerMinute > MAX_WPM) {
      return this.error("invalid-rate");
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const totalMinutesRaw = wordCount / input.wordsPerMinute;
    const totalSeconds = Math.round(totalMinutesRaw * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds - minutes * 60;

    return {
      success: true,
      data: { error: null, wordCount, totalSeconds, minutes, seconds },
      metadata: {},
    };
  }

  private error(error: SpeechWordCountError): ToolResult<SpeechWordCountOutput> {
    return { success: true, data: { error, wordCount: 0, totalSeconds: 0, minutes: 0, seconds: 0 }, metadata: {} };
  }
}

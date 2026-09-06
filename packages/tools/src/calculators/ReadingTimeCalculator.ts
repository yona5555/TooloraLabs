import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type ReadingSpeedPreset = "slow" | "average" | "fast" | "custom";

export type ReadingTimeInput = {
  text: string;
  wordsPerMinute: number;
};

export type ReadingTimeError = "empty-text" | "invalid-rate";

export type ReadingTimeOutput = {
  error: ReadingTimeError | null;
  wordCount: number;
  totalSeconds: number;
  minutes: number;
  seconds: number;
};

const MIN_WPM = 1;
const MAX_WPM = 1000;

export const READING_SPEED_PRESETS: Record<Exclude<ReadingSpeedPreset, "custom">, number> = {
  slow: 150,
  average: 230,
  fast: 300,
};

export class ReadingTimeCalculator extends BaseCalculator<ReadingTimeInput, ReadingTimeOutput> {
  metadata = {
    id: "reading-time-calculator",
    slug: "reading-time-calculator",
    name: "Reading Time Calculator",
    category: "text-tools",
    description: "Estimate how long it will take to read a piece of text at a given reading speed.",
    version: "1.0.0",
  };

  execute(input: ReadingTimeInput, _context: ToolContext): ToolResult<ReadingTimeOutput> {
    const text = (input.text ?? "").trim();
    if (!text) {
      return this.error("empty-text");
    }

    if (!Number.isFinite(input.wordsPerMinute) || input.wordsPerMinute < MIN_WPM || input.wordsPerMinute > MAX_WPM) {
      return this.error("invalid-rate");
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const totalMinutesRaw = wordCount / input.wordsPerMinute;
    let totalSeconds = Math.round(totalMinutesRaw * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds - minutes * 60;
    totalSeconds = minutes * 60 + seconds;

    return {
      success: true,
      data: { error: null, wordCount, totalSeconds, minutes, seconds },
      metadata: {},
    };
  }

  private error(error: ReadingTimeError): ToolResult<ReadingTimeOutput> {
    return { success: true, data: { error, wordCount: 0, totalSeconds: 0, minutes: 0, seconds: 0 }, metadata: {} };
  }
}

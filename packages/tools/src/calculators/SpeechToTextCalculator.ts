import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type SpeechToTextInput = {
  /** Finalized transcript segments, in the order they were recognized. */
  segments: string[];
};

export type SpeechToTextOutput = {
  transcript: string;
  wordCount: number;
};

function capitalizeSentences(text: string): string {
  return text.replace(
    /(^\s*[a-z])|([.!?]\s+[a-z])/g,
    (match) => match.toUpperCase(),
  );
}

/**
 * Joins raw recognized speech segments into a single clean transcript: collapses
 * whitespace, trims each segment, and capitalizes the start of the transcript and
 * the start of each sentence. This is pure text formatting with no dependency on
 * the SpeechRecognition API itself, so it's fully testable outside a browser.
 */
export class SpeechToTextCalculator extends BaseCalculator<SpeechToTextInput, SpeechToTextOutput> {
  metadata = {
    id: "speech-to-text",
    slug: "speech-to-text",
    name: "Speech to Text",
    category: "ai-tools",
    description: "Convert spoken audio from your microphone into written text using your browser's built-in speech recognition.",
    version: "1.0.0",
  };

  execute(input: SpeechToTextInput, _context: ToolContext): ToolResult<SpeechToTextOutput> {
    const cleanedSegments = (input.segments ?? [])
      .map((segment) => segment.trim().replace(/\s+/g, " "))
      .filter((segment) => segment.length > 0);

    const joined = cleanedSegments.join(" ");
    const transcript = capitalizeSentences(joined);
    const wordCount = transcript ? transcript.split(/\s+/).length : 0;

    return {
      success: true,
      data: { transcript, wordCount },
      metadata: {},
    };
  }
}

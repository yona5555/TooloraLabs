import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type TextToSpeechInput = {
  text: string;
  rate: number;
  pitch: number;
  /** Maximum characters per speech chunk. Defaults to 200. */
  maxChunkLength?: number;
};

export type TextToSpeechError = "empty-text" | "invalid-rate" | "invalid-pitch";

export type TextToSpeechOutput = {
  error: TextToSpeechError | null;
  chunks: string[];
  characterCount: number;
};

/** Per the Web Speech API spec: SpeechSynthesisUtterance.rate ranges 0.1-10 (default 1). */
const MIN_RATE = 0.1;
const MAX_RATE = 10;
/** Per the Web Speech API spec: SpeechSynthesisUtterance.pitch ranges 0-2 (default 1). */
const MIN_PITCH = 0;
const MAX_PITCH = 2;
const DEFAULT_MAX_CHUNK_LENGTH = 200;

/**
 * Splits text into speech-friendly chunks at sentence boundaries, falling back to word
 * boundaries for sentences longer than maxLength. Some browsers silently truncate or
 * mishandle very long single utterances, so chunking keeps each utterance short and
 * lets the queue advance chunk-by-chunk.
 */
function splitIntoChunks(text: string, maxLength: number): string[] {
  const sentences = text.match(/[^.!?]+[.!?]*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";

  for (const rawSentence of sentences) {
    const sentence = rawSentence.trim();
    if (!sentence) continue;

    if (sentence.length > maxLength) {
      if (current) {
        chunks.push(current);
        current = "";
      }
      const words = sentence.split(/\s+/);
      let wordChunk = "";
      for (const word of words) {
        const candidate = wordChunk ? `${wordChunk} ${word}` : word;
        if (candidate.length > maxLength && wordChunk) {
          chunks.push(wordChunk);
          wordChunk = word;
        } else {
          wordChunk = candidate;
        }
      }
      if (wordChunk) chunks.push(wordChunk);
      continue;
    }

    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > maxLength && current) {
      chunks.push(current);
      current = sentence;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export class TextToSpeechCalculator extends BaseCalculator<TextToSpeechInput, TextToSpeechOutput> {
  metadata = {
    id: "text-to-speech",
    slug: "text-to-speech",
    name: "Text to Speech",
    category: "ai-tools",
    description: "Convert written text into spoken audio using your browser's built-in speech synthesis.",
    version: "1.0.0",
  };

  execute(input: TextToSpeechInput, _context: ToolContext): ToolResult<TextToSpeechOutput> {
    const text = (input.text ?? "").trim();
    if (!text) return this.error("empty-text");

    if (!Number.isFinite(input.rate) || input.rate < MIN_RATE || input.rate > MAX_RATE) {
      return this.error("invalid-rate");
    }

    if (!Number.isFinite(input.pitch) || input.pitch < MIN_PITCH || input.pitch > MAX_PITCH) {
      return this.error("invalid-pitch");
    }

    const maxChunkLength = input.maxChunkLength ?? DEFAULT_MAX_CHUNK_LENGTH;
    const chunks = splitIntoChunks(text, maxChunkLength);

    return {
      success: true,
      data: { error: null, chunks, characterCount: text.length },
      metadata: {},
    };
  }

  private error(error: TextToSpeechError): ToolResult<TextToSpeechOutput> {
    return { success: true, data: { error, chunks: [], characterCount: 0 }, metadata: {} };
  }
}

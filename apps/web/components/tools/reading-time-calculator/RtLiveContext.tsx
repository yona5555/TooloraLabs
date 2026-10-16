"use client";
import { createContext, useCallback, useContext, useDeferredValue, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import {
  countWords,
  ReadingTimeCalculator as RTTool,
  splitParagraphs,
  splitSentences,
  tokenizeWords,
  type WordToken,
} from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import { READING_SPEED_PRESETS, type ReadingSpeedPreset, type ReadingTimeOutput } from "./types";

const tool = new RTTool();
const DEFAULT_PRESET: ReadingSpeedPreset = "average";
const DEFAULT_CUSTOM_WPM = "230";

/** A sentence or paragraph with its word range in reading order (wordStart = index of its first word token). */
export type RtSpan = { index: number; start: number; end: number; words: number; wordStart: number };

export type Reader = { seconds: number; wpm: number };

type RtLive = {
  text: string;
  setText: (next: string) => void;
  preset: ReadingSpeedPreset;
  setPreset: (next: ReadingSpeedPreset) => void;
  customWpm: string;
  setCustomWpm: (next: string) => void;
  /** Restores the original Clear behaviour: empty text, Average preset, 230 custom WPM. */
  reset: () => void;
  wpm: number;
  /** ReadingTimeCalculator output (deferred so typing never waits on it). */
  result: ReadingTimeOutput;
  ok: boolean;
  /** Word tokens with UTF-16 offsets, debounced for long texts. */
  tokens: WordToken[];
  sentences: RtSpan[];
  paragraphs: RtSpan[];
  /** Exact (unrounded) reading seconds for `words` at `rate` WPM. */
  secondsFor: (words: number, rate?: number) => number;
  digitStyle: DigitStyle;
  f: (v: number, max?: number) => string;
  pct: (share: number) => string;
  clock: (seconds: number) => string;
  /** The result in the calculator's own "X min Y sec" wording. */
  timeLabel: (seconds: number) => string;
  /** Simulated reader (playback position in seconds at its own pace); null = no reader shown in the text. */
  reader: Reader | null;
  setReader: (next: Reader | null) => void;
  active: { kind: "sentence" | "paragraph"; index: number } | null;
  jumpTo: (start: number, end: number, active: { kind: "sentence" | "paragraph"; index: number }) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
};

const Context = createContext<RtLive | null>(null);

/** Heavier segmentation waits for a pause in typing; short texts update on the next frame. */
function useDebounced(value: string): string {
  const [debounced, setDebounced] = useState(value);
  const delay = value.length > 20000 ? 320 : value.length > 4000 ? 160 : 40;
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function withWordRanges(text: string, spans: { start: number; end: number }[], tokens: WordToken[]): RtSpan[] {
  let cursor = 0;
  return spans.map((span, index) => {
    while (cursor < tokens.length && tokens[cursor].start < span.start) cursor++;
    const wordStart = cursor;
    const words = countWords(text.slice(span.start, span.end));
    return { index, start: span.start, end: span.end, words, wordStart };
  });
}

export function RtLiveProvider({ initialText, children }: { initialText: string; children: ReactNode }) {
  const [text, setTextState] = useState(initialText);
  const [preset, setPreset] = useState<ReadingSpeedPreset>(DEFAULT_PRESET);
  const [customWpm, setCustomWpm] = useState(DEFAULT_CUSTOM_WPM);
  const [reader, setReader] = useState<Reader | null>(null);
  const [active, setActive] = useState<RtLive["active"]>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const tr = useTranslations("tools.reading-time-calculator.result");

  const deferred = useDeferredValue(text);
  const debounced = useDebounced(text);
  const wpm = preset === "custom" ? parseLocalizedNumber(customWpm) || 0 : READING_SPEED_PRESETS[preset];
  const result = useMemo(() => tool.execute({ text: deferred, wordsPerMinute: wpm }, { locale: "en-US" }).data, [deferred, wpm]);
  const ok = result.error === null;

  const { tokens, sentences, paragraphs } = useMemo(() => {
    const tk = tokenizeWords(debounced);
    return {
      tokens: tk,
      sentences: withWordRanges(debounced, splitSentences(debounced), tk),
      paragraphs: withWordRanges(debounced, splitParagraphs(debounced), tk),
    };
  }, [debounced]);

  const digitStyle = resolveDigitStyle(customWpm, deferred);

  const setText = useCallback((next: string) => {
    setTextState(next);
    setActive(null);
    setReader(null);
  }, []);

  const reset = useCallback(() => {
    setText("");
    setPreset(DEFAULT_PRESET);
    setCustomWpm(DEFAULT_CUSTOM_WPM);
  }, [setText]);

  const jumpTo = useCallback((start: number, end: number, next: NonNullable<RtLive["active"]>) => {
    const el = textareaRef.current;
    setActive(next);
    setReader(null);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    el.focus({ preventScroll: true });
    // Collapsing the caret first, then blurring/refocusing, makes browsers scroll the textarea to it.
    el.setSelectionRange(start, start);
    el.blur();
    el.focus({ preventScroll: true });
    el.setSelectionRange(start, end);
  }, []);

  const value = useMemo<RtLive>(() => {
    const f = (v: number, max = 1) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: max });
    const pct = (share: number) => `${formatLocalizedNumber(share * 100, digitStyle, { maximumFractionDigits: 1 })}%`;
    const two = (n: number) => formatLocalizedNumber(n, digitStyle, { minimumIntegerDigits: 2, useGrouping: false });
    const clock = (seconds: number) => {
      const s = Math.round(seconds);
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      return h ? `${f(h)}:${two(m)}:${two(s % 60)}` : `${f(m)}:${two(s % 60)}`;
    };
    // Same rounding as ReadingTimeCalculator: whole seconds, then minutes + remaining seconds.
    const timeLabel = (seconds: number) => {
      const total = Math.round(seconds);
      const m = Math.floor(total / 60);
      return m > 0 ? tr("timeMinutesSeconds", { minutes: f(m), seconds: f(total - m * 60) }) : tr("timeSecondsOnly", { seconds: f(total) });
    };
    const secondsFor = (words: number, rate = wpm) => (rate > 0 ? (words / rate) * 60 : 0);
    return {
      text,
      setText,
      preset,
      setPreset,
      customWpm,
      setCustomWpm,
      reset,
      wpm,
      result,
      ok,
      tokens,
      sentences,
      paragraphs,
      secondsFor,
      digitStyle,
      f,
      pct,
      clock,
      timeLabel,
      reader,
      setReader,
      active,
      jumpTo,
      textareaRef,
    };
  }, [text, setText, preset, customWpm, reset, wpm, result, ok, tokens, sentences, paragraphs, digitStyle, tr, reader, active, jumpTo]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useRtLive(): RtLive {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useRtLive must be used inside RtLiveProvider (ReadingTimeCalculator wraps the page).");
  return ctx;
}

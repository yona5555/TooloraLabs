"use client";
import { createContext, useCallback, useContext, useDeferredValue, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import {
  ReadabilityScoreCalculator,
  fleschKincaidGradeOf,
  fleschReadingEaseOf,
  readabilityBreakdown,
  type ReadabilityScoreCalculatorOutput,
  type ReadabilitySentence,
  type ReadabilityWord,
} from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";

const tool = new ReadabilityScoreCalculator();

/** One sentence span with its own Flesch scores (computed only for terminated sentences). */
export type ScoredSentence = ReadabilitySentence & { ease: number; grade: number };

/** What the textarea backdrop marks: one word (by comparison key) or every word in a syllable range. */
export type RsHighlight = { kind: "word"; key: string; word: string } | { kind: "syllables"; min: number; max: number } | null;

type RsLive = {
  text: string;
  setText: (next: string) => void;
  /** Calculator result, deferred so typing never waits on it. */
  result: ReadabilityScoreCalculatorOutput;
  /** True when the calculator produced a score (no empty-text / no-sentences error). */
  ok: boolean;
  /** Per-sentence / per-word breakdown for the indicators, debounced for long texts. */
  sentences: ScoredSentence[];
  words: ReadabilityWord[];
  digitStyle: DigitStyle;
  f: (v: number, max?: number) => string;
  pct: (share: number) => string;
  highlight: RsHighlight;
  setHighlight: (h: RsHighlight) => void;
  activeSentence: number | null;
  /** Selects sentence `index` in the textarea, scrolls it into view and marks it active everywhere. */
  selectSentence: (index: number) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
};

const Context = createContext<RsLive | null>(null);

/** Heavier per-sentence analysis waits for a pause in typing; short texts update on the next frame. */
function useDebounced(value: string): string {
  const [debounced, setDebounced] = useState(value);
  const delay = value.length > 20000 ? 320 : value.length > 4000 ? 160 : 40;
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function RsLiveProvider({ initialText, children }: { initialText: string; children: ReactNode }) {
  const [text, setTextState] = useState(initialText);
  const [highlight, setHighlight] = useState<RsHighlight>(null);
  const [activeSentence, setActiveSentence] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const deferred = useDeferredValue(text);
  const debounced = useDebounced(text);
  const result = useMemo(() => tool.execute({ text: deferred }, { locale: "en-US" }).data, [deferred]);
  const breakdown = useMemo(() => {
    const { sentences, words } = readabilityBreakdown(debounced);
    const scored: ScoredSentence[] = sentences.map((s) => {
      const asl = s.words;
      const asw = s.words ? s.syllables / s.words : 0;
      return { ...s, ease: fleschReadingEaseOf(asl, asw), grade: fleschKincaidGradeOf(asl, asw) };
    });
    return { sentences: scored, words };
  }, [debounced]);
  const digitStyle = resolveDigitStyle(deferred);

  const setText = useCallback((next: string) => {
    setTextState(next);
    setActiveSentence(null);
  }, []);

  const selectSentence = useCallback((index: number) => {
    const s = breakdown.sentences[index];
    const el = textareaRef.current;
    setActiveSentence(index);
    if (!el || !s) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    el.focus({ preventScroll: true });
    // Collapsing the caret first, then blurring/refocusing, makes browsers scroll the textarea to it.
    el.setSelectionRange(s.start, s.start);
    el.blur();
    el.focus({ preventScroll: true });
    el.setSelectionRange(s.start, s.end);
  }, [breakdown.sentences]);

  const value = useMemo<RsLive>(() => {
    const f = (v: number, max = 1) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: max });
    const pct = (share: number) => `${formatLocalizedNumber(share * 100, digitStyle, { maximumFractionDigits: 1 })}%`;
    return {
      text,
      setText,
      result,
      ok: result.error === null,
      sentences: breakdown.sentences,
      words: breakdown.words,
      digitStyle,
      f,
      pct,
      highlight,
      setHighlight,
      activeSentence,
      selectSentence,
      textareaRef,
    };
  }, [text, setText, result, breakdown, digitStyle, highlight, activeSentence, selectSentence]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useRsLive(): RsLive {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useRsLive must be used inside RsLiveProvider (ReadabilityCalculator wraps the page).");
  return ctx;
}

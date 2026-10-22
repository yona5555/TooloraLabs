"use client";
import { createContext, useCallback, useContext, useDeferredValue, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { profileText, TextCounter, type TextCounterOutput, type TextProfile } from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";

const tool = new TextCounter();

type WcLive = {
  text: string;
  setText: (next: string) => void;
  /** Main counts (TextCounter), deferred so typing never waits on them. */
  stats: TextCounterOutput;
  /** Deeper breakdown for the indicators, debounced for long texts. */
  profile: TextProfile;
  digitStyle: DigitStyle;
  f: (v: number, max?: number) => string;
  pct: (share: number) => string;
  /** m:ss (or h:mm:ss) for a duration in seconds, in the text's digit style. */
  clock: (seconds: number) => string;
  /** Keyword currently highlighted inside the textarea (lower-case token), or null. */
  highlight: string | null;
  setHighlight: (word: string | null) => void;
  activeSentence: number | null;
  /** Selects a range in the textarea, scrolls it into view and marks sentence `index` active. */
  jumpTo: (start: number, end: number, index: number) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
};

const Context = createContext<WcLive | null>(null);

/** Heavier analysis waits for a pause in typing; short texts update on the next frame. */
function useDebounced(value: string): string {
  const [debounced, setDebounced] = useState(value);
  const delay = value.length > 20000 ? 320 : value.length > 4000 ? 160 : 40;
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function WcLiveProvider({ initialText, children }: { initialText: string; children: ReactNode }) {
  const [text, setTextState] = useState(initialText);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [activeSentence, setActiveSentence] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const deferred = useDeferredValue(text);
  const debounced = useDebounced(text);
  const stats = useMemo(() => tool.execute({ text: deferred }, { locale: "en-US" }).data, [deferred]);
  const profile = useMemo(() => profileText(debounced), [debounced]);
  const digitStyle = resolveDigitStyle(deferred);

  const setText = useCallback((next: string) => {
    setTextState(next);
    setActiveSentence(null);
  }, []);

  const jumpTo = useCallback((start: number, end: number, index: number) => {
    const el = textareaRef.current;
    setActiveSentence(index);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    el.focus({ preventScroll: true });
    // Collapsing the caret first, then blurring/refocusing, makes browsers scroll the textarea to it.
    el.setSelectionRange(start, start);
    el.blur();
    el.focus({ preventScroll: true });
    el.setSelectionRange(start, end);
  }, []);

  const value = useMemo<WcLive>(() => {
    const f = (v: number, max = 1) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: max });
    const pct = (share: number) => `${formatLocalizedNumber(share * 100, digitStyle, { maximumFractionDigits: 1 })}%`;
    const two = (n: number) => formatLocalizedNumber(n, digitStyle, { minimumIntegerDigits: 2, useGrouping: false });
    const clock = (seconds: number) => {
      const s = Math.round(seconds);
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      return h ? `${f(h)}:${two(m)}:${two(s % 60)}` : `${f(m)}:${two(s % 60)}`;
    };
    return { text, setText, stats, profile, digitStyle, f, pct, clock, highlight, setHighlight, activeSentence, jumpTo, textareaRef };
  }, [text, setText, stats, profile, digitStyle, highlight, activeSentence, jumpTo]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useWcLive(): WcLive {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useWcLive must be used inside WcLiveProvider (WordCounterTool wraps the page).");
  return ctx;
}


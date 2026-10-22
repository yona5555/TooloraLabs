"use client";
import {
  createContext,
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { formatLocalizedNumber, parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import {
  countWords,
  LoremIpsumCalculator as LoremTool,
  loremWordBankSize,
  loremWordRange,
  profileText,
  seededLoremRandom,
  splitParagraphs,
  splitSentences,
  tokenizeWords,
  wordLength,
  type LoremWordRange,
  type TextComposition,
} from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import type { LoremIpsumOutput, LoremStyle, LoremUnit } from "./types";

const tool = new LoremTool();
const DEFAULTS = { unit: "paragraphs" as LoremUnit, count: "3", style: "classic" as LoremStyle, startWithLorem: true };
/**
 * Fixed seed for the server render and the first client render, so the text never changes after the
 * page appears (no layout shift). A random seed takes over only after Generate or a settings change.
 */
const INITIAL_SEED = 42;
const WORD_LENGTH_BUCKETS = 15;

const newSeed = () => Math.floor(Math.random() * 0x7ffffffe) + 1;

export type LiSentence = { index: number; start: number; end: number; words: number; paragraph: number };
export type LiParagraph = { index: number; start: number; end: number; words: number; sentences: number; characters: number; letters: number };
export type LiWord = { word: string; count: number };

export type LiAnalysis = {
  text: string;
  words: number;
  sentences: LiSentence[];
  paragraphs: LiParagraph[];
  characters: number;
  charactersNoSpaces: number;
  composition: TextComposition;
  /** wordLengths[i] = words with i + 1 letters; the last bucket is "15 or more". */
  wordLengths: number[];
  totalLetters: number;
  longestWord: string;
  /** Every distinct word (normalized), most frequent first. */
  vocabulary: LiWord[];
  /** Letter counts (lower-case), most frequent first. */
  letters: { letter: string; count: number }[];
};

function analyze(text: string): LiAnalysis {
  const tokens = tokenizeWords(text);
  const paragraphSpans = splitParagraphs(text);
  const sentences: LiSentence[] = [];
  const paragraphs: LiParagraph[] = paragraphSpans.map((span, index) => {
    const body = text.slice(span.start, span.end);
    const inner = splitSentences(body);
    for (const s of inner) {
      sentences.push({
        index: sentences.length,
        start: span.start + s.start,
        end: span.start + s.end,
        words: countWords(body.slice(s.start, s.end)),
        paragraph: index,
      });
    }
    const letters = tokenizeWords(body).reduce((a, tk) => a + wordLength(tk.word), 0);
    return { index, start: span.start, end: span.end, words: countWords(body), sentences: inner.length, characters: body.length, letters };
  });

  const wordLengths = new Array<number>(WORD_LENGTH_BUCKETS).fill(0);
  const frequency = new Map<string, number>();
  let totalLetters = 0;
  let longestWord = "";
  for (const { word, key } of tokens) {
    const len = wordLength(word);
    totalLetters += len;
    if (len > 0) wordLengths[Math.min(len, WORD_LENGTH_BUCKETS) - 1]++;
    if (len > wordLength(longestWord)) longestWord = key;
    frequency.set(key, (frequency.get(key) ?? 0) + 1);
  }
  const profile = profileText(text, 0, 26);

  return {
    text,
    words: tokens.length,
    sentences,
    paragraphs,
    characters: text.length,
    charactersNoSpaces: text.length - profile.composition.spaces,
    composition: profile.composition,
    wordLengths,
    totalLetters,
    longestWord,
    vocabulary: [...frequency.entries()].sort((a, b) => b[1] - a[1]).map(([word, count]) => ({ word, count })),
    letters: profile.letters,
  };
}

const EMPTY_ANALYSIS = analyze("");

type LiLive = {
  unit: LoremUnit;
  setUnit: (next: LoremUnit) => void;
  count: string;
  setCount: (next: string) => void;
  style: LoremStyle;
  setStyle: (next: LoremStyle) => void;
  startWithLorem: boolean;
  setStartWithLorem: (next: boolean) => void;
  /** Parsed "How many" value (0 when unreadable). */
  countValue: number;
  /** Generate: same settings, fresh random text. */
  regenerate: () => void;
  /** Clear: default settings and fresh random text. */
  reset: () => void;
  /** LoremIpsumCalculator output for the (deferred) settings. */
  result: LoremIpsumOutput;
  ok: boolean;
  /** Segmentation of the generated text (debounced). */
  analysis: LiAnalysis;
  /** Structural word range for the current settings (null when the count is invalid). */
  range: LoremWordRange | null;
  bankSize: number;
  digitStyle: DigitStyle;
  f: (v: number, max?: number) => string;
  pct: (share: number) => string;
  activeParagraph: number | null;
  /** Selects paragraph `index` in the result text; `reveal` also scrolls the result card into view. */
  selectParagraph: (index: number | null, reveal?: boolean) => void;
  textBoxRef: RefObject<HTMLDivElement | null>;
};

const Context = createContext<LiLive | null>(null);

/** Heavier analysis waits for a short pause (e.g. while a slider is dragged). */
function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function LiLiveProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<LoremUnit>(DEFAULTS.unit);
  const [count, setCountState] = useState(DEFAULTS.count);
  const [style, setStyleState] = useState<LoremStyle>(DEFAULTS.style);
  const [startWithLorem, setStartWithLoremState] = useState(DEFAULTS.startWithLorem);
  const [manualSeed, setManualSeed] = useState<number | null>(null);
  const [activeParagraph, setActiveParagraph] = useState<number | null>(null);
  const textBoxRef = useRef<HTMLDivElement | null>(null);
  const seed = manualSeed ?? INITIAL_SEED;

  const countValue = parseLocalizedNumber(count) || 0;
  const args = useMemo(() => ({ unit, count: countValue, style, startWithLorem }), [unit, countValue, style, startWithLorem]);
  const deferredArgs = useDeferredValue(args);
  const result = useMemo(() => tool.execute({ ...deferredArgs, randomFn: seededLoremRandom(seed) }, { locale: "en-US" }).data, [deferredArgs, seed]);
  const ok = result.error === null;
  const debouncedText = useDebounced(result.text, result.text.length > 8000 ? 120 : 40);
  const analysis = useMemo(() => analyze(debouncedText), [debouncedText]);
  const range = useMemo(() => loremWordRange(deferredArgs), [deferredArgs]);
  const digitStyle = resolveDigitStyle(count);

  // Any settings change regenerates the text, so a paragraph selection would point at different text.
  // The first change also leaves the fixed initial seed for a random one; later changes keep that seed.
  const leaveInitialSeed = useCallback(() => {
    const fresh = newSeed();
    setManualSeed((current) => current ?? fresh);
    setActiveParagraph(null);
  }, []);
  const setUnit = useCallback((next: LoremUnit) => {
    setUnitState(next);
    leaveInitialSeed();
  }, [leaveInitialSeed]);
  const setCount = useCallback((next: string) => {
    setCountState(next);
    leaveInitialSeed();
  }, [leaveInitialSeed]);
  const setStyle = useCallback((next: LoremStyle) => {
    setStyleState(next);
    leaveInitialSeed();
  }, [leaveInitialSeed]);
  const setStartWithLorem = useCallback((next: boolean) => {
    setStartWithLoremState(next);
    leaveInitialSeed();
  }, [leaveInitialSeed]);

  const regenerate = useCallback(() => {
    setManualSeed(newSeed());
    setActiveParagraph(null);
  }, []);

  const reset = useCallback(() => {
    setUnitState(DEFAULTS.unit);
    setCountState(DEFAULTS.count);
    setStyleState(DEFAULTS.style);
    setStartWithLoremState(DEFAULTS.startWithLorem);
    setManualSeed(newSeed());
    setActiveParagraph(null);
  }, []);

  const selectParagraph = useCallback((index: number | null, reveal = false) => {
    setActiveParagraph(index);
    const box = textBoxRef.current;
    if (index === null || !box) return;
    const el = box.querySelector<HTMLElement>(`[data-para="${index}"]`);
    if (el) box.scrollTo({ top: Math.max(0, el.offsetTop - 8), behavior: "smooth" }); // the box is the paragraphs' offsetParent
    if (reveal) box.scrollIntoView({ block: "center", behavior: "smooth" });
  }, []);

  const value = useMemo<LiLive>(() => {
    const f = (v: number, max = 1) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: max });
    const pct = (share: number) => `${formatLocalizedNumber(share * 100, digitStyle, { maximumFractionDigits: 1 })}%`;
    return {
      unit,
      setUnit,
      count,
      setCount,
      style,
      setStyle,
      startWithLorem,
      setStartWithLorem,
      countValue,
      regenerate,
      reset,
      result,
      ok,
      analysis: ok ? analysis : EMPTY_ANALYSIS,
      range,
      bankSize: loremWordBankSize(deferredArgs.style),
      digitStyle,
      f,
      pct,
      activeParagraph,
      selectParagraph,
      textBoxRef,
    };
  }, [unit, setUnit, count, setCount, style, setStyle, startWithLorem, setStartWithLorem, countValue, regenerate, reset, result, ok, analysis, range, deferredArgs.style, digitStyle, activeParagraph, selectParagraph]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useLiLive(): LiLive {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useLiLive must be used inside LiLiveProvider (LoremIpsumGenerator wraps the page).");
  return ctx;
}

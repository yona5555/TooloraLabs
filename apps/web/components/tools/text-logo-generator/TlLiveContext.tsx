"use client";
import { createContext, useCallback, useContext, useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import {
  TEXT_LOGO_STYLES,
  TextLogoCalculator as LogoTool,
  textLogoGlyphs,
  textLogoRecover,
  utf8ByteLength,
  type TextLogoGlyph,
  type TextLogoStyle,
} from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";

const tool = new LogoTool();

export type TlStyleStats = {
  style: TextLogoStyle;
  styled: string;
  glyphs: TextLogoGlyph[];
  /** Visible characters (code points) — the same for every style. */
  characters: number;
  /** Letters and digits the style replaced (block offset or legacy exception). */
  mapped: number;
  exceptions: number;
  /** Latin letters/digits the style has no variant for (e.g. italic digits). */
  unchanged: number;
  /** Spaces, punctuation and non-Latin characters, kept as typed. */
  other: number;
  utf16: number;
  utf8: number;
  /** Characters stored as a surrogate pair (2 UTF-16 units). */
  surrogates: number;
  recovered: string;
};

export type TlPlain = { characters: number; utf16: number; utf8: number; latin: number; other: number };

type TlLive = {
  text: string;
  setText: (next: string) => void;
  sample: string;
  /** Clear: back to the sample text so the page is never empty. */
  reset: () => void;
  appendChar: (ch: string) => void;
  ok: boolean;
  /** Trimmed input as the calculator sees it. */
  source: string;
  plain: TlPlain;
  styles: TlStyleStats[];
  active: TlStyleStats;
  activeStyle: TextLogoStyle;
  setActiveStyle: (next: TextLogoStyle) => void;
  /** Index of the inspected character in `source` (clamped to the text). */
  activeChar: number;
  setActiveChar: (index: number) => void;
  styleName: (style: TextLogoStyle) => string;
  digitStyle: DigitStyle;
  f: (v: number, max?: number) => string;
  pct: (share: number) => string;
};

const Context = createContext<TlLive | null>(null);

export const hex = (cp: number) => `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;

function statsFor(source: string, style: TextLogoStyle): TlStyleStats {
  const styled = tool.execute({ text: source, style }, { locale: "en-US" }).data.styledText;
  const glyphs = textLogoGlyphs(source, style);
  let mapped = 0;
  let exceptions = 0;
  let unchanged = 0;
  let other = 0;
  let surrogates = 0;
  for (const g of glyphs) {
    if (g.mapped) mapped++;
    else if (g.kind === "other") other++;
    else unchanged++;
    if (g.exception) exceptions++;
    if (g.utf16Units === 2) surrogates++;
  }
  return {
    style,
    styled,
    glyphs,
    characters: glyphs.length,
    mapped,
    exceptions,
    unchanged,
    other,
    utf16: styled.length,
    utf8: utf8ByteLength(styled),
    surrogates,
    recovered: textLogoRecover(styled),
  };
}

export function TlLiveProvider({ children }: { children: ReactNode }) {
  const tl = useTranslations("tools.text-logo-generator.live");
  const tStyles = useTranslations("tools.text-logo-generator.result.styles");
  const sample = tl("sample");
  const [text, setText] = useState(sample);
  const [activeStyle, setActiveStyle] = useState<TextLogoStyle>("bold");
  const [charIndex, setCharIndex] = useState(0);

  const deferredText = useDeferredValue(text);
  const source = deferredText.trim();
  const ok = source.length > 0;
  const styles = useMemo(() => TEXT_LOGO_STYLES.map((style) => statsFor(source, style)), [source]);
  const plain = useMemo<TlPlain>(() => {
    const chars = Array.from(source);
    const latin = chars.filter((c) => /^[A-Za-z0-9]$/.test(c)).length;
    return { characters: chars.length, utf16: source.length, utf8: utf8ByteLength(source), latin, other: chars.length - latin };
  }, [source]);
  const active = styles.find((s) => s.style === activeStyle) ?? styles[0];
  const activeChar = Math.min(charIndex, Math.max(0, active.characters - 1));
  const digitStyle = resolveDigitStyle(text);

  const reset = useCallback(() => {
    setText(sample);
    setCharIndex(0);
  }, [sample]);
  const appendChar = useCallback((ch: string) => setText((prev) => prev + ch), []);

  const value = useMemo<TlLive>(() => {
    const f = (v: number, max = 1) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: max });
    const pct = (share: number) => `${formatLocalizedNumber(share * 100, digitStyle, { maximumFractionDigits: 1 })}%`;
    return {
      text,
      setText,
      sample,
      reset,
      appendChar,
      ok,
      source,
      plain,
      styles,
      active,
      activeStyle,
      setActiveStyle,
      activeChar,
      setActiveChar: setCharIndex,
      styleName: (style) => tStyles(style),
      digitStyle,
      f,
      pct,
    };
  }, [text, sample, reset, appendChar, ok, source, plain, styles, active, activeStyle, activeChar, tStyles, digitStyle]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useTlLive(): TlLive {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useTlLive must be used inside TlLiveProvider (TextLogoGenerator wraps the page).");
  return ctx;
}

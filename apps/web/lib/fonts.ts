// Every font the site draws text with is self-hosted: the files in public/fonts, their @font-face rules in
// styles/fonts.css. No text may fall back to a system font: the same page then renders with different glyph widths
// on macOS, Windows, Android and Linux, which moves, clips or overlaps labels on some visitors' screens only.
// The family stacks (--font-sans/-mono/-serif per locale) live in app/globals.css; scripts/system-fonts.mjs
// (npm run test:system-fonts) fails on any system family name in the source.
//   Arimo                  Latin UI text (metric-compatible with Arial, the font the approved layout was drawn with)
//   IBM Plex Mono          numbers and chart text (font-mono, every chart's fontFamily="var(--font-mono)")
//   IBM Plex Sans Arabic   ar      Noto Sans Devanagari   hi      Tinos   serif text (Times-metric)
//   Noto Sans Math / Symbols 2     last fallback for math operators and symbols (✓) the text fonts lack

const ARIMO = "/fonts/arimo-latin.woff2";

/** The one file a page preloads, the face of its above-the-fold text, so no locale fetches another locale's font ahead of its LCP. Arabic has static weights, so ar preloads the h1's. */
const LOCALE_FONT: Record<string, string> = {
  en: ARIMO,
  es: ARIMO,
  fr: ARIMO,
  de: ARIMO,
  ar: "/fonts/plex-arabic-700.woff2",
  hi: "/fonts/noto-devanagari.woff2",
};

export function localeFontPreload(locale: string): string {
  return LOCALE_FONT[locale] ?? ARIMO;
}

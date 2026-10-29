import { Arimo, IBM_Plex_Mono, IBM_Plex_Sans_Arabic, Noto_Sans_Devanagari, Noto_Sans_Math, Noto_Sans_Symbols_2, Tinos } from "next/font/google";

// Every font the site draws text with, self-hosted by next/font (downloaded at build, served from our own
// origin). No text may fall back to a system font: the same page then renders with different glyph widths on
// macOS, Windows, Android and Linux, which moves, clips or overlaps labels on some visitors' screens only.
// The family stacks (--font-sans/-mono/-serif per locale) live in app/globals.css; tests/system-fonts.test.mjs
// fails on any system family name in the source.
//   Arimo                  Latin UI text (metric-compatible with Arial, the font the approved layout was drawn with)
//   IBM Plex Mono          numbers and chart text (font-mono, every chart's fontFamily="var(--font-mono)")
//   IBM Plex Sans Arabic   ar      Noto Sans Devanagari   hi      Tinos   serif text (Times-metric)
//   Noto Sans Math / Symbols 2     last fallback for math operators and symbols (✓) the text fonts lack
// Only Arimo is preloaded (the LCP text on every page); the others download when a page's text uses them.

const arimo = Arimo({ subsets: ["latin", "latin-ext", "greek"], variable: "--font-arimo", display: "swap" });
const plexMono = IBM_Plex_Mono({ weight: ["400", "500", "600", "700"], subsets: ["latin", "latin-ext"], variable: "--font-plex-mono", display: "swap", preload: false });
const plexArabic = IBM_Plex_Sans_Arabic({ weight: ["400", "500", "600", "700"], subsets: ["arabic"], variable: "--font-plex-arabic", display: "swap", preload: false });
const notoDevanagari = Noto_Sans_Devanagari({ weight: ["400", "500", "600", "700"], subsets: ["devanagari"], variable: "--font-noto-devanagari", display: "swap", preload: false });
const tinos = Tinos({ weight: ["400", "700"], subsets: ["latin", "latin-ext", "greek"], variable: "--font-tinos", display: "swap", preload: false });
const notoMath = Noto_Sans_Math({ weight: "400", variable: "--font-noto-math", display: "swap" }); // no subsets: never preloaded
const notoSymbols = Noto_Sans_Symbols_2({ weight: "400", subsets: ["symbols", "math"], variable: "--font-noto-symbols", display: "swap", preload: false });

/** The font variable classes, set once on <html> so every --font-* stack resolves on every page. */
export const fontVariables = [arimo, plexMono, plexArabic, notoDevanagari, tinos, notoMath, notoSymbols].map((f) => f.variable).join(" ");

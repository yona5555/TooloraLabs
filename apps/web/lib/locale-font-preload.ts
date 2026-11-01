/**
 * The one font file a page preloads, chosen by its locale: the face of its above-the-fold text, so no locale ever
 * fetches another locale's font ahead of its LCP. Arabic has static weights, so ar preloads the h1's. The files are in
 * public/fonts, their @font-face rules in app/globals.css.
 */
const ARIMO = "/fonts/arimo-latin.woff2";

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

import { IBM_Plex_Sans_Arabic, Noto_Sans_Devanagari } from "next/font/google";

// No preload: both fonts sit in the shared [locale] layout, so a preload ships them to every locale
// (en pages preloaded ~255 KB of Arabic + Devanagari they never use, ahead of their LCP; next/dynamic
// does not split a font's preload by locale). Without it the browser fetches a face only when the
// page's text uses it, i.e. on ar / hi pages only.

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic"],
  display: "swap",
  preload: false,
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  weight: ["400", "500", "600", "700"],
  subsets: ["devanagari"],
  display: "swap",
  preload: false,
});

/** Latin-script locales render fine with the default Arial/Helvetica stack. */
export function getLocaleFontClassName(locale: string): string | undefined {
  if (locale === "ar") return ibmPlexSansArabic.className;
  if (locale === "hi") return notoSansDevanagari.className;
  return undefined;
}

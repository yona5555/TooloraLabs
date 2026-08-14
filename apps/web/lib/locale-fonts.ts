import { IBM_Plex_Sans_Arabic, Noto_Sans_Devanagari } from "next/font/google";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic"],
  display: "swap",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  weight: ["400", "500", "600", "700"],
  subsets: ["devanagari"],
  display: "swap",
});

/** Latin-script locales render fine with the default Arial/Helvetica stack. */
export function getLocaleFontClassName(locale: string): string | undefined {
  if (locale === "ar") return ibmPlexSansArabic.className;
  if (locale === "hi") return notoSansDevanagari.className;
  return undefined;
}

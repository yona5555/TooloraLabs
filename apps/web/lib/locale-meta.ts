type LocaleMeta = {
  /** Name of the language written in that language itself, for the switcher UI. */
  nativeName: string;
  dir: "ltr" | "rtl";
  /** BCP 47 / og:locale style tag, e.g. "en_US". */
  ogLocale: string;
};

export const localeMeta: Record<string, LocaleMeta> = {
  en: { nativeName: "English", dir: "ltr", ogLocale: "en_US" },
  ar: { nativeName: "العربية", dir: "rtl", ogLocale: "ar_AR" },
  es: { nativeName: "Español", dir: "ltr", ogLocale: "es_ES" },
  hi: { nativeName: "हिन्दी", dir: "ltr", ogLocale: "hi_IN" },
  fr: { nativeName: "Français", dir: "ltr", ogLocale: "fr_FR" },
  de: { nativeName: "Deutsch", dir: "ltr", ogLocale: "de_DE" },
};

export function getLocaleDir(locale: string): "ltr" | "rtl" {
  return localeMeta[locale]?.dir ?? "ltr";
}

export function getOgLocale(locale: string): string {
  return localeMeta[locale]?.ogLocale ?? "en_US";
}

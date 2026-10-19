import { routing } from "@/i18n/routing";

/**
 * canonical + hreflang links for one page, shared by every route's
 * generateMetadata so all pages point to the same six locale URLs (plus
 * x-default, the default locale) and stay reciprocal. `path` is the
 * locale-less path ("" for home, "/tools/bmi-calculator", ...).
 */
export function localeAlternates(locale: string, path: string) {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(routing.locales.map((loc) => [loc, `/${loc}${path}`])),
      "x-default": `/${routing.defaultLocale}${path}`,
    },
  };
}

import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";
import { indexablePaths } from "@/lib/indexable-pages";

function urlFor(path: string, locale: string) {
  return `${SITE_URL}/${locale}${path}`;
}

function alternatesFor(path: string) {
  return {
    ...Object.fromEntries(routing.locales.map((locale) => [locale, urlFor(path, locale)])),
    "x-default": urlFor(path, routing.defaultLocale),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return indexablePaths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: urlFor(path, locale),
      alternates: { languages: alternatesFor(path) },
      changeFrequency: path === "" ? ("daily" as const) : ("weekly" as const),
      priority: path === "" ? 1 : path.startsWith("/tools/") ? 0.8 : path.startsWith("/docs/") ? 0.7 : 0.6,
    })),
  );
}

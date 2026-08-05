import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { tools } from "@/data/tools";
import { categories } from "@/data/categories";
import { SITE_URL } from "@/lib/site";

function urlFor(path: string, locale: string) {
  return `${SITE_URL}/${locale}${path}`;
}

function alternatesFor(path: string) {
  return Object.fromEntries(routing.locales.map((locale) => [locale, urlFor(path, locale)]));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/about", "/contact", "/privacy", "/terms", "/affiliate-disclosure"];
  const categoryPaths = categories.map((category) => `/categories/${category.slug}`);
  const toolPaths = tools.map((tool) => `/tools/${tool.slug}`);

  const paths = [...staticPaths, ...categoryPaths, ...toolPaths];

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: urlFor(path, locale),
      alternates: { languages: alternatesFor(path) },
      changeFrequency: path === "" ? ("daily" as const) : ("weekly" as const),
      priority: path === "" ? 1 : path.startsWith("/tools/") ? 0.8 : 0.6,
    })),
  );
}

import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { tools } from "@/data/tools";
import { categoryPages } from "@/data/categories";
import { SITE_URL } from "@/lib/site";
import { DOCUMENTED_TOOL_SLUGS } from "@/lib/docs-tools";

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
  const staticPaths = [
    "",
    "/tools",
    "/docs",
    "/categories",
    "/compare/financial-calculators",
    "/embed-tools",
    "/coming-soon",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/affiliate-disclosure",
  ];
  const categoryPaths = categoryPages.map((category) => `/categories/${category.slug}`);
  const toolPaths = tools.map((tool) => `/tools/${tool.slug}`);
  const docsPaths = DOCUMENTED_TOOL_SLUGS.map((slug) => `/docs/${slug}`);

  const paths = [...staticPaths, ...categoryPaths, ...toolPaths, ...docsPaths];

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: urlFor(path, locale),
      alternates: { languages: alternatesFor(path) },
      changeFrequency: path === "" ? ("daily" as const) : ("weekly" as const),
      priority: path === "" ? 1 : path.startsWith("/tools/") ? 0.8 : path.startsWith("/docs/") ? 0.7 : 0.6,
    })),
  );
}

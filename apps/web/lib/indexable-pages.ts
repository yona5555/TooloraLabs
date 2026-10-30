import { getTranslations } from "next-intl/server";
import { tools } from "@/data/tools";
import { categoryPages } from "@/data/categories";
import { DOCUMENTED_TOOL_SLUGS } from "@/lib/docs-tools";

/**
 * Every indexable page (locale-free path), single source for the sitemap (app/sitemap.ts), the share images
 * (app/share/[locale]/[image]/route.tsx) and each page's og:image/twitter:image (lib/share-image/meta.ts).
 * A page added here is in the sitemap and gets its share image; tests/share-images.test.mjs fails when a
 * sitemap URL has no og:image or its image does not answer 200 image/png.
 */
type T = Awaited<ReturnType<typeof getTranslations>>;
type PageDef = { path: string; title: (locale: string) => Promise<string> };

const msg = (namespace: string, key: string) => async (locale: string) => (await getTranslations({ locale, namespace }))(key);
const docsTitle = (slug: string) => async (locale: string) => {
  const [tt, td]: T[] = await Promise.all([getTranslations({ locale, namespace: "tools" }), getTranslations({ locale, namespace: "docsNav" })]);
  return `${tt(`${slug}.title`)} — ${td("toolsGuide")}`;
};

const PAGES: PageDef[] = [
  { path: "", title: msg("site", "description") },
  { path: "/tools", title: msg("toolsPage", "heading") },
  { path: "/docs", title: msg("docsNav", "toolsGuide") },
  { path: "/categories", title: msg("categoriesSection", "heading") },
  { path: "/compare/financial-calculators", title: msg("compareFinancialCalculators", "title") },
  { path: "/embed-tools", title: msg("embedTools.docsPage", "title") },
  { path: "/coming-soon", title: msg("comingSoonPage", "heading") },
  { path: "/about", title: msg("legal.about", "title") },
  { path: "/contact", title: msg("legal.contact", "title") },
  { path: "/privacy", title: msg("legal.privacy", "title") },
  { path: "/terms", title: msg("legal.terms", "title") },
  { path: "/affiliate-disclosure", title: msg("legal.affiliateDisclosure", "title") },
  ...categoryPages.map((c) => ({ path: `/categories/${c.slug}`, title: msg("categories", `${c.slug}.title`) })),
  ...tools.map((t) => ({ path: `/tools/${t.slug}`, title: msg("tools", `${t.slug}.title`) })),
  ...DOCUMENTED_TOOL_SLUGS.map((slug) => ({ path: `/docs/${slug}`, title: docsTitle(slug) })),
];

/** The share image key of a path: "home", a tool's slug (its image URL predates the other pages), else "page-" + the path. */
export function shareKey(path: string): string {
  if (path === "") return "home";
  if (path.startsWith("/tools/")) return path.slice("/tools/".length);
  return `page-${path.slice(1).replaceAll("/", "-")}`;
}

export const indexablePaths: string[] = PAGES.map((p) => p.path);

const byKey = new Map(PAGES.map((p) => [shareKey(p.path), p]));
if (byKey.size !== PAGES.length) throw new Error("indexable-pages: two pages share one share-image key");

export const shareKeys: string[] = [...byKey.keys()];

/** The title on a page's share image, or undefined when the key is not an indexable page. */
export async function shareTitle(key: string, locale: string): Promise<string | undefined> {
  return byKey.get(key)?.title(locale);
}

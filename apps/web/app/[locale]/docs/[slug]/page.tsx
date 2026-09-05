import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getOgLocale } from "@/lib/locale-meta";
import DocsLayout from "@/components/docs/DocsLayout";
import TableOfContents from "@/components/docs/TableOfContents";
import CompoundInterestDocsPage, { getCompoundInterestTocItems } from "@/components/docs/compound-interest-calculator/CompoundInterestDocsPage";

type DocsPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

// Pilot phase: only compound-interest-calculator has a documentation page built
// so far (see MULTI-DEVICE-COORDINATION.md / project notes for the rollout plan).
// Adding the next tool means adding one more case to the switch below, mirroring
// apps/web/app/[locale]/tools/[slug]/page.tsx's own extensibility pattern.
const DOCUMENTED_SLUGS = ["compound-interest-calculator"];

export function generateStaticParams() {
  return DOCUMENTED_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!DOCUMENTED_SLUGS.includes(slug)) {
    const t = await getTranslations({ locale, namespace: "toolPage" });
    return { title: `${t("notFoundTitle")} | TooloraLabs` };
  }

  const t = await getTranslations({ locale, namespace: "tools" });
  const pageTitle = `${t(`${slug}.title`)} Docs | TooloraLabs`;
  const description = t(`${slug}.description`);
  const path = `/docs/${slug}`;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: Object.fromEntries(routing.locales.map((loc) => [loc, `/${loc}${path}`])),
    },
    openGraph: {
      title: pageTitle,
      description,
      url: `/${locale}${path}`,
      siteName: "TooloraLabs",
      locale: getOgLocale(locale),
      alternateLocale: routing.locales.filter((loc) => loc !== locale).map(getOgLocale),
      type: "website",
    },
  };
}

export default async function DocsToolPage({ params }: DocsPageProps) {
  const { slug } = await params;
  if (!DOCUMENTED_SLUGS.includes(slug)) {
    notFound();
  }

  let content = null;
  let tocItems: Awaited<ReturnType<typeof getCompoundInterestTocItems>> = [];

  switch (slug) {
    case "compound-interest-calculator":
      content = <CompoundInterestDocsPage />;
      tocItems = await getCompoundInterestTocItems();
      break;
  }

  return <DocsLayout toc={<TableOfContents items={tocItems} />}>{content}</DocsLayout>;
}

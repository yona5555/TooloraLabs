import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getOgLocale } from "@/lib/locale-meta";
import { DOCUMENTED_TOOL_SLUGS } from "@/lib/docs-tools";
import DocsLayout from "@/components/docs/DocsLayout";
import TableOfContents, { type TocItem } from "@/components/docs/TableOfContents";
import CompoundInterestDocsPage, { getCompoundInterestTocItems } from "@/components/docs/compound-interest-calculator/CompoundInterestDocsPage";
import LoanCalculatorDocsPage, { getLoanCalculatorTocItems } from "@/components/docs/loan-calculator/LoanCalculatorDocsPage";
import AffordableLoanCalculatorDocsPage, { getAffordableLoanCalculatorTocItems } from "@/components/docs/affordable-loan-calculator/AffordableLoanCalculatorDocsPage";
import RetirementCalculatorDocsPage, { getRetirementCalculatorTocItems } from "@/components/docs/retirement-calculator/RetirementCalculatorDocsPage";
import HouseAffordabilityCalculatorDocsPage, { getHouseAffordabilityCalculatorTocItems } from "@/components/docs/house-affordability-calculator/HouseAffordabilityCalculatorDocsPage";
import DebtToIncomeCalculatorDocsPage, { getDebtToIncomeCalculatorTocItems } from "@/components/docs/debt-to-income-calculator/DebtToIncomeCalculatorDocsPage";
import MortgageCalculatorDocsPage, { getMortgageCalculatorTocItems } from "@/components/docs/mortgage-calculator/MortgageCalculatorDocsPage";

type DocsPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return DOCUMENTED_TOOL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!DOCUMENTED_TOOL_SLUGS.includes(slug)) {
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
  if (!DOCUMENTED_TOOL_SLUGS.includes(slug)) {
    notFound();
  }

  let content = null;
  let tocItems: TocItem[] = [];

  switch (slug) {
    case "compound-interest-calculator":
      content = <CompoundInterestDocsPage />;
      tocItems = await getCompoundInterestTocItems();
      break;
    case "loan-calculator":
      content = <LoanCalculatorDocsPage />;
      tocItems = await getLoanCalculatorTocItems();
      break;
    case "affordable-loan-calculator":
      content = <AffordableLoanCalculatorDocsPage />;
      tocItems = await getAffordableLoanCalculatorTocItems();
      break;
    case "retirement-calculator":
      content = <RetirementCalculatorDocsPage />;
      tocItems = await getRetirementCalculatorTocItems();
      break;
    case "house-affordability-calculator":
      content = <HouseAffordabilityCalculatorDocsPage />;
      tocItems = await getHouseAffordabilityCalculatorTocItems();
      break;
    case "debt-to-income-calculator":
      content = <DebtToIncomeCalculatorDocsPage />;
      tocItems = await getDebtToIncomeCalculatorTocItems();
      break;
    case "mortgage-calculator":
      content = <MortgageCalculatorDocsPage />;
      tocItems = await getMortgageCalculatorTocItems();
      break;
  }

  return <DocsLayout toc={<TableOfContents items={tocItems} />}>{content}</DocsLayout>;
}

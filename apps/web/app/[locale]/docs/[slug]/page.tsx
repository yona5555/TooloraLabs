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
import PercentageCalculatorDocsPage, { getPercentageCalculatorTocItems } from "@/components/docs/percentage-calculator/PercentageCalculatorDocsPage";
import GcfLcmCalculatorDocsPage, { getGcfLcmCalculatorTocItems } from "@/components/docs/gcf-lcm-calculator/GcfLcmCalculatorDocsPage";
import FractionCalculatorDocsPage, { getFractionCalculatorTocItems } from "@/components/docs/fraction-calculator/FractionCalculatorDocsPage";
import ScientificNotationConverterDocsPage, { getScientificNotationConverterTocItems } from "@/components/docs/scientific-notation-converter/ScientificNotationConverterDocsPage";
import SignificantFiguresCalculatorDocsPage, { getSignificantFiguresCalculatorTocItems } from "@/components/docs/significant-figures-calculator/SignificantFiguresCalculatorDocsPage";
import AreaCalculatorDocsPage, { getAreaCalculatorTocItems } from "@/components/docs/area-calculator/AreaCalculatorDocsPage";
import SurfaceAreaCalculatorDocsPage, { getSurfaceAreaCalculatorTocItems } from "@/components/docs/surface-area-calculator/SurfaceAreaCalculatorDocsPage";
import VolumeCalculatorDocsPage, { getVolumeCalculatorTocItems } from "@/components/docs/volume-calculator/VolumeCalculatorDocsPage";
import CircleCalculatorDocsPage, { getCircleCalculatorTocItems } from "@/components/docs/circle-calculator/CircleCalculatorDocsPage";
import TriangleCalculatorDocsPage, { getTriangleCalculatorTocItems } from "@/components/docs/triangle-calculator/TriangleCalculatorDocsPage";

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
    case "percentage-calculator":
      content = <PercentageCalculatorDocsPage />;
      tocItems = await getPercentageCalculatorTocItems();
      break;
    case "gcf-lcm-calculator":
      content = <GcfLcmCalculatorDocsPage />;
      tocItems = await getGcfLcmCalculatorTocItems();
      break;
    case "fraction-calculator":
      content = <FractionCalculatorDocsPage />;
      tocItems = await getFractionCalculatorTocItems();
      break;
    case "scientific-notation-converter":
      content = <ScientificNotationConverterDocsPage />;
      tocItems = await getScientificNotationConverterTocItems();
      break;
    case "significant-figures-calculator":
      content = <SignificantFiguresCalculatorDocsPage />;
      tocItems = await getSignificantFiguresCalculatorTocItems();
      break;
    case "area-calculator":
      content = <AreaCalculatorDocsPage />;
      tocItems = await getAreaCalculatorTocItems();
      break;
    case "surface-area-calculator":
      content = <SurfaceAreaCalculatorDocsPage />;
      tocItems = await getSurfaceAreaCalculatorTocItems();
      break;
    case "volume-calculator":
      content = <VolumeCalculatorDocsPage />;
      tocItems = await getVolumeCalculatorTocItems();
      break;
    case "circle-calculator":
      content = <CircleCalculatorDocsPage />;
      tocItems = await getCircleCalculatorTocItems();
      break;
    case "triangle-calculator":
      content = <TriangleCalculatorDocsPage />;
      tocItems = await getTriangleCalculatorTocItems();
      break;
  }

  return <DocsLayout toc={<TableOfContents items={tocItems} />}>{content}</DocsLayout>;
}

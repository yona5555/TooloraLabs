import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import AgeCalculator from "@/components/tools/age-calculator/AgeCalculator";
import BMICalculator from "@/components/tools/bmi-calculator/BMICalculator";
import MortgageCalculator from "@/components/tools/mortgage-calculator/MortgageCalculator";
import PercentageCalculator from "@/components/tools/percentage-calculator/PercentageCalculator";
import TipCalculator from "@/components/tools/tip-calculator/TipCalculator";
import DiscountCalculator from "@/components/tools/discount-calculator/DiscountCalculator";
import SalesTaxCalculator from "@/components/tools/sales-tax-calculator/SalesTaxCalculator";
import JSONFormatterTool from "@/components/tools/json-formatter/JSONFormatterTool";
import PasswordGeneratorTool from "@/components/tools/password-generator/PasswordGeneratorTool";
import UnitConverterTool from "@/components/tools/unit-converter/UnitConverterTool";
import QRCodeGeneratorTool from "@/components/tools/qr-code-generator/QRCodeGeneratorTool";
import ImageConverterTool from "@/components/tools/image-converter/ImageConverterTool";
import WordCounterTool from "@/components/tools/word-counter/WordCounterTool";
import Base64ToolUI from "@/components/tools/base64-tool/Base64ToolUI";
import ScientificCalculator from "@/components/tools/scientific-calculator/ScientificCalculator";
import CsvJsonConverterUI from "@/components/tools/csv-json-converter/CsvJsonConverterUI";
import FileSizeConverterTool from "@/components/tools/file-size-converter/FileSizeConverterTool";
import FileNameSanitizerTool from "@/components/tools/file-name-sanitizer/FileNameSanitizerTool";
import DuplicateLineRemoverTool from "@/components/tools/duplicate-line-remover/DuplicateLineRemoverTool";
import InvoiceGeneratorTool from "@/components/tools/invoice-generator/InvoiceGeneratorTool";
import InventoryValuationTool from "@/components/tools/inventory-valuation-calculator/InventoryValuationTool";
import BreakEvenCalculatorTool from "@/components/tools/break-even-calculator/BreakEvenCalculatorTool";
import ToolPageLayout from "@/components/tools/layout/ToolPageLayout";
import RelatedTools from "@/components/tools/RelatedTools";
import { tools } from "@/data/tools";
import { SITE_URL } from "@/lib/site";

type ToolPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export function generateStaticParams() {
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({
  params,
}: ToolPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const tool = tools.find((item) => item.slug === slug);
  if (!tool) {
    const t = await getTranslations({ locale, namespace: "toolPage" });
    return {
      title: `${t("notFoundTitle")} | TooloraLabs`,
    };
  }
  const t = await getTranslations({ locale, namespace: "tools" });
  const pageTitle = `${t(`${slug}.title`)} | TooloraLabs`;
  const description = t(`${slug}.description`);
  const path = `/tools/${slug}`;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: {
        en: `/en${path}`,
        ar: `/ar${path}`,
      },
    },
    openGraph: {
      title: pageTitle,
      description,
      url: `/${locale}${path}`,
      siteName: "TooloraLabs",
      locale: locale === "ar" ? "ar_AR" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_AR",
      type: "website",
    },
  };
}

function ComingSoon({
  title,
  line1,
  line2,
}: {
  title: string;
  line1: string;
  line2: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
      <p className="mt-4 text-zinc-600 dark:text-zinc-300">{line1}</p>
      <p className="mt-2 text-zinc-500 dark:text-zinc-400">{line2}</p>
    </div>
  );
}

export default async function ToolPage({
  params,
}: ToolPageProps) {
  const { locale, slug } = await params;
  const tool = tools.find((item) => item.slug === slug);
  if (!tool) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "tools" });
  const tp = await getTranslations({ locale, namespace: "toolPage" });
  const tc = await getTranslations({ locale, namespace: "categories" });

  const title = t(`${slug}.title`);
  const description = t(`${slug}.description`);

  let component = (
    <ComingSoon
      title={title}
      line1={tp("comingSoonLine1")}
      line2={tp("comingSoonLine2")}
    />
  );
  switch (slug) {
    case "age-calculator":
      component = <AgeCalculator />;
      break;
    case "bmi-calculator":
      component = <BMICalculator />;
      break;
    case "mortgage-calculator":
      component = <MortgageCalculator />;
      break;
    case "percentage-calculator":
      component = <PercentageCalculator />;
      break;
    case "tip-calculator":
      component = <TipCalculator />;
      break;
    case "discount-calculator":
      component = <DiscountCalculator />;
      break;
    case "sales-tax-calculator":
      component = <SalesTaxCalculator />;
      break;
    case "json-formatter":
      component = <JSONFormatterTool />;
      break;
    case "password-generator":
      component = <PasswordGeneratorTool />;
      break;
    case "unit-converter":
      component = <UnitConverterTool />;
      break;
    case "qr-code-generator":
      component = <QRCodeGeneratorTool />;
      break;
    case "image-converter":
      component = <ImageConverterTool />;
      break;
    case "word-counter":
      component = <WordCounterTool />;
      break;
    case "base64-tool":
      component = <Base64ToolUI />;
      break;
    case "scientific-calculator":
      component = <ScientificCalculator />;
      break;
    case "csv-json-converter":
      component = <CsvJsonConverterUI />;
      break;
    case "file-size-converter":
      component = <FileSizeConverterTool />;
      break;
    case "file-name-sanitizer":
      component = <FileNameSanitizerTool />;
      break;
    case "duplicate-line-remover":
      component = <DuplicateLineRemoverTool />;
      break;
    case "invoice-generator":
      component = <InvoiceGeneratorTool />;
      break;
    case "inventory-valuation-calculator":
      component = <InventoryValuationTool />;
      break;
    case "break-even-calculator":
      component = <BreakEvenCalculatorTool />;
      break;
  }

  const isAboveFoldLayout =
    slug === "bmi-calculator" || slug === "age-calculator" || slug === "mortgage-calculator";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    description,
    url: `${SITE_URL}/${locale}/tools/${slug}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    inLanguage: locale,
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolPageLayout
        category={tc(`${tool.category}.title`)}
        categorySlug={tool.category}
        backLabel={tp("back", { category: tc(`${tool.category}.title`) })}
        title={title}
        description={description}
        contentWidth={isAboveFoldLayout ? "wide" : "default"}
        compact={isAboveFoldLayout}
      >
        {component}
      </ToolPageLayout>
      {!isAboveFoldLayout && (
        <RelatedTools locale={locale} category={tool.category} currentSlug={slug} />
      )}
    </>
  );
}

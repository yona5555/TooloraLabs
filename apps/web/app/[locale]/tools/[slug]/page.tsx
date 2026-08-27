import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getOgLocale } from "@/lib/locale-meta";
import AgeCalculator from "@/components/tools/age-calculator/AgeCalculator";
import AgeEducation from "@/components/tools/age-calculator/AgeEducation";
import BMICalculator from "@/components/tools/bmi-calculator/BMICalculator";
import BMIEducation from "@/components/tools/bmi-calculator/BMIEducation";
import MortgageCalculator from "@/components/tools/mortgage-calculator/MortgageCalculator";
import MortgageEducation from "@/components/tools/mortgage-calculator/MortgageEducation";
import CryptoConverter from "@/components/tools/crypto-converter/CryptoConverter";
import CryptoEducation from "@/components/tools/crypto-converter/CryptoEducation";
import ForexConverter from "@/components/tools/forex-converter/ForexConverter";
import ForexEducation from "@/components/tools/forex-converter/ForexEducation";
import CommodityConverter from "@/components/tools/commodities-tracker/CommodityConverter";
import CommodityEducation from "@/components/tools/commodities-tracker/CommodityEducation";
import WeatherTracker from "@/components/tools/weather-forecast/WeatherTracker";
import WeatherEducation from "@/components/tools/weather-forecast/WeatherEducation";
import TDEECalculator from "@/components/tools/tdee-calculator/TDEECalculator";
import TDEEEducation from "@/components/tools/tdee-calculator/TDEEEducation";
import CompoundInterestCalculator from "@/components/tools/compound-interest-calculator/CompoundInterestCalculator";
import CompoundInterestEducation from "@/components/tools/compound-interest-calculator/CompoundInterestEducation";
import LoanCalculator from "@/components/tools/loan-calculator/LoanCalculator";
import LoanEducation from "@/components/tools/loan-calculator/LoanEducation";
import AffordableLoanCalculator from "@/components/tools/affordable-loan-calculator/AffordableLoanCalculator";
import AffordableLoanEducation from "@/components/tools/affordable-loan-calculator/AffordableLoanEducation";
import RetirementCalculator from "@/components/tools/retirement-calculator/RetirementCalculator";
import RetirementEducation from "@/components/tools/retirement-calculator/RetirementEducation";
import HouseAffordabilityCalculator from "@/components/tools/house-affordability-calculator/HouseAffordabilityCalculator";
import HouseAffordabilityEducation from "@/components/tools/house-affordability-calculator/HouseAffordabilityEducation";
import DebtToIncomeCalculator from "@/components/tools/debt-to-income-calculator/DebtToIncomeCalculator";
import DebtToIncomeEducation from "@/components/tools/debt-to-income-calculator/DebtToIncomeEducation";
import IdealWeightCalculator from "@/components/tools/ideal-weight-calculator/IdealWeightCalculator";
import IdealWeightEducation from "@/components/tools/ideal-weight-calculator/IdealWeightEducation";
import ColorPaletteGeneratorTool from "@/components/tools/color-palette-generator/ColorPaletteGenerator";
import ColorPaletteEducation from "@/components/tools/color-palette-generator/ColorPaletteEducation";
import PdfMergeSplitTool from "@/components/tools/pdf-merge-split/PdfMergeSplitTool";
import PdfMergeSplitEducation from "@/components/tools/pdf-merge-split/PdfMergeSplitEducation";
import ZipCompressorTool from "@/components/tools/zip-compressor/ZipCompressorTool";
import ZipCompressorEducation from "@/components/tools/zip-compressor/ZipCompressorEducation";
import WorldTimeCalculator from "@/components/tools/world-time-converter/WorldTimeCalculator";
import WorldTimeEducation from "@/components/tools/world-time-converter/WorldTimeEducation";
import FractionCalculator from "@/components/tools/fraction-calculator/FractionCalculator";
import FractionEducation from "@/components/tools/fraction-calculator/FractionEducation";
import ScientificNotationConverter from "@/components/tools/scientific-notation-converter/ScientificNotationConverter";
import ScientificNotationEducation from "@/components/tools/scientific-notation-converter/ScientificNotationEducation";
import PercentageCalculator from "@/components/tools/percentage-calculator/PercentageCalculator";
import PercentageEducation from "@/components/tools/percentage-calculator/PercentageEducation";
import TipCalculator from "@/components/tools/tip-calculator/TipCalculator";
import TipEducation from "@/components/tools/tip-calculator/TipEducation";
import DiscountCalculator from "@/components/tools/discount-calculator/DiscountCalculator";
import DiscountEducation from "@/components/tools/discount-calculator/DiscountEducation";
import SalesTaxCalculator from "@/components/tools/sales-tax-calculator/SalesTaxCalculator";
import SalesTaxEducation from "@/components/tools/sales-tax-calculator/SalesTaxEducation";
import JSONFormatterTool from "@/components/tools/json-formatter/JSONFormatterTool";
import JSONEducation from "@/components/tools/json-formatter/JSONEducation";
import PasswordGeneratorTool from "@/components/tools/password-generator/PasswordGeneratorTool";
import PasswordEducation from "@/components/tools/password-generator/PasswordEducation";
import UnitConverterTool from "@/components/tools/unit-converter/UnitConverterTool";
import UnitEducation from "@/components/tools/unit-converter/UnitEducation";
import QRCodeGeneratorTool from "@/components/tools/qr-code-generator/QRCodeGeneratorTool";
import QREducation from "@/components/tools/qr-code-generator/QREducation";
import BarcodeGeneratorTool from "@/components/tools/barcode-generator/BarcodeGeneratorTool";
import BarcodeEducation from "@/components/tools/barcode-generator/BarcodeEducation";
import ImageConverterTool from "@/components/tools/image-converter/ImageConverterTool";
import ImageEducation from "@/components/tools/image-converter/ImageEducation";
import WordCounterTool from "@/components/tools/word-counter/WordCounterTool";
import WordCounterEducation from "@/components/tools/word-counter/WordCounterEducation";
import Base64ToolUI from "@/components/tools/base64-tool/Base64ToolUI";
import Base64Education from "@/components/tools/base64-tool/Base64Education";
import ScientificCalculator from "@/components/tools/scientific-calculator/ScientificCalculator";
import ScientificEducation from "@/components/tools/scientific-calculator/ScientificEducation";
import CsvJsonConverterUI from "@/components/tools/csv-json-converter/CsvJsonConverterUI";
import CsvJsonEducation from "@/components/tools/csv-json-converter/CsvJsonEducation";
import FileSizeConverterTool from "@/components/tools/file-size-converter/FileSizeConverterTool";
import FileSizeEducation from "@/components/tools/file-size-converter/FileSizeEducation";
import FileNameSanitizerTool from "@/components/tools/file-name-sanitizer/FileNameSanitizerTool";
import FileNameEducation from "@/components/tools/file-name-sanitizer/FileNameEducation";
import DuplicateLineRemoverTool from "@/components/tools/duplicate-line-remover/DuplicateLineRemoverTool";
import DuplicateLineEducation from "@/components/tools/duplicate-line-remover/DuplicateLineEducation";
import InvoiceGeneratorTool from "@/components/tools/invoice-generator/InvoiceGeneratorTool";
import InvoiceEducation from "@/components/tools/invoice-generator/InvoiceEducation";
import InventoryValuationTool from "@/components/tools/inventory-valuation-calculator/InventoryValuationTool";
import InventoryEducation from "@/components/tools/inventory-valuation-calculator/InventoryEducation";
import BreakEvenCalculatorTool from "@/components/tools/break-even-calculator/BreakEvenCalculatorTool";
import BreakEvenEducation from "@/components/tools/break-even-calculator/BreakEvenEducation";
import ToolPageLayout from "@/components/tools/layout/ToolPageLayout";
import RelatedTools from "@/components/tools/RelatedTools";
import { tools } from "@/data/tools";
import { SITE_URL } from "@/lib/site";
import { getTopCoins, getGlobalStats, getUsdToSarRate, getFetchTimestamp } from "@/lib/crypto/coingecko";
import { getForexSnapshot } from "@/lib/forex/exchangerate";
import { getMetalSnapshot } from "@/lib/commodities/metalprice";
import { getOilSnapshot } from "@/lib/commodities/oilprice";
import { findCurrencyByCode } from "@tooloralabs/tools";
import { getWeatherSnapshot, PRIORITY_CITIES } from "@/lib/weather/open-meteo";

type ToolPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

/**
 * Excludes crypto-converter, forex-converter, commodities-tracker, and
 * weather-forecast: all four fetch live external data at render time
 * (CoinGecko; ExchangeRate-API + Frankfurter; MetalpriceAPI + OilPriceAPI;
 * Open-Meteo), so including them here would make `next build` itself
 * perform those fetches to prerender the page — burning limited free-tier
 * API quota on every build regardless of what changed, and failing the
 * whole build on a rate limit (429), as happened with CoinGecko on
 * 2026-08-08. Leaving them out of the static param list means
 * `dynamicParams` (default true) renders each on its first real request
 * instead, after which the `revalidate` window on their respective fetches
 * takes over as normal ISR.
 */
export function generateStaticParams() {
  const liveDataSlugs = new Set(["crypto-converter", "forex-converter", "commodities-tracker", "weather-forecast"]);
  return tools
    .filter((tool) => !liveDataSlugs.has(tool.slug))
    .map((tool) => ({
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
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, `/${loc}${path}`])
      ),
    },
    openGraph: {
      title: pageTitle,
      description,
      url: `/${locale}${path}`,
      siteName: "TooloraLabs",
      locale: getOgLocale(locale),
      alternateLocale: routing.locales
        .filter((loc) => loc !== locale)
        .map(getOgLocale),
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
      component = <AgeCalculator education={<AgeEducation />} />;
      break;
    case "bmi-calculator":
      component = <BMICalculator education={<BMIEducation />} />;
      break;
    case "mortgage-calculator":
      component = <MortgageCalculator education={<MortgageEducation />} />;
      break;
    case "crypto-converter": {
      const [initialCoins, globalStats, usdToSarRate] = await Promise.all([
        getTopCoins(100),
        getGlobalStats(),
        getUsdToSarRate(),
      ]);
      const fetchedAt = getFetchTimestamp();
      component = (
        <CryptoConverter
          initialCoins={initialCoins}
          globalStats={globalStats}
          usdToSarRate={usdToSarRate}
          fetchedAt={fetchedAt}
          education={<CryptoEducation />}
        />
      );
      break;
    }
    case "forex-converter": {
      const snapshot = await getForexSnapshot();
      component = (
        <ForexConverter
          initialCurrencies={snapshot.currencies}
          lastUpdatedUnix={snapshot.lastUpdatedUnix}
          education={<ForexEducation />}
        />
      );
      break;
    }
    case "commodities-tracker": {
      const [metals, oil, forex] = await Promise.all([getMetalSnapshot(), getOilSnapshot(), getForexSnapshot()]);
      const usdToSarRate = findCurrencyByCode(forex.currencies, "SAR")?.ratePerUsd ?? 3.75;
      component = (
        <CommodityConverter
          goldUsdPerOunce={metals.goldUsdPerOunce}
          silverUsdPerOunce={metals.silverUsdPerOunce}
          wtiUsdPerBarrel={oil.wtiUsdPerBarrel}
          usdToSarRate={usdToSarRate}
          lastUpdatedUnix={Math.min(metals.timestamp, oil.timestamp)}
          education={<CommodityEducation />}
        />
      );
      break;
    }
    case "weather-forecast": {
      const defaultCity = PRIORITY_CITIES[0];
      const tWeather = await getTranslations({ locale, namespace: "tools.weather-forecast.aboveFold" });
      const snapshot = await getWeatherSnapshot(defaultCity.latitude, defaultCity.longitude);
      component = (
        <WeatherTracker
          initialCity={{
            label: tWeather(`priorityCity.${defaultCity.nameKey}`),
            latitude: defaultCity.latitude,
            longitude: defaultCity.longitude,
          }}
          initialSnapshot={snapshot}
          education={<WeatherEducation />}
        />
      );
      break;
    }
    case "tdee-calculator":
      component = <TDEECalculator education={<TDEEEducation />} />;
      break;
    case "compound-interest-calculator":
      component = <CompoundInterestCalculator education={<CompoundInterestEducation />} />;
      break;
    case "loan-calculator":
      component = <LoanCalculator education={<LoanEducation />} />;
      break;
    case "affordable-loan-calculator":
      component = <AffordableLoanCalculator education={<AffordableLoanEducation />} />;
      break;
    case "retirement-calculator":
      component = <RetirementCalculator education={<RetirementEducation />} />;
      break;
    case "house-affordability-calculator":
      component = <HouseAffordabilityCalculator education={<HouseAffordabilityEducation />} />;
      break;
    case "debt-to-income-calculator":
      component = <DebtToIncomeCalculator education={<DebtToIncomeEducation />} />;
      break;
    case "ideal-weight-calculator":
      component = <IdealWeightCalculator education={<IdealWeightEducation />} />;
      break;
    case "color-palette-generator":
      component = <ColorPaletteGeneratorTool education={<ColorPaletteEducation />} />;
      break;
    case "pdf-merge-split":
      component = <PdfMergeSplitTool education={<PdfMergeSplitEducation />} />;
      break;
    case "zip-compressor":
      component = <ZipCompressorTool education={<ZipCompressorEducation />} />;
      break;
    case "world-time-converter":
      component = <WorldTimeCalculator education={<WorldTimeEducation />} />;
      break;
    case "fraction-calculator":
      component = <FractionCalculator education={<FractionEducation />} />;
      break;
    case "scientific-notation-converter":
      component = <ScientificNotationConverter education={<ScientificNotationEducation />} />;
      break;
    case "percentage-calculator":
      component = <PercentageCalculator education={<PercentageEducation />} />;
      break;
    case "tip-calculator":
      component = <TipCalculator education={<TipEducation />} />;
      break;
    case "discount-calculator":
      component = <DiscountCalculator education={<DiscountEducation />} />;
      break;
    case "sales-tax-calculator":
      component = <SalesTaxCalculator education={<SalesTaxEducation />} />;
      break;
    case "json-formatter":
      component = <JSONFormatterTool education={<JSONEducation />} />;
      break;
    case "password-generator":
      component = <PasswordGeneratorTool education={<PasswordEducation />} />;
      break;
    case "unit-converter":
      component = <UnitConverterTool education={<UnitEducation />} />;
      break;
    case "qr-code-generator":
      component = <QRCodeGeneratorTool education={<QREducation />} />;
      break;
    case "barcode-generator":
      component = <BarcodeGeneratorTool education={<BarcodeEducation />} />;
      break;
    case "image-converter":
      component = <ImageConverterTool education={<ImageEducation />} />;
      break;
    case "word-counter":
      component = <WordCounterTool education={<WordCounterEducation />} />;
      break;
    case "base64-tool":
      component = <Base64ToolUI education={<Base64Education />} />;
      break;
    case "scientific-calculator":
      component = <ScientificCalculator education={<ScientificEducation />} />;
      break;
    case "csv-json-converter":
      component = <CsvJsonConverterUI education={<CsvJsonEducation />} />;
      break;
    case "file-size-converter":
      component = <FileSizeConverterTool education={<FileSizeEducation />} />;
      break;
    case "file-name-sanitizer":
      component = <FileNameSanitizerTool education={<FileNameEducation />} />;
      break;
    case "duplicate-line-remover":
      component = <DuplicateLineRemoverTool education={<DuplicateLineEducation />} />;
      break;
    case "invoice-generator":
      component = <InvoiceGeneratorTool education={<InvoiceEducation />} />;
      break;
    case "inventory-valuation-calculator":
      component = <InventoryValuationTool education={<InventoryEducation />} />;
      break;
    case "break-even-calculator":
      component = <BreakEvenCalculatorTool education={<BreakEvenEducation />} />;
      break;
  }

  const isAboveFoldLayout =
    slug === "bmi-calculator" ||
    slug === "age-calculator" ||
    slug === "mortgage-calculator" ||
    slug === "crypto-converter" ||
    slug === "forex-converter" ||
    slug === "commodities-tracker" ||
    slug === "weather-forecast" ||
    slug === "tdee-calculator" ||
    slug === "compound-interest-calculator" ||
    slug === "loan-calculator" ||
    slug === "affordable-loan-calculator" ||
    slug === "retirement-calculator" ||
    slug === "house-affordability-calculator" ||
    slug === "debt-to-income-calculator" ||
    slug === "ideal-weight-calculator" ||
    slug === "color-palette-generator" ||
    slug === "pdf-merge-split" ||
    slug === "zip-compressor" ||
    slug === "world-time-converter" ||
    slug === "scientific-calculator" ||
    slug === "fraction-calculator" ||
    slug === "scientific-notation-converter" ||
    slug === "percentage-calculator" ||
    slug === "tip-calculator" ||
    slug === "discount-calculator" ||
    slug === "sales-tax-calculator" ||
    slug === "unit-converter" ||
    slug === "qr-code-generator" ||
    slug === "json-formatter" ||
    slug === "password-generator" ||
    slug === "image-converter" ||
    slug === "csv-json-converter" ||
    slug === "barcode-generator" ||
    slug === "invoice-generator" ||
    slug === "break-even-calculator" ||
    slug === "inventory-valuation-calculator" ||
    slug === "word-counter" ||
    slug === "base64-tool" ||
    slug === "file-size-converter" ||
    slug === "file-name-sanitizer" ||
    slug === "duplicate-line-remover";

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

import type { ComponentType } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { breadcrumbJsonLd, jsonLdHtml, localeAlternates } from "@/lib/seo";
import { getOgLocale } from "@/lib/locale-meta";
import ToolPageLayout from "@/components/tools/layout/ToolPageLayout";
import RelatedTools from "@/components/tools/RelatedTools";
import { ToolMessagesProvider } from "@/lib/client-messages";
import type { ToolEntryProps } from "@/components/tools/entries/types";
import { tools } from "@/data/tools";
import { hasCategoryPage } from "@/data/categories";
import { SITE_URL } from "@/lib/site";
import { shareImageMetadata } from "@/lib/share-image/meta";

export async function toolPageMetadata(locale: string, slug: string): Promise<Metadata> {
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
  const { images, twitter } = await shareImageMetadata(locale, path);

  return {
    title: pageTitle,
    description,
    alternates: localeAlternates(locale, path),
    twitter,
    openGraph: {
      images,
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

/**
 * Renders /{locale}/tools/{slug}. Each tool has its own route folder that
 * passes its server entry (components/tools/entries/<slug>.tsx) here: Next.js
 * splits client code per route, so a tool page ships only its own tool's
 * client code instead of all 98 tools' (5.5 MB when they shared the [slug]
 * route). [slug] keeps the four live-data tools, rendered on first request.
 */
export async function ToolPageView({
  locale,
  slug,
  Entry,
}: {
  locale: string;
  slug: string;
  Entry?: ComponentType<ToolEntryProps>;
}) {
  const tool = tools.find((item) => item.slug === slug);
  if (!tool) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "tools" });
  const tp = await getTranslations({ locale, namespace: "toolPage" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tn = await getTranslations({ locale, namespace: "navbar" });
  const tcommon = await getTranslations({ locale, namespace: "common" });

  const title = t(`${slug}.title`);
  const description = t(`${slug}.description`);

  const component = Entry ? (
    <Entry locale={locale} />
  ) : (
    <ComingSoon
      title={title}
      line1={tp("comingSoonLine1")}
      line2={tp("comingSoonLine2")}
    />
  );

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
    slug === "significant-figures-calculator" ||
    slug === "gpa-calculator" ||
    slug === "density-calculator" ||
    slug === "ohms-law-calculator" ||
    slug === "ph-calculator" ||
    slug === "statistics-calculator" ||
    slug === "molarity-calculator" ||
    slug === "ideal-gas-law-calculator" ||
    slug === "energy-work-power-calculator" ||
    slug === "kinematics-calculator" ||
    slug === "force-calculator" ||
    slug === "projectile-motion-calculator" ||
    slug === "readability-score-calculator" ||
    slug === "study-time-calculator" ||
    slug === "vector-calculator" ||
    slug === "matrix-calculator" ||
    slug === "molar-mass-calculator" ||
    slug === "stoichiometry-calculator" ||
    slug === "chemical-equation-balancer" ||
    slug === "class-schedule-builder" ||
    slug === "citation-generator" ||
    slug === "area-calculator" ||
    slug === "surface-area-calculator" ||
    slug === "volume-calculator" ||
    slug === "step-by-step-math-solver" ||
    slug === "graphing-calculator" ||
    slug === "notepad-calculator" ||
    slug === "gcf-lcm-calculator" ||
    slug === "triangle-calculator" ||
    slug === "probability-calculator" ||
    slug === "mean-median-mode-range-calculator" ||
    slug === "target-heart-rate-calculator" ||
    slug === "sleep-calculator" ||
    slug === "body-fat-calculator" ||
    slug === "due-date-calculator" ||
    slug === "ovulation-calculator" ||
    slug === "pregnancy-calculator" ||
    slug === "macro-calculator" ||
    slug === "bmr-calculator" ||
    slug === "date-calculator" ||
    slug === "time-calculator" ||
    slug === "fuel-cost-calculator" ||
    slug === "batch-invoice-calculator" ||
    slug === "pace-calculator" ||
    slug === "random-number-generator" ||
    slug === "standard-deviation-calculator" ||
    slug === "circle-calculator" ||
    slug === "text-to-speech" ||
    slug === "speech-to-text" ||
    slug === "spelling-grammar-checker" ||
    slug === "roman-numeral-converter" ||
    slug === "reading-time-calculator" ||
    slug === "lorem-ipsum-generator" ||
    slug === "text-logo-generator" ||
    slug === "multiplication-table-generator" ||
    slug === "speech-word-count-calculator" ||
    slug === "countdown-to-event-calculator" ||
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
    <ToolMessagesProvider locale={locale} toolSlugs={[slug]}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdHtml(jsonLd)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdHtml(
          breadcrumbJsonLd([
            { name: tn("home"), path: `/${locale}` },
            ...(hasCategoryPage(tool.category) ? [{ name: tc(`${tool.category}.title`), path: `/${locale}/categories/${tool.category}` }] : []),
            { name: title, path: `/${locale}/tools/${slug}` },
          ])
        )}
      />
      <ToolPageLayout
        category={tc(`${tool.category}.title`)}
        categorySlug={tool.category}
        backLabel={tp("back", { category: tc(`${tool.category}.title`) })}
        title={title}
        description={description}
        contentWidth={isAboveFoldLayout ? "wide" : "default"}
        compact={isAboveFoldLayout}
        backText={tcommon("back")}
      >
        {component}
      </ToolPageLayout>
      {!isAboveFoldLayout && (
        <RelatedTools locale={locale} category={tool.category} currentSlug={slug} />
      )}
    </ToolMessagesProvider>
  );
}

export type ToolRouteProps = { params: Promise<{ locale: string }> };

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { categories } from "@/data/categories";
import { tools } from "@/data/tools";
import ToolCard from "@/components/tool-ui/ToolCard";
import BackButton from "@/components/tool-ui/BackButton";
import MathPulse from "@/components/category-page/MathPulse";
import MarketsPulse from "@/components/category-page/MarketsPulse";
import PhysicsPulse from "@/components/category-page/PhysicsPulse";
import ChemistryPulse from "@/components/category-page/ChemistryPulse";
import HealthPulse from "@/components/category-page/HealthPulse";
import FinancePulse from "@/components/category-page/FinancePulse";
import BusinessPulse from "@/components/category-page/BusinessPulse";
import StudentPulse from "@/components/category-page/StudentPulse";
import TextPulse from "@/components/category-page/TextPulse";
import DateTimePulse from "@/components/category-page/DateTimePulse";
import WeatherPulse from "@/components/category-page/WeatherPulse";
import AiPulse from "@/components/category-page/AiPulse";
import DevPulse from "@/components/category-page/DevPulse";
import FilePulse from "@/components/category-page/FilePulse";
import ConvertersPulse from "@/components/category-page/ConvertersPulse";
import CategoryToolsSidebar from "@/components/category-page/CategoryToolsSidebar";

/** One indicator file per section; a section without one keeps the older header. */
function sectionPulse(slug: string, locale: string): ReactNode {
  switch (slug) {
    case "math":
      return <MathPulse />;
    case "financial-markets":
      return <MarketsPulse locale={locale} />;
    case "physics":
      return <PhysicsPulse locale={locale} />;
    case "chemistry":
      return <ChemistryPulse locale={locale} />;
    case "health-fitness":
      return <HealthPulse locale={locale} />;
    case "financial-calculators":
      return <FinancePulse locale={locale} />;
    case "business-finance":
      return <BusinessPulse locale={locale} />;
    case "student-productivity":
      return <StudentPulse locale={locale} />;
    case "text-tools":
      return <TextPulse locale={locale} />;
    case "date-time":
      return <DateTimePulse />;
    case "weather":
      return <WeatherPulse locale={locale} />;
    case "ai-tools":
      return <AiPulse />;
    case "developer-tools":
      return <DevPulse locale={locale} />;
    case "file-tools":
      return <FilePulse locale={locale} />;
    case "converters":
      return <ConvertersPulse locale={locale} />;
    default:
      return null;
  }
}

type CategoryPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = categories.find((item) => item.slug === slug);
  if (!category) {
    const t = await getTranslations({ locale, namespace: "categoryPage" });
    return {
      title: `${t("notFoundTitle")} | TooloraLabs`,
    };
  }
  const tc = await getTranslations({ locale, namespace: "categories" });
  return {
    title: `${tc(`${slug}.title`)} | TooloraLabs`,
    description: tc(`${slug}.description`),
  };
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { locale, slug } = await params;
  const category = categories.find((item) => item.slug === slug);
  if (!category) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "categoryPage" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tSection = await getTranslations({ locale, namespace: "categoriesSection" });
  const tTools = await getTranslations({ locale, namespace: "tools" });
  const tToolsPage = await getTranslations({ locale, namespace: "toolsPage" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const categoryTools = tools.filter((tool) => tool.category === slug);

  // Sections with their own indicator file get the new header: no badge, description or count line,
  // a labeled back button beside the title, the indicator strip under it and the tools side nav.
  const pulse = sectionPulse(slug, locale);

  const content = (
    <div className={pulse ? "mx-auto min-w-0 max-w-7xl flex-1 px-6 py-24" : "mx-auto max-w-7xl px-6 py-24"}>
      {pulse ? (
        <>
          <div className="flex items-center justify-start gap-4 text-start">
            <BackButton href="/" label={tCommon("backToHome")} variant="labeled" text={tCommon("back")} size={18} />
            <h1 className="min-w-0 break-words text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {tc(`${slug}.title`)}
            </h1>
          </div>
          <div className="mt-6">{pulse}</div>
        </>
      ) : (
        <>
          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            {t("badge")}
          </span>
          <div className="mt-6 flex items-center gap-3">
            <BackButton href="/" label={tCommon("backToHome")} size={22} className="h-12 w-12" />
            <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {tc(`${slug}.title`)}
            </h1>
          </div>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            {tc(`${slug}.description`)}
          </p>

          <p className="mt-4 font-medium text-zinc-500 dark:text-zinc-400">
            {tSection("toolCount", { count: categoryTools.length })}
          </p>
        </>
      )}

      {categoryTools.length > 0 ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categoryTools.map((tool) => (
            <ToolCard
              key={tool.slug}
              tool={tool}
              titleText={tTools(`${tool.slug}.title`)}
              descriptionText={tTools(`${tool.slug}.description`)}
              featuredLabel={tToolsPage("featuredBadge")}
            />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-zinc-500 dark:text-zinc-400">{t("empty")}</p>
      )}
    </div>
  );

  return pulse ? (
    <main data-categories-page className="flex w-full flex-col lg:flex-row">
      <CategoryToolsSidebar categorySlug={slug} />
      {content}
    </main>
  ) : (
    <main data-categories-page>{content}</main>
  );
}

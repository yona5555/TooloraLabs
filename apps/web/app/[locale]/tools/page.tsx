import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { categories } from "@/data/categories";
import { tools } from "@/data/tools";
import ToolCard from "@/components/tool-ui/ToolCard";
import BackButton from "@/components/tool-ui/BackButton";
import CategorySidebar from "@/components/home/CategorySidebar";
import HelpfulFeedback from "@/components/docs/HelpfulFeedback";
import MarketPulse from "@/components/tools-page/MarketPulse";
import { Suspense } from "react";
import { localeAlternates } from "@/lib/seo";
import { shareMetadata } from "@/lib/share-image/meta";

type ToolsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ToolsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "toolsPage" });
  const tCategoriesSection = await getTranslations({ locale, namespace: "categoriesSection" });
  return {
    title: `${t("heading")} | TooloraLabs`,
    description: tCategoriesSection("subtitle"),
    alternates: localeAlternates(locale, "/tools"),
    ...(await shareMetadata(locale, "/tools")),
  };
}

export default async function ToolsPage({ params }: ToolsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "toolsPage" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tTools = await getTranslations({ locale, namespace: "tools" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  return (
    <main data-tools-page className="flex w-full flex-col lg:flex-row">
      <CategorySidebar footer={<HelpfulFeedback />} categoryLinksJumpToSections />
      <div className="min-w-0 flex-1 px-4 py-24">
        <div className="flex items-center justify-start gap-4 text-start">
          <BackButton href="/" label={tCommon("backToHome")} variant="labeled" text={tCommon("back")} size={18} />
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t("heading")}
          </h1>
        </div>

        {/* Live indicators on their own line under the title, spread evenly across the full width. */}
        <Suspense fallback={null}>
          <MarketPulse locale={locale} />
        </Suspense>

        <div className="mt-16 flex flex-col gap-16">
          {categories.map((category) => {
            const categoryTools = tools.filter(
              (tool) => tool.category === category.slug
            );
            if (categoryTools.length === 0) return null;

            return (
              <section key={category.slug} id={`category-${category.slug}`} className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {tc(`${category.slug}.title`)}
                </h2>

                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {categoryTools.map((tool) => (
                    <ToolCard
                      key={tool.slug}
                      tool={tool}
                      titleText={tTools(`${tool.slug}.title`)}
                      descriptionText={tTools(`${tool.slug}.description`)}
                      featuredLabel={t("featuredBadge")}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}

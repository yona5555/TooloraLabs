import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { categories } from "@/data/categories";
import { tools } from "@/data/tools";
import ToolCard from "@/components/tool-ui/ToolCard";
import BackButton from "@/components/tool-ui/BackButton";
import MathPulse from "@/components/category-page/MathPulse";

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

  return (
    <main data-categories-page className="mx-auto max-w-7xl px-6 py-24">
      {slug !== "math" && (
        <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          {t("badge")}
        </span>
      )}

      {/* Trial on math only: no badge, labeled back button + title, then a full-width row of computed indicators; no description or count line. */}
      {slug === "math" ? (
        <>
          <div className="flex items-center justify-start gap-4 text-start">
            <BackButton href="/" label={tCommon("backToHome")} variant="labeled" text={tCommon("back")} size={18} />
            <h1 className="min-w-0 break-words text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {tc(`${slug}.title`)}
            </h1>
          </div>
          <div className="mt-6">
            <MathPulse />
          </div>
        </>
      ) : (
        <>
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
    </main>
  );
}

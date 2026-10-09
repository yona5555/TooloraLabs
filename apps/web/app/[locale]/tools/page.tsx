import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { categories } from "@/data/categories";
import { tools } from "@/data/tools";
import ToolCard from "@/components/tool-ui/ToolCard";
import BackButton from "@/components/tool-ui/BackButton";

type ToolsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ToolsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "toolsPage" });
  return {
    title: `${t("heading")} | TooloraLabs`,
    description: t("subtitle"),
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
    <main className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <div className="flex items-center justify-center gap-3">
          <BackButton href="/" label={tCommon("backToHome")} size={20} className="h-10 w-10" />
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t("heading")}
          </h1>
        </div>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300">
          {t("subtitle")}
        </p>
      </div>

      <div className="mt-16 flex flex-col gap-16">
        {categories.map((category) => {
          const categoryTools = tools.filter(
            (tool) => tool.category === category.slug
          );
          if (categoryTools.length === 0) return null;

          return (
            <section key={category.slug}>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {tc(`${category.slug}.title`)}
              </h2>

              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
    </main>
  );
}

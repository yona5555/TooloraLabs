import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { categories } from "@/data/categories";
import { tools } from "@/data/tools";
import { getToolIcon } from "@/lib/tool-icons";
import { getCategoryIconColor } from "@/lib/category-colors";

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

  const categoryTools = tools.filter((tool) => tool.category === slug);

  return (
    <main className="mx-auto max-w-7xl px-6 py-24">
      <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
        {t("badge")}
      </span>

      <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
        {tc(`${slug}.title`)}
      </h1>

      <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
        {tc(`${slug}.description`)}
      </p>

      <p className="mt-4 font-medium text-zinc-500 dark:text-zinc-400">
        {tSection("toolCount", { count: categoryTools.length })}
      </p>

      {categoryTools.length > 0 ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categoryTools.map((tool) => {
            const Icon = getToolIcon(tool.slug);
            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none dark:hover:border-blue-500/40"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${getCategoryIconColor(slug)}`}
                >
                  <Icon size={22} strokeWidth={2} />
                </div>

                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {tTools(`${tool.slug}.title`)}
                </h3>

                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {tTools(`${tool.slug}.description`)}
                </p>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="mt-10 text-zinc-500 dark:text-zinc-400">{t("empty")}</p>
      )}
    </main>
  );
}

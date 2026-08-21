import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { categories } from "@/data/categories";

type CategoriesPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: CategoriesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "categoriesSection" });
  return {
    title: `${t("heading")} | TooloraLabs`,
    description: t("subtitle"),
  };
}

export default async function CategoriesPage({
  params,
}: CategoriesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "categoriesSection" });
  const tc = await getTranslations({ locale, namespace: "categories" });

  return (
    <main className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t("heading")}
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300">
          {t("subtitle")}
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-blue-200 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-blue-400 dark:hover:text-blue-400"
          >
            {tc(`${category.slug}.title`)}
          </Link>
        ))}
      </div>
    </main>
  );
}

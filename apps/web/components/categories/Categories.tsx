import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories } from "@/data/categories";

export default function Categories() {
  const t = useTranslations("categoriesSection");
  const tc = useTranslations("categories");

  return (
    <section id="categories" className="mx-auto max-w-7xl px-6 pb-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {t("heading")}
        </h2>
        <p className="mt-3 text-base text-zinc-600 dark:text-zinc-300">
          {t("subtitle")}
        </p>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
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
    </section>
  );
}

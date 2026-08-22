import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories } from "@/data/categories";
import { getCategoryIcon } from "@/lib/category-icons";

export default function HeroCategories() {
  const tc = useTranslations("categories");

  return (
    <div className="mt-10 grid w-full max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3">
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.icon);
        return (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-6 text-center transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-500/40"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Icon size={28} strokeWidth={2} />
            </span>
            <span className="text-sm font-semibold leading-tight text-zinc-700 dark:text-zinc-200">
              {tc(`${category.slug}.title`)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories } from "@/data/categories";
import { getCategoryIcon } from "@/lib/category-icons";

export default function HeroCategories() {
  const tc = useTranslations("categories");

  return (
    <div className="flex flex-wrap justify-center gap-3 lg:flex-nowrap">
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.icon);
        return (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="flex min-w-[92px] flex-1 flex-col items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-2 py-3 text-center transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-500/40"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Icon size={18} strokeWidth={2} />
            </span>
            <span className="text-xs font-semibold leading-tight text-zinc-700 dark:text-zinc-200">
              {tc(`${category.slug}.title`)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories } from "@/data/categories";
import { getCategoryIcon } from "@/lib/category-icons";
import { getCategoryIconColor } from "@/lib/category-colors";

/**
 * A compact, documentation-style side nav (icon + name only, no counts or
 * descriptions) — distinct from the richer card grid on /categories. It's
 * placed as the FIRST child of the flex row in Hero.tsx and relies on the
 * ambient `dir` on <html> (set per-locale in app/[locale]/layout.tsx) to
 * mirror sides automatically: in a row flex container, the first DOM child
 * lands at the inline-start edge, which is the right in RTL and the left in
 * LTR, with no manual left-0/right-0 positioning needed.
 */
export default function CategorySidebar() {
  const t = useTranslations("categories");
  const tHome = useTranslations("homeCalculator");

  return (
    <nav
      aria-label={tHome("sidebarNavLabel")}
      className="w-full shrink-0 overflow-y-auto border-zinc-200 bg-white ltr:lg:border-r rtl:lg:border-l dark:border-zinc-800 dark:bg-zinc-900 lg:h-full lg:w-56 xl:w-64"
    >
      <ul className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-x-visible lg:p-3">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.icon);
          const iconColorClasses = getCategoryIconColor(category.slug);
          return (
            <li key={category.slug} className="shrink-0 lg:shrink">
              <Link
                href={`/categories/${category.slug}`}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconColorClasses}`}>
                  <Icon size={15} strokeWidth={2} />
                </span>
                <span className="whitespace-nowrap lg:whitespace-normal">{t(`${category.slug}.title`)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

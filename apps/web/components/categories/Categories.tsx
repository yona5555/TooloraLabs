import { useTranslations } from "next-intl";
import {
  Bot,
  Calculator,
  Code2,
  FileText,
  Folder,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { categories } from "@/data/categories";
import { tools } from "@/data/tools";
import { getCategoryIconColor } from "@/lib/category-colors";
import CategoryCard from "./CategoryCard";

const icons = {
  calculator: <Calculator size={32} strokeWidth={2} />,
  refresh: <RefreshCw size={32} strokeWidth={2} />,
  bot: <Bot size={32} strokeWidth={2} />,
  code: <Code2 size={32} strokeWidth={2} />,
  text: <FileText size={32} strokeWidth={2} />,
  folder: <Folder size={32} strokeWidth={2} />,
  "trending-up": <TrendingUp size={32} strokeWidth={2} />,
};

export default function Categories() {
  const t = useTranslations("categoriesSection");
  const tc = useTranslations("categories");

  return (
    <section id="categories" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto mb-14 max-w-3xl text-center">
        <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          {t("badge")}
        </span>
        <h2 className="mt-6 text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t("heading")}
        </h2>
        <p className="mt-5 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          {t("subtitle")}
        </p>
      </div>
      <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => {
          const count = tools.filter(
            (tool) => tool.category === category.slug
          ).length;
          return (
            <Link key={category.slug} href={`/categories/${category.slug}`}>
              <CategoryCard
                title={tc(`${category.slug}.title`)}
                description={tc(`${category.slug}.description`)}
                tools={t("toolCount", { count })}
                icon={icons[category.icon as keyof typeof icons]}
                iconClassName={getCategoryIconColor(category.slug)}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

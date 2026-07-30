import { useTranslations } from "next-intl";
import {
  Bot,
  Calculator,
  Code2,
  FileText,
  Folder,
  RefreshCw,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { categories } from "@/data/categories";
import { tools } from "@/data/tools";
import CategoryCard from "./CategoryCard";

const icons = {
  calculator: <Calculator size={32} strokeWidth={2} />,
  refresh: <RefreshCw size={32} strokeWidth={2} />,
  bot: <Bot size={32} strokeWidth={2} />,
  code: <Code2 size={32} strokeWidth={2} />,
  text: <FileText size={32} strokeWidth={2} />,
  folder: <Folder size={32} strokeWidth={2} />,
};

const iconColors: Record<string, string> = {
  calculator: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  refresh: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  bot: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  code: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  text: "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400",
  folder: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
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
                iconClassName={iconColors[category.icon]}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

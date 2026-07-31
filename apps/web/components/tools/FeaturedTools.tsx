import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { tools } from "@/data/tools";
import { getToolIcon } from "@/lib/tool-icons";
import { getCategoryIconColor } from "@/lib/category-colors";

export default function FeaturedTools() {
  const t = useTranslations("featuredTools");
  const tTools = useTranslations("tools");
  const featuredTools = tools.filter((tool) => tool.featured);

  return (
    <section
      id="popular-tools"
      className="mx-auto max-w-7xl px-6 py-24"
    >
      <div className="mx-auto max-w-3xl text-center">
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

      <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {featuredTools.map((tool) => {
          const Icon = getToolIcon(tool.slug);
          return (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none dark:hover:border-blue-500/40"
            >
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl ${getCategoryIconColor(tool.category)}`}
              >
                <Icon size={26} strokeWidth={2} />
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
    </section>
  );
}

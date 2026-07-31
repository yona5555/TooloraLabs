import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { tools } from "@/data/tools";
import { getToolIcon } from "@/lib/tool-icons";

type Props = {
  locale: string;
  category: string;
  currentSlug: string;
};

export default async function RelatedTools({
  locale,
  category,
  currentSlug,
}: Props) {
  const related = tools
    .filter((tool) => tool.category === category && tool.slug !== currentSlug)
    .slice(0, 3);

  if (related.length === 0) {
    return null;
  }

  const t = await getTranslations({ locale, namespace: "toolPage" });
  const tTools = await getTranslations({ locale, namespace: "tools" });

  return (
    <section className="mx-auto max-w-5xl px-6 pb-20">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {t("relatedTools")}
      </h2>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((tool) => {
          const Icon = getToolIcon(tool.slug);
          return (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none dark:hover:border-blue-500/40"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Icon size={18} strokeWidth={2} />
              </div>

              <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
                {tTools(`${tool.slug}.title`)}
              </h3>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {tTools(`${tool.slug}.description`)}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

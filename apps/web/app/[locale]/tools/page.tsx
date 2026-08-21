import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { categories } from "@/data/categories";
import { tools } from "@/data/tools";
import { getToolIcon } from "@/lib/tool-icons";
import { getCategoryIconColor } from "@/lib/category-colors";

type ToolsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ToolsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "toolsPage" });
  return {
    title: `${t("heading")} | TooloraLabs`,
    description: t("subtitle"),
  };
}

export default async function ToolsPage({ params }: ToolsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "toolsPage" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tTools = await getTranslations({ locale, namespace: "tools" });

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

      <div className="mt-16 flex flex-col gap-16">
        {categories.map((category) => {
          const categoryTools = tools.filter(
            (tool) => tool.category === category.slug
          );
          if (categoryTools.length === 0) return null;

          return (
            <section key={category.slug}>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {tc(`${category.slug}.title`)}
              </h2>

              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {categoryTools.map((tool) => {
                  const Icon = getToolIcon(tool.slug);
                  return (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      className="rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none dark:hover:border-blue-500/40"
                    >
                      <div
                        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${getCategoryIconColor(tool.category)}`}
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
            </section>
          );
        })}
      </div>
    </main>
  );
}

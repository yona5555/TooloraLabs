import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { categories } from "@/data/categories";
import { tools } from "@/data/tools";
import { getCategoryIcon } from "@/lib/category-icons";
import { getToolIcon } from "@/lib/tool-icons";
import { DOCUMENTED_TOOL_SLUGS } from "@/lib/docs-tools";
import DocsLayout from "@/components/docs/DocsLayout";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "docsNav" });
  return { title: `${t("overview")} | Docs | TooloraLabs` };
}

export default async function DocsIndexPage() {
  const t = await getTranslations("docsNav");
  const tTools = await getTranslations("tools");
  const tCategories = await getTranslations("categories");

  const documentedByCategory = categories
    .map((category) => ({
      ...category,
      tools: tools.filter((tool) => tool.category === category.slug && DOCUMENTED_TOOL_SLUGS.includes(tool.slug)),
    }))
    .filter((category) => category.tools.length > 0);

  return (
    <DocsLayout toc={null}>
      <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">{t("overview")}</h1>
      <p className="mb-8 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">{t("indexIntro")}</p>

      <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-50">{t("indexAvailableNow")}</h2>
      <div className="flex flex-col gap-8">
        {documentedByCategory.map((category) => {
          const CategoryIcon = getCategoryIcon(category.icon);
          return (
            <div key={category.slug}>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                <CategoryIcon size={16} />
                {tCategories(`${category.slug}.title`)}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {category.tools.map((tool) => {
                  const ToolIcon = getToolIcon(tool.slug);
                  return (
                    <Link
                      key={tool.slug}
                      href={`/docs/${tool.slug}`}
                      className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 transition hover:border-blue-400 hover:bg-blue-50/50 dark:border-zinc-800 dark:hover:border-blue-500 dark:hover:bg-blue-500/5"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        <ToolIcon size={16} />
                      </span>
                      <span className="flex-1 truncate font-medium text-zinc-800 dark:text-zinc-100">{tTools(`${tool.slug}.title`)}</span>
                      <ArrowRight size={15} className="shrink-0 text-zinc-400 rtl:rotate-180" />
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </DocsLayout>
  );
}

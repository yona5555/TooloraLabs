"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { tools } from "@/data/tools";
import { getToolIcon } from "@/lib/tool-icons";
import { getCategoryIconColor } from "@/lib/category-colors";
import AdSpace from "@/components/tool-ui/AdSpace";

const CURRENT_SLUG = "bmi-calculator";
const CATEGORY = "calculators";

export default function BMIRelatedSidebar() {
  const t = useTranslations("toolPage");
  const tTools = useTranslations("tools");
  const related = tools
    .filter((tool) => tool.category === CATEGORY && tool.slug !== CURRENT_SLUG)
    .slice(0, 3);

  return (
    <>
      <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="font-bold text-zinc-900 dark:text-zinc-50">{t("relatedTools")}</h2>
        <div className="mt-4 space-y-3">
          {related.map((tool) => {
            const Icon = getToolIcon(tool.slug);
            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3 transition hover:border-blue-200 hover:shadow-md dark:border-zinc-800 dark:hover:border-blue-500/40"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${getCategoryIconColor(CATEGORY)}`}
                >
                  <Icon size={16} strokeWidth={2} />
                </div>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {tTools(`${tool.slug}.title`)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      <AdSpace />
    </>
  );
}

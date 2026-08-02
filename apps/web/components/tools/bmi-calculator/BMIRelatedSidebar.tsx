"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { tools } from "@/data/tools";
import { getToolIcon } from "@/lib/tool-icons";
import { getCategoryIconColor } from "@/lib/category-colors";
import AdSpace from "@/components/tool-ui/AdSpace";
import BMISidebarSearch from "./BMISidebarSearch";

const CURRENT_SLUG = "bmi-calculator";
const CATEGORY = "calculators";

export default function BMIRelatedSidebar() {
  const tTools = useTranslations("tools");
  const tBmi = useTranslations("tools.bmi-calculator.aboveFold");
  const related = tools.filter((tool) => tool.category === CATEGORY && tool.slug !== CURRENT_SLUG);

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-900/50">
      <BMISidebarSearch />

      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="shrink-0 border-b border-zinc-200 px-4 py-3 font-bold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
          {tBmi("relatedAllTitle")}
        </h2>
        <div className="max-h-80 space-y-2 overflow-y-auto p-3">
          {related.map((tool) => {
            const Icon = getToolIcon(tool.slug);
            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="flex items-center gap-3 rounded-xl border border-transparent p-2.5 transition hover:border-blue-200 hover:bg-blue-50/50 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${getCategoryIconColor(CATEGORY)}`}
                >
                  <Icon size={14} strokeWidth={2} />
                </div>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {tTools(`${tool.slug}.title`)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <AdSpace className="h-40 shrink-0" />
    </div>
  );
}

import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";

type CourseItem = { title: string; provider: string; description: string; url: string; isAffiliate: boolean };

export default function CommodityLearningResources() {
  const t = useTranslations("tools.commodities-tracker.learningResources");
  const tCommon = useTranslations("common");
  const items = t.raw("items") as CourseItem[];

  return (
    <SectionCard id="learning-resources" title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <ul className="mt-4 space-y-4">
        {items.map((item) => (
          <li key={item.url} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{item.provider}</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{item.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <a
                href={item.url}
                target="_blank"
                rel={item.isAffiliate ? "noopener noreferrer sponsored" : "noopener noreferrer"}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 no-underline transition hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-blue-500 dark:hover:text-blue-400"
              >
                {tCommon("viewResourceCta")}
                <ExternalLink size={14} aria-hidden="true" />
              </a>
              {item.isAffiliate && (
                <span className="rounded-full border border-zinc-300 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  {tCommon("affiliateLabel")}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

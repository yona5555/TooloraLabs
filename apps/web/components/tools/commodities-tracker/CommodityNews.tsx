import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";

type NewsItem = { title: string; source: string; url: string };

export default function CommodityNews() {
  const t = useTranslations("tools.commodities-tracker.news");
  const items = t.raw("items") as NewsItem[];

  return (
    <SectionCard id="news" title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.url}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start justify-between gap-3 rounded-xl border border-zinc-200 p-4 text-sm no-underline transition hover:border-blue-400 dark:border-zinc-800 dark:hover:border-blue-500"
            >
              <span>
                <span className="block font-medium text-zinc-900 dark:text-zinc-100">{item.title}</span>
                <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">{item.source}</span>
              </span>
              <ExternalLink size={16} className="mt-1 shrink-0 text-zinc-400" />
            </a>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

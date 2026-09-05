"use client";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getToolIcon } from "@/lib/tool-icons";

export default function RelatedToolsGrid({ slugs }: { slugs: string[] }) {
  const tTools = useTranslations("tools");

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {slugs.map((slug) => {
        const Icon = getToolIcon(slug);
        return (
          <Link
            key={slug}
            href={`/tools/${slug}`}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 transition hover:border-blue-400 hover:bg-blue-50/50 dark:border-zinc-800 dark:hover:border-blue-500 dark:hover:bg-blue-500/5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Icon size={16} />
            </span>
            <span className="flex-1 truncate font-medium text-zinc-800 dark:text-zinc-100">{tTools(`${slug}.title`)}</span>
            <ArrowRight size={15} className="shrink-0 text-zinc-400 rtl:rotate-180" />
          </Link>
        );
      })}
    </div>
  );
}

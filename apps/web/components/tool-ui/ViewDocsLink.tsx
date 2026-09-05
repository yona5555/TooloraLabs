"use client";
import { FileText, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function ViewDocsLink({ slug }: { slug: string }) {
  const t = useTranslations("common");

  return (
    <Link
      href={`/docs/${slug}`}
      className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-blue-400 hover:bg-blue-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-500 dark:hover:bg-blue-500/5"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
        <FileText size={16} />
      </span>
      <span className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-100">{t("viewDocumentation")}</span>
      <ArrowRight size={15} className="shrink-0 text-zinc-400 rtl:rotate-180" />
    </Link>
  );
}

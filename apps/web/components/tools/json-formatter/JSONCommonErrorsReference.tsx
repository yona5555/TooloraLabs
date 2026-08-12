"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

type ErrorRow = { mistake: string; fix: string };

export default function JSONCommonErrorsReference() {
  const t = useTranslations("tools.json-formatter.aboveFold.commonErrors");
  const rows = t.raw("rows") as ErrorRow[];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 space-y-2.5">
        {rows.map((row) => (
          <div key={row.mistake} className="rounded-xl border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800/60">
            <p dir="ltr" className="font-mono text-red-600 dark:text-red-400">
              {row.mistake}
            </p>
            <p className="mt-1 text-zinc-600 dark:text-zinc-300">{row.fix}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

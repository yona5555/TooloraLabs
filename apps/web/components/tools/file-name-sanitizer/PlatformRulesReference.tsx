"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

type ReferenceRow = { platform: string; rule: string };

export default function PlatformRulesReference() {
  const t = useTranslations("tools.file-name-sanitizer.aboveFold.platformRules");
  const rows = t.raw("rows") as ReferenceRow[];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 space-y-2.5">
        {rows.map((row) => (
          <div key={row.platform} className="rounded-xl border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800/60">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{row.platform}</p>
            <p className="mt-0.5 text-zinc-600 dark:text-zinc-300">{row.rule}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

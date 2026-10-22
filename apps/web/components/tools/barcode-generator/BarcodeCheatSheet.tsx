"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/** Real GS1 / ISO figures for the sidebar's spare height (the same framed card as every other card). */
export default function BarcodeCheatSheet() {
  const t = useTranslations("tools.barcode-generator.sidebar.cheatSheet");
  const rows = t.raw("rows") as { id: string; label: string; value: string }[];
  return (
    <SectionCard title={t("title")} bodyClassName="p-0">
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800" data-testid="bc-cheatsheet">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-2 text-xs lg:px-6">
            <span className="text-zinc-600 dark:text-zinc-300">{r.label}</span>
            <span dir="ltr" className="shrink-0 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
              {r.value}
            </span>
          </div>
        ))}
      </div>
      <p className="border-t border-zinc-100 px-4 py-1.5 text-[10px] text-zinc-400 dark:border-zinc-800 dark:text-zinc-500 lg:px-6">{t("note")}</p>
    </SectionCard>
  );
}

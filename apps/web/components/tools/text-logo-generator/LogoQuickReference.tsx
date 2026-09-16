"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const UNICODE_BLOCKS: { key: "mathAlphanumeric" | "fullwidthForms" | "enclosedAlphanumerics"; range: string }[] = [
  { key: "mathAlphanumeric", range: "U+1D400–U+1D7FF" },
  { key: "fullwidthForms", range: "U+FF00–U+FFEF" },
  { key: "enclosedAlphanumerics", range: "U+24B6–U+24E9" },
];

export default function LogoQuickReference() {
  const t = useTranslations("tools.text-logo-generator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <dl className="mt-4 space-y-2 text-sm">
        {UNICODE_BLOCKS.map(({ key, range }) => (
          <div key={key} className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-2 last:border-0 last:pb-0 dark:border-zinc-800">
            <dt className="text-zinc-600 dark:text-zinc-300">{t(`unicodeBlocks.${key}`)}</dt>
            <dd dir="ltr" className="shrink-0 font-mono text-xs text-blue-700 dark:text-blue-300">
              {range}
            </dd>
          </div>
        ))}
      </dl>
    </SectionCard>
  );
}

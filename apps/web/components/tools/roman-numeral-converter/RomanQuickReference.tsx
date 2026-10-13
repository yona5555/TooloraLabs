"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const SYMBOLS: [string, number][] = [
  ["I", 1],
  ["V", 5],
  ["X", 10],
  ["L", 50],
  ["C", 100],
  ["D", 500],
  ["M", 1000],
];

export default function RomanQuickReference() {
  const t = useTranslations("tools.roman-numeral-converter.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
        {SYMBOLS.map(([symbol, value]) => (
          <div key={symbol} className="flex items-center gap-2 rounded-full bg-zinc-50 py-1.5 ps-3 pe-3.5 dark:bg-zinc-800/60">
            <span className="text-base font-bold text-blue-600 dark:text-blue-400">{symbol}</span>
            <span className="tabular-nums text-zinc-600 dark:text-zinc-300">{value}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

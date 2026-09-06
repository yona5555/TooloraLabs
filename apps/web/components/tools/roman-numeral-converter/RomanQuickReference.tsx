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
      <div dir="ltr" className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
        {SYMBOLS.map(([symbol, value]) => (
          <div key={symbol} className="rounded-lg bg-zinc-50 py-2 dark:bg-zinc-800/60">
            <div className="font-mono text-base font-bold text-blue-600 dark:text-blue-400">{symbol}</div>
            <div className="text-zinc-500 dark:text-zinc-400">{value}</div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

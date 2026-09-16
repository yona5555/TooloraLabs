"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const TWO_D6_ODDS: { total: number; ways: number }[] = [
  { total: 2, ways: 1 },
  { total: 3, ways: 2 },
  { total: 4, ways: 3 },
  { total: 5, ways: 4 },
  { total: 6, ways: 5 },
  { total: 7, ways: 6 },
  { total: 8, ways: 5 },
  { total: 9, ways: 4 },
  { total: 10, ways: 3 },
  { total: 11, ways: 2 },
  { total: 12, ways: 1 },
];

export default function DiceQuickReference() {
  const t = useTranslations("tools.dice-roller.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <p className="mt-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">{t("twoD6Title")}</p>
      <div dir="ltr" className="mt-2 grid grid-cols-11 gap-0.5 text-center text-[10px] text-zinc-500 dark:text-zinc-400">
        {TWO_D6_ODDS.map(({ total, ways }) => (
          <div key={total} className="rounded bg-zinc-50 px-0.5 py-1 dark:bg-zinc-800/60">
            <div className="font-mono font-bold text-blue-700 dark:text-blue-300">{total}</div>
            <div>{ways}/36</div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

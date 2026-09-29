"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const N = 2;
const D = 3;

/** Type #14 (Balance Indicator): a fraction under 1 and its reciprocal over 1, on opposite sides of the "equals 1" midpoint — the exact relationship the keep-change-flip division rule relies on. */
export default function FractionReciprocalBalance() {
  const t = useTranslations("tools.fraction-calculator.education.reciprocal");
  const value = N / D;
  const reciprocalValue = D / N;

  const valuePct = Math.min(45, (value / 2) * 100);
  const reciprocalPct = Math.min(45, (reciprocalValue / 2) * 100);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { value: `${N}/${D}` })}</p>
      <div dir="ltr" className="mt-5">
        <div className="relative h-2 rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div className="absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-zinc-400 dark:bg-zinc-500" />
          <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-blue-600 dark:border-zinc-900" style={{ left: `${50 - valuePct}%` }} />
          <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-amber-600 dark:border-zinc-900" style={{ left: `${50 + reciprocalPct}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-sm font-semibold">
          <span className="text-blue-700 dark:text-blue-400">{`${N}/${D} = ${(Math.round(value * 1000) / 1000)}`}</span>
          <span className="text-zinc-400">1</span>
          <span className="text-amber-700 dark:text-amber-400">{`${D}/${N} = ${(Math.round(reciprocalValue * 1000) / 1000)}`}</span>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.original"), value: `${N}/${D}` },
            { label: t("worked.reciprocal"), value: `${D}/${N}` },
            { label: t("worked.product"), value: `(${N}/${D}) × (${D}/${N}) = 1`, emphasize: true, note: t("worked.note") },
          ]}
        />
      </div>
    </SectionCard>
  );
}

"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { countSignificantFigures } from "@tooloralabs/tools";

const LEADING = "0.0025";
const TRAILING = "2.500";

/** Type #14 (Balance Indicator): leading zeros (never significant — they're placeholders) versus trailing zeros after a decimal point (always significant — they were actually measured) — a genuinely bipolar rule, the single most common sig-fig mistake. */
export default function ZeroTypesBalance() {
  const t = useTranslations("tools.significant-figures-calculator.education.zeroTypes");
  const leadingCount = countSignificantFigures(LEADING);
  const trailingCount = countSignificantFigures(TRAILING);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-5">
        <div className="relative h-2 rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div className="absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-zinc-400 dark:bg-zinc-500" />
          <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-red-600 dark:border-zinc-900" style={{ left: "14%" }} />
          <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-emerald-600 dark:border-zinc-900" style={{ left: "86%" }} />
        </div>
        <div className="mt-2 flex justify-between text-sm font-semibold">
          <span className="text-red-700 dark:text-red-400">{LEADING}</span>
          <span className="text-zinc-400">{t("midLabel")}</span>
          <span className="text-emerald-700 dark:text-emerald-400">{TRAILING}</span>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: LEADING, value: t("worked.leadingCount", { count: leadingCount }), note: t("worked.leadingNote") },
            { label: TRAILING, value: t("worked.trailingCount", { count: trailingCount }), emphasize: true, note: t("worked.trailingNote") },
          ]}
        />
      </div>
    </SectionCard>
  );
}

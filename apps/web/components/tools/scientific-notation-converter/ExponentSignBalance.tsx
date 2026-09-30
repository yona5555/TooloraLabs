"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const BIG = { coefficient: 5, exponent: 8 };
const SMALL = { coefficient: 5, exponent: -8 };

/** Type #14 (Balance Indicator): the same coefficient with a positive vs. negative exponent — genuinely opposite effects (multiplying vs. dividing by a power of 10), landing on opposite sides of 1. */
export default function ExponentSignBalance() {
  const t = useTranslations("tools.scientific-notation-converter.education.exponentSign");
  const bigValue = BIG.coefficient * Math.pow(10, BIG.exponent);
  const smallValue = SMALL.coefficient * Math.pow(10, SMALL.exponent);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-5">
        <div className="relative h-2 rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div className="absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-zinc-400 dark:bg-zinc-500" />
          <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-red-600 dark:border-zinc-900" style={{ left: "12%" }} />
          <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-emerald-600 dark:border-zinc-900" style={{ left: "88%" }} />
        </div>
        <div className="mt-2 flex justify-between text-sm font-semibold">
          <span className="text-red-700 dark:text-red-400">{`${SMALL.coefficient}×10^${SMALL.exponent}`}</span>
          <span className="text-zinc-400">1</span>
          <span className="text-emerald-700 dark:text-emerald-400">{`${BIG.coefficient}×10^${BIG.exponent}`}</span>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.negative"), value: `${smallValue}`, note: t("worked.negativeNote") },
            { label: t("worked.positive"), value: bigValue.toLocaleString("en-US"), note: t("worked.positiveNote") },
          ]}
        />
      </div>
    </SectionCard>
  );
}

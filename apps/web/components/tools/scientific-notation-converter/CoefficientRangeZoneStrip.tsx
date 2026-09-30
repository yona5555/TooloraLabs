"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const VALID_EXAMPLE = 6.02;
const INVALID_HIGH = 60.2;
const INVALID_LOW = 0.602;

/** Type #19 (Zone Strip): properly normalized scientific notation requires the coefficient to sit in [1, 10) — this strip marks a valid coefficient inside that window against two common mistakes that land outside it. */
export default function CoefficientRangeZoneStrip() {
  const t = useTranslations("tools.scientific-notation-converter.education.coefficientRange");

  const toPct = (v: number) => Math.min(96, Math.max(4, (v / 12) * 100));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-5">
        <div className="relative h-8 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="absolute h-full bg-emerald-200 dark:bg-emerald-500/20" style={{ left: `${toPct(1)}%`, width: `${toPct(10) - toPct(1)}%` }} />
          <div className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-emerald-600 dark:border-zinc-900" style={{ left: `${toPct(VALID_EXAMPLE)}%` }} />
          <div className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-red-600 dark:border-zinc-900" style={{ left: `${toPct(INVALID_HIGH)}%` }} />
          <div className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-red-600 dark:border-zinc-900" style={{ left: `${toPct(INVALID_LOW)}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <span>0</span>
          <span>1</span>
          <span>10</span>
          <span>12</span>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: `${VALID_EXAMPLE}`, value: t("worked.valid"), emphasize: true },
            { label: `${INVALID_HIGH}`, value: t("worked.tooHigh") },
            { label: `${INVALID_LOW}`, value: t("worked.tooLow") },
          ]}
        />
      </div>
    </SectionCard>
  );
}

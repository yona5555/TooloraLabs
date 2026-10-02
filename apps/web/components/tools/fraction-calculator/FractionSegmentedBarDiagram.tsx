"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useFractionLive } from "./FractionLiveContext";

const MAX_SEGMENTS = 20;

/** Type #15 (Stacked Segmented Bar): the live fraction A drawn as real filled segments out of its own denominator — the most direct visual a fraction has, updating live with every edit. */
export default function FractionSegmentedBarDiagram() {
  const t = useTranslations("tools.fraction-calculator.education.segmentedBar");
  const { dims } = useFractionLive();
  const denom = Math.abs(Math.round(dims.denominatorA));
  const numer = Math.round(dims.numeratorA);
  if (denom === 0 || denom > MAX_SEGMENTS) return null;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { fraction: `${dims.numeratorA}/${dims.denominatorA}` })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="flex h-10 w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700 lg:flex-1">
          {Array.from({ length: denom }).map((_, i) => (
            <div
              key={i}
              className={`h-full flex-1 border-e border-zinc-200 transition-colors duration-300 last:border-e-0 dark:border-zinc-700 ${i < numer ? "bg-blue-600 dark:bg-blue-400" : "bg-white dark:bg-zinc-900"}`}
            />
          ))}
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.filled"), value: `${Math.max(0, Math.min(numer, denom))} / ${denom}` },
            { label: t("worked.fraction"), value: `${dims.numeratorA}/${dims.denominatorA}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}

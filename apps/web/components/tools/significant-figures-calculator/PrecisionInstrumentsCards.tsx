"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { countSignificantFigures } from "@tooloralabs/tools";

const INSTRUMENTS = [
  { key: "ruler", reading: "15.2" },
  { key: "calipers", reading: "15.24" },
  { key: "micrometer", reading: "15.243" },
];

/** Type #16 (Side-by-Side Comparison Cards): the same physical length measured by three real instruments of increasing precision — each card same structure, each reading's real significant-figure count computed live, showing precision as a property of the tool, not the object. */
export default function PrecisionInstrumentsCards() {
  const t = useTranslations("tools.significant-figures-calculator.education.instruments");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {INSTRUMENTS.map((inst) => (
          <div key={inst.key} className="rounded-xl border border-zinc-200 p-4 text-center dark:border-zinc-700">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t(`items.${inst.key}`)}</p>
            <p className="mt-2 font-mono text-xl font-bold text-blue-700 dark:text-blue-300">{`${inst.reading} cm`}</p>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">{t("sigFigsLabel", { count: countSignificantFigures(inst.reading) })}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

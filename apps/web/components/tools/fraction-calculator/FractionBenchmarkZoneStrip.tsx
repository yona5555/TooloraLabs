"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const NUM = 5;
const DEN = 8;
const BENCHMARKS = [0, 0.25, 0.5, 0.75, 1];

/** Type #19 (Zone Strip): where 5/8 actually sits among the five benchmark fractions (0, 1/4, 1/2, 3/4, 1) most people estimate against — a real position, not a guess. */
export default function FractionBenchmarkZoneStrip() {
  const t = useTranslations("tools.fraction-calculator.education.benchmark");
  const value = NUM / DEN;
  const pct = value * 100;
  const nearest = BENCHMARKS.reduce((closest, b) => (Math.abs(b - value) < Math.abs(closest - value) ? b : closest));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { value: `${NUM}/${DEN}` })}</p>
      <div dir="ltr" className="mt-5">
        <div className="relative h-8 overflow-hidden rounded-full bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500 dark:from-blue-500/10 dark:via-blue-500/30 dark:to-blue-500/60">
          <div className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-zinc-900 shadow dark:border-zinc-900 dark:bg-white" style={{ left: `${pct}%` }} />
        </div>
        <div className="relative mt-1.5 h-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          {BENCHMARKS.map((b) => (
            <span key={b} className="absolute -translate-x-1/2" style={{ left: `${b * 100}%` }}>
              {b === 0 ? "0" : b === 1 ? "1" : b === 0.5 ? "1/2" : b === 0.25 ? "1/4" : "3/4"}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.value"), value: `${NUM}/${DEN} = ${value}` },
            { label: t("worked.nearest"), value: nearest === 0.5 ? "1/2" : nearest === 0.25 ? "1/4" : nearest === 0.75 ? "3/4" : `${nearest}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}

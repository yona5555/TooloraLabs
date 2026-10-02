"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useFractionLive } from "./FractionLiveContext";

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function clampPct(decimal: number): number {
  return Math.min(100, Math.max(0, decimal * 100));
}

function benchmarkLabel(decimal: number, t: (key: string) => string): string {
  if (decimal <= 0) return t("zones.atZero");
  if (decimal < 0.5) return t("zones.belowHalf");
  if (Math.abs(decimal - 0.5) < 0.01) return t("zones.atHalf");
  if (decimal < 1) return t("zones.aboveHalf");
  return t("zones.atOrAboveOne");
}

/** Type #19 (Zone Strip): where the live A and B fractions actually sit relative to the classic 0, ½, 1 benchmarks used to estimate fraction size at a glance. */
export default function FractionBenchmarkZoneStrip() {
  const t = useTranslations("tools.fraction-calculator.education.benchmarkZone");
  const { dims } = useFractionLive();
  if (dims.denominatorA === 0 || dims.denominatorB === 0) return null;

  const decA = dims.numeratorA / dims.denominatorA;
  const decB = dims.numeratorB / dims.denominatorB;
  const pctA = clampPct(decA);
  const pctB = clampPct(decB);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          <div className="relative h-3 w-full overflow-hidden rounded-full">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-amber-300/70 dark:bg-amber-500/50" />
            <div className="absolute inset-y-0 left-1/2 w-1/2 bg-emerald-300/70 dark:bg-emerald-500/50" />
            <div className="absolute top-1/2 h-4 w-1.5 -translate-y-1/2 rounded-full bg-blue-700 transition-all duration-300 dark:bg-blue-300" style={{ left: `calc(${pctA}% - 3px)` }} />
            <div className="absolute top-1/2 h-4 w-1.5 -translate-y-1/2 rounded-full bg-rose-700 transition-all duration-300 dark:bg-rose-300" style={{ left: `calc(${pctB}% - 3px)` }} />
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            <span>0</span>
            <span>½</span>
            <span>1</span>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: `A = ${dims.numeratorA}/${dims.denominatorA}`, value: benchmarkLabel(decA, t) },
            { label: `B = ${dims.numeratorB}/${dims.denominatorB}`, value: benchmarkLabel(decB, t), note: `${round3(decA)} vs ${round3(decB)}` },
          ]}
        />
      </div>
    </SectionCard>
  );
}

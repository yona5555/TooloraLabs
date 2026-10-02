"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useVolumeLive } from "./VolumeLiveContext";
import { parseVolumeDims, computeVolumeFor, withScale, round } from "./volumeEducationMath";

/** Type #12 (Sensitivity Trio): the live solid's real volume if every one of its own dimensions were measured 20% smaller or 20% larger — directly tied to the current live values, not a generic example. */
export default function DimensionSensitivityTrio() {
  const t = useTranslations("tools.volume-calculator.education.sensitivityTrio");
  const { dims } = useVolumeLive();
  const n = parseVolumeDims(dims);
  const current = computeVolumeFor(n);
  const smaller = computeVolumeFor(withScale(n, 0.8));
  const larger = computeVolumeFor(withScale(n, 1.2));

  const bars = [
    { key: "smaller", label: t("smallerLabel"), value: smaller, tone: "zinc" },
    { key: "current", label: t("currentLabel"), value: current, tone: "blue" },
    { key: "larger", label: t("largerLabel"), value: larger, tone: "amber" },
  ] as const;
  const maxVal = Math.max(smaller, current, larger, 1);

  const toneClasses: Record<string, string> = {
    zinc: "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-200",
    blue: "border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300",
    amber: "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300",
  };

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="flex shrink-0 flex-wrap items-end justify-center gap-3">
          {bars.map((b) => (
            <div key={b.key} className={`flex w-24 flex-col items-center justify-end rounded-xl border p-3 text-center ${toneClasses[b.tone]}`} style={{ height: `${60 + (b.value / maxVal) * 80}px` }}>
              <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{b.label}</span>
              <span className="mt-1 font-mono text-sm font-bold">{round(b.value)}</span>
            </div>
          ))}
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.swing"), value: `×${round(larger / smaller, 2)}`, emphasize: true, note: t("worked.note") }]} />
      </div>
    </SectionCard>
  );
}

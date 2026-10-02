"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useVolumeLive } from "./VolumeLiveContext";
import { parseVolumeDims, computeVolumeFor, withScale, round } from "./volumeEducationMath";

const SCALES = [1, 2, 4] as const;

/** Type #13 (Stepped Diagram): the live solid's own volume at 1×, 2×, and 4× its current size — each doubling of every dimension actually EIGHT-folds the volume (volume scales with the CUBE of linear size), not just quadruples it the way area does. */
export default function VolumeDoublingStepsDiagram() {
  const t = useTranslations("tools.volume-calculator.education.doublingSteps");
  const { dims } = useVolumeLive();
  const n = parseVolumeDims(dims);
  const steps = SCALES.map((s) => ({ scale: s, volume: computeVolumeFor(withScale(n, s)) }));
  const maxVolume = steps[steps.length - 1].volume || 1;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end">
        <div dir="ltr" className="flex shrink-0 items-end justify-center gap-4">
          {steps.map((s) => (
            <div key={s.scale} className="flex flex-col items-center gap-2">
              <div
                className="w-16 rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-300 dark:from-blue-500 dark:to-blue-300"
                style={{ height: `${20 + (s.volume / maxVolume) * 120}px` }}
              />
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{`${s.scale}×`}</p>
              <p className="font-mono text-xs text-blue-700 dark:text-blue-300">{round(s.volume)}</p>
            </div>
          ))}
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.oneX"), value: `${round(steps[0].volume)}` },
            { label: t("worked.fourX"), value: `${round(steps[2].volume)}`, emphasize: true, note: t("worked.note") },
          ]}
        />
      </div>
    </SectionCard>
  );
}

"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useAreaLive } from "./AreaLiveContext";
import { parseAreaDims, computeAreaFor, withScale, round } from "./areaEducationMath";

const SCALES = [1, 2, 4] as const;

/** Type #13 (Stepped Diagram): the live shape's own area at 1×, 2×, and 4× its current size — each doubling of every dimension actually quadruples the area, never just doubles it. */
export default function AreaDoublingStepsDiagram() {
  const t = useTranslations("tools.area-calculator.education.doublingSteps");
  const { dims } = useAreaLive();
  const n = parseAreaDims(dims);
  const steps = SCALES.map((s) => ({ scale: s, area: computeAreaFor(withScale(n, s)) }));
  const maxArea = steps[steps.length - 1].area || 1;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end">
        <div dir="ltr" className="flex shrink-0 items-end justify-center gap-4">
          {steps.map((s) => (
            <div key={s.scale} className="flex flex-col items-center gap-2">
              <div
                className="w-16 rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-300 dark:from-blue-500 dark:to-blue-300"
                style={{ height: `${20 + (s.area / maxArea) * 120}px` }}
              />
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{`${s.scale}×`}</p>
              <p className="font-mono text-xs text-blue-700 dark:text-blue-300">{round(s.area)}</p>
            </div>
          ))}
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.oneX"), value: `${round(steps[0].area)}` },
            { label: t("worked.fourX"), value: `${round(steps[2].area)}`, emphasize: true, note: t("worked.note") },
          ]}
        />
      </div>
    </SectionCard>
  );
}

"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useAreaLive } from "./AreaLiveContext";
import { parseAreaDims, computeAreaFor, perimeterOf, round } from "./areaEducationMath";

/** Type #19 (Zone Strip): the isoperimetric compactness of the live shape — 4π×Area/Perimeter² — which hits exactly 100% only for a circle, and falls for every shape that strays from it. Only computable for the shapes whose perimeter follows from the given dimensions alone. */
export default function PerimeterToAreaCompactnessZone() {
  const t = useTranslations("tools.area-calculator.education.compactnessZone");
  const tShape = useTranslations("tools.area-calculator.form");
  const { dims } = useAreaLive();
  const n = parseAreaDims(dims);
  const area = computeAreaFor(n);
  const perimeter = perimeterOf(n);

  if (perimeter === null || perimeter <= 0) {
    return (
      <SectionCard title={t("title")}>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
          <p dir="ltr" className="w-full rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-center text-sm text-zinc-500 lg:flex-1 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-400">
            {t("notApplicable", { shape: tShape(`shape.${dims.shape}`) })}
          </p>
          <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.area"), value: `${round(area)}`, emphasize: true }]} />
        </div>
      </SectionCard>
    );
  }

  const compactness = round(((4 * Math.PI * area) / (perimeter * perimeter)) * 100, 1);
  const pct = Math.min(100, Math.max(0, compactness));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-gradient-to-r from-zinc-200 via-blue-300 to-emerald-400 dark:from-zinc-700 dark:via-blue-500/60 dark:to-emerald-500">
            <div className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-blue-600 transition-all duration-300 dark:border-zinc-900" style={{ left: `${pct}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            <span>{t("zones.elongated")}</span>
            <span>{t("zones.circleLike")}</span>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.perimeter"), value: `${round(perimeter)}` },
            { label: t("worked.compactness"), value: `${compactness}%`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}

"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useAreaLive } from "./AreaLiveContext";
import { parseAreaDims, computeAreaFor, boundingBoxArea, round } from "./areaEducationMath";

/** Type #19 (Zone Strip): how much of the live shape's own smallest enclosing rectangle it actually fills — a square or rectangle always fills 100%, while a circle, triangle, or sector fills only a real fraction of its own bounding box. */
export default function AreaToBoundingBoxRatioZone() {
  const t = useTranslations("tools.area-calculator.education.boundingBoxRatio");
  const { dims } = useAreaLive();
  const n = parseAreaDims(dims);
  const area = computeAreaFor(n);
  const boxArea = boundingBoxArea(n);
  const pct = boxArea > 0 ? round((area / boxArea) * 100, 1) : 0;
  const markerPct = Math.min(100, Math.max(0, pct));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-gradient-to-r from-zinc-200 to-blue-400 dark:from-zinc-700 dark:to-blue-500">
            <div className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-blue-600 transition-all duration-300 dark:border-zinc-900" style={{ left: `${markerPct}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            <span>{t("zones.sparse")}</span>
            <span>{t("zones.fills")}</span>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.boundingBox"), value: `${round(boxArea)}` },
            { label: t("worked.fill"), value: `${pct}%`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}

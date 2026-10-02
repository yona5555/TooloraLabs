"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useVolumeLive } from "./VolumeLiveContext";
import { parseVolumeDims, computeVolumeFor, computeSurfaceAreaFor, round } from "./volumeEducationMath";

function log10(n: number): number {
  return Math.log(n) / Math.LN10;
}

/** Type #19 (Zone Strip): how much real volume the live solid packs in per unit of its own surface area — a large solid packs in disproportionately more volume per unit of boundary than a small one, since volume grows faster than surface area as size increases. */
export default function VolumeToSurfaceAreaRatioZone() {
  const t = useTranslations("tools.volume-calculator.education.volumeToSurface");
  const { dims } = useVolumeLive();
  const n = parseVolumeDims(dims);
  const volume = computeVolumeFor(n);
  const area = computeSurfaceAreaFor(n);
  const ratio = area > 0 ? volume / area : 0;

  const minLog = log10(0.05);
  const maxLog = log10(5);
  const pct = Math.min(100, Math.max(0, ((log10(Math.max(ratio, 0.01)) - minLog) / (maxLog - minLog)) * 100));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-gradient-to-r from-amber-400 to-blue-400 dark:from-amber-500 dark:to-blue-500">
            <div className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-zinc-900 transition-all duration-300 dark:border-zinc-900 dark:bg-white" style={{ left: `${pct}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            <span>{t("zones.thin")}</span>
            <span>{t("zones.chunky")}</span>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.volume"), value: `${round(volume)}` },
            { label: t("worked.area"), value: `${round(area)}` },
            { label: t("worked.ratio"), value: `${round(ratio, 3)} : 1`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}

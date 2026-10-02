"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSurfaceAreaLive } from "./SurfaceAreaLiveContext";
import { parseSurfaceDims, computeSurfaceAreaFor, computeVolumeFor, round } from "./surfaceAreaEducationMath";

function log10(n: number): number {
  return Math.log(n) / Math.LN10;
}

/** Type #19 (Zone Strip): the live solid's real surface-area-to-volume ratio — the physical quantity behind why small objects lose heat (or gain it) far faster than large ones, scaled on a log axis since real ratios span orders of magnitude. */
export default function SurfaceToVolumeRatioZoneStrip() {
  const t = useTranslations("tools.surface-area-calculator.education.surfaceToVolume");
  const { dims } = useSurfaceAreaLive();
  const n = parseSurfaceDims(dims);
  const area = computeSurfaceAreaFor(n);
  const volume = computeVolumeFor(n);
  const ratio = volume > 0 ? area / volume : 0;

  const minLog = log10(0.2);
  const maxLog = log10(20);
  const pct = Math.min(100, Math.max(0, ((log10(Math.max(ratio, 0.01)) - minLog) / (maxLog - minLog)) * 100));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-gradient-to-r from-blue-400 to-amber-400 dark:from-blue-500 dark:to-amber-500">
            <div className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-zinc-900 transition-all duration-300 dark:border-zinc-900 dark:bg-white" style={{ left: `${pct}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            <span>{t("zones.volumeDominated")}</span>
            <span>{t("zones.surfaceDominated")}</span>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.area"), value: `${round(area)}` },
            { label: t("worked.volume"), value: `${round(volume)}` },
            { label: t("worked.ratio"), value: `${round(ratio, 3)} : 1`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}

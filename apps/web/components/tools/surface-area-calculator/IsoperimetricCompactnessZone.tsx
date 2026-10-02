"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSurfaceAreaLive } from "./SurfaceAreaLiveContext";
import { parseSurfaceDims, computeSurfaceAreaFor, computeVolumeFor, round } from "./surfaceAreaEducationMath";

/** Type #19 (Zone Strip): the live solid's 3D isoperimetric compactness — π^(1/3) × (6V)^(2/3) ÷ A — which reaches exactly 100% only for a sphere, the one shape that encloses a given volume with the least possible surface area, and falls for every shape that strays from it. */
export default function IsoperimetricCompactnessZone() {
  const t = useTranslations("tools.surface-area-calculator.education.compactnessZone");
  const { dims } = useSurfaceAreaLive();
  const n = parseSurfaceDims(dims);
  const area = computeSurfaceAreaFor(n);
  const volume = computeVolumeFor(n);

  const compactness = area > 0 ? round((((Math.PI ** (1 / 3)) * (6 * volume) ** (2 / 3)) / area) * 100, 1) : 0;
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
            <span>{t("zones.angular")}</span>
            <span>{t("zones.sphereLike")}</span>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.volume"), value: `${round(volume)}` },
            { label: t("worked.compactness"), value: `${compactness}%`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}

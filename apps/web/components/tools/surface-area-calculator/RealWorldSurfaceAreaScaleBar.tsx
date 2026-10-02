"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSurfaceAreaLive } from "./SurfaceAreaLiveContext";
import { parseSurfaceDims, computeSurfaceAreaFor, round } from "./surfaceAreaEducationMath";

const SCALE: { key: string; areaM2: number }[] = [
  { key: "marble", areaM2: 0.0012 },
  { key: "basketball", areaM2: 0.29 },
  { key: "refrigerator", areaM2: 7 },
  { key: "car", areaM2: 34 },
  { key: "house", areaM2: 480 },
];

function log10(n: number): number {
  return Math.log(n) / Math.LN10;
}

/** Type #10 (Log-Scale Magnitude Bar): the live solid's own surface area placed among real-world reference surface areas spanning more than five orders of magnitude — only a log scale keeps a marble and a house readable together. */
export default function RealWorldSurfaceAreaScaleBar() {
  const t = useTranslations("tools.surface-area-calculator.education.realWorldScale");
  const { dims } = useSurfaceAreaLive();
  const n = parseSurfaceDims(dims);
  const liveArea = Math.max(computeSurfaceAreaFor(n), 0.0001);

  const allLogs = [...SCALE.map((s) => log10(s.areaM2)), log10(liveArea)];
  const minLog = Math.min(...allLogs);
  const maxLog = Math.max(...allLogs);
  const span = maxLog - minLog || 1;
  const marks = SCALE.map((s) => ({ ...s, pct: ((log10(s.areaM2) - minLog) / span) * 100 }));
  const livePct = ((log10(liveArea) - minLog) / span) * 100;

  const closest = SCALE.reduce((best, s) => (Math.abs(log10(s.areaM2) - log10(liveArea)) < Math.abs(log10(best.areaM2) - log10(liveArea)) ? s : best), SCALE[0]);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          <div className="relative h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
            {marks.map((m) => (
              <div key={m.key} className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-zinc-400 dark:border-zinc-900 dark:bg-zinc-500" style={{ left: `${m.pct}%` }} />
            ))}
            <div className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-600 transition-all duration-300 dark:border-zinc-900 dark:bg-blue-400" style={{ left: `${Math.min(100, Math.max(0, livePct))}%` }} />
          </div>
          <div className="relative mt-2 h-14 w-full text-[11px]">
            {marks.map((m, i) => (
              <div key={m.key} className="absolute -translate-x-1/2 text-center" style={{ left: `${m.pct}%`, top: `${(i % 2) * 26}px` }}>
                <div className="font-semibold text-zinc-700 dark:text-zinc-200">{t(`items.${m.key}`)}</div>
              </div>
            ))}
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.liveArea"), value: `${round(liveArea)} m²`, emphasize: true },
            { label: t("worked.closest"), value: t(`items.${closest.key}`), note: `${closest.areaM2.toLocaleString("en-US")} m²` },
          ]}
        />
      </div>
    </SectionCard>
  );
}

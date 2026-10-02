"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useVolumeLive } from "./VolumeLiveContext";
import { parseVolumeDims, computeVolumeFor, round } from "./volumeEducationMath";

const SCALE: { key: string; volumeM3: number }[] = [
  { key: "teaspoon", volumeM3: 0.000005 },
  { key: "bottle", volumeM3: 0.002 },
  { key: "bathtub", volumeM3: 0.15 },
  { key: "car", volumeM3: 3 },
  { key: "pool", volumeM3: 50 },
];

function log10(n: number): number {
  return Math.log(n) / Math.LN10;
}

/** Type #10 (Log-Scale Magnitude Bar): the live solid's own volume placed among real-world reference volumes spanning more than seven orders of magnitude — only a log scale keeps a teaspoon and a swimming pool readable together. */
export default function RealWorldVolumeScaleBar() {
  const t = useTranslations("tools.volume-calculator.education.realWorldScale");
  const { dims } = useVolumeLive();
  const n = parseVolumeDims(dims);
  const liveVolume = Math.max(computeVolumeFor(n), 0.0000001);

  const allLogs = [...SCALE.map((s) => log10(s.volumeM3)), log10(liveVolume)];
  const minLog = Math.min(...allLogs);
  const maxLog = Math.max(...allLogs);
  const span = maxLog - minLog || 1;
  const marks = SCALE.map((s) => ({ ...s, pct: ((log10(s.volumeM3) - minLog) / span) * 100 }));
  const livePct = ((log10(liveVolume) - minLog) / span) * 100;

  const closest = SCALE.reduce((best, s) => (Math.abs(log10(s.volumeM3) - log10(liveVolume)) < Math.abs(log10(best.volumeM3) - log10(liveVolume)) ? s : best), SCALE[0]);

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
            { label: t("worked.liveVolume"), value: `${round(liveVolume, 4)} m³`, emphasize: true },
            { label: t("worked.closest"), value: t(`items.${closest.key}`), note: `${closest.volumeM3.toLocaleString("en-US")} m³` },
          ]}
        />
      </div>
    </SectionCard>
  );
}

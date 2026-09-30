"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { SurfaceAreaCalculator } from "@tooloralabs/tools";

const tool = new SurfaceAreaCalculator();
const SIDES = [0.5, 1, 2, 4, 8, 16];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #19 (Zone Strip): a real cube's surface-area-to-volume ratio (6s² ÷ s³ = 6/s) across six doublings of size — the reason a snowflake melts in seconds while an iceberg lasts for years. */
export default function SurfaceToVolumeRatioZoneStrip() {
  const t = useTranslations("tools.surface-area-calculator.education.svRatio");

  const points = SIDES.map((side, i) => {
    const output = tool.execute({ shape: "cube", side }, { locale: "en-US" });
    const surfaceArea = output.success && !output.data.error ? output.data.surfaceArea : 0;
    const volume = side ** 3;
    const ratio = round2(surfaceArea / volume);
    return { side, ratio, pct: (i / (SIDES.length - 1)) * 100 };
  });

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-6 w-full">
        <div className="relative h-3 w-full overflow-hidden rounded-full">
          <div className="absolute inset-y-0 left-0 w-1/3 bg-rose-400/70 dark:bg-rose-500/60" />
          <div className="absolute inset-y-0 left-1/3 w-1/3 bg-amber-300/70 dark:bg-amber-500/50" />
          <div className="absolute inset-y-0 left-2/3 w-1/3 bg-emerald-400/70 dark:bg-emerald-500/60" />
        </div>
        <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          <span>{t("zones.high")}</span>
          <span>{t("zones.medium")}</span>
          <span>{t("zones.low")}</span>
        </div>
        <div className="relative mt-3 h-16 w-full text-[11px]">
          {points.map((p, i) => (
            <div key={p.side} className="absolute -translate-x-1/2 text-center" style={{ left: `${p.pct}%`, top: `${(i % 2) * 30}px` }}>
              <div className="mx-auto mb-1 h-2 w-2 rounded-full bg-zinc-700 dark:bg-zinc-200" />
              <div className="font-semibold text-zinc-700 dark:text-zinc-200">{`s = ${p.side}`}</div>
              <div className="text-zinc-400 dark:text-zinc-500">{`${p.ratio}:1`}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.small"), value: `s=0.5 → ${points[0].ratio}:1` },
            { label: t("worked.large"), value: `s=16 → ${points[5].ratio}:1`, emphasize: true, note: t("worked.note") },
          ]}
        />
      </div>
    </SectionCard>
  );
}

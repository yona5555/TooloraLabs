"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * A static reference scale for the tool's 0-100 output, distinct from
 * LoveCompatibilityGauge (which is the interactive "try it" widget running
 * the real algorithm against example pairs) — this just shows what each
 * band of the same 0-100 scale is generally labeled.
 */
const BANDS: { key: string; from: number; to: number; colorClass: string }[] = [
  { key: "justFriends", from: 0, to: 40, colorClass: "bg-zinc-400 dark:bg-zinc-500" },
  { key: "goodMatch", from: 40, to: 70, colorClass: "bg-blue-500 dark:bg-blue-400" },
  { key: "greatMatch", from: 70, to: 90, colorClass: "bg-pink-500 dark:bg-pink-400" },
  { key: "soulmates", from: 90, to: 100, colorClass: "bg-red-500 dark:bg-red-400" },
];

export default function LoveScaleDiagram() {
  const d = useTranslations("tools.love-calculator.scaleDiagram");
  const tBands = useTranslations("tools.love-calculator.scaleDiagram.bands");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4">
        <div className="flex h-8 w-full overflow-hidden rounded-lg">
          {BANDS.map((band) => (
            <div key={band.key} className={band.colorClass} style={{ width: `${band.to - band.from}%` }} />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-zinc-400 dark:text-zinc-500">
          <span>0%</span>
          <span>100%</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
          {BANDS.map((band) => (
            <span key={band.key} className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${band.colorClass}`} />
              {tBands(band.key)}
            </span>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

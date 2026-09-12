"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * A static reference strip showing all 7 named Flesch Reading Ease bands
 * across their real score ranges — distinct from ReadabilityGauge (the
 * interactive "try it" widget scoring specific example passages).
 */
const BANDS: { key: string; from: number; to: number; colorClass: string }[] = [
  { key: "very-confusing", from: 0, to: 30, colorClass: "bg-red-600 dark:bg-red-400" },
  { key: "difficult", from: 30, to: 50, colorClass: "bg-orange-500 dark:bg-orange-400" },
  { key: "fairly-difficult", from: 50, to: 60, colorClass: "bg-amber-500 dark:bg-amber-400" },
  { key: "standard", from: 60, to: 70, colorClass: "bg-yellow-400 dark:bg-yellow-300" },
  { key: "fairly-easy", from: 70, to: 80, colorClass: "bg-lime-500 dark:bg-lime-400" },
  { key: "easy", from: 80, to: 90, colorClass: "bg-green-500 dark:bg-green-400" },
  { key: "very-easy", from: 90, to: 100, colorClass: "bg-emerald-600 dark:bg-emerald-400" },
];

export default function ReadabilityScaleDiagram() {
  const d = useTranslations("tools.readability-score-calculator.scaleDiagram");
  const tBands = useTranslations("tools.readability-score-calculator.result.bands");

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
          <span>0</span>
          <span>100</span>
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

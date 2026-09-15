"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * A static reference strip showing the Flesch-Kincaid Grade Level scale
 * (0 = Kindergarten through 16 = college graduate) — the tool's SECOND
 * computed metric, distinct from ReadabilityScaleDiagram above (which
 * covers the Flesch Reading Ease score, not the grade level).
 */
const BANDS: { key: string; from: number; to: number; colorClass: string }[] = [
  { key: "elementary", from: 0, to: 5, colorClass: "bg-emerald-600 dark:bg-emerald-400" },
  { key: "middleSchool", from: 5, to: 8, colorClass: "bg-lime-500 dark:bg-lime-400" },
  { key: "highSchool", from: 8, to: 12, colorClass: "bg-amber-500 dark:bg-amber-400" },
  { key: "college", from: 12, to: 16, colorClass: "bg-orange-500 dark:bg-orange-400" },
  { key: "graduate", from: 16, to: 20, colorClass: "bg-red-600 dark:bg-red-400" },
];

const MAX = 20;

export default function ReadabilityGradeLevelDiagram() {
  const d = useTranslations("tools.readability-score-calculator.gradeLevelDiagram");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4">
        <div className="flex h-8 w-full overflow-hidden rounded-lg">
          {BANDS.map((band) => (
            <div key={band.key} className={band.colorClass} style={{ width: `${((band.to - band.from) / MAX) * 100}%` }} />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-zinc-400 dark:text-zinc-500">
          <span>0</span>
          <span>20+</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-5">
          {BANDS.map((band) => (
            <span key={band.key} className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${band.colorClass}`} />
              {d(`bands.${band.key}`)}
            </span>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

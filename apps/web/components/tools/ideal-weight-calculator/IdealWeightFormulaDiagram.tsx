"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * Fixed illustrative comparison at a reference height (5'7" / 170cm, male) —
 * the four classic formulas this tool draws from don't agree exactly, and
 * seeing them side by side makes the gauge's own single "ideal weight" figure
 * legible as one point in a real range of estimates, not an exact number.
 */
const FORMULAS: { key: string; kg: number }[] = [
  { key: "devine", kg: 65.5 },
  { key: "robinson", kg: 64.6 },
  { key: "miller", kg: 65.7 },
  { key: "hamwi", kg: 68.9 },
];

export default function IdealWeightFormulaDiagram() {
  const d = useTranslations("tools.ideal-weight-calculator.formulaDiagram");
  const tFormulas = useTranslations("tools.ideal-weight-calculator.formulaDiagram.formulas");

  const maxKg = Math.max(...FORMULAS.map((f) => f.kg));
  const barMaxWidth = 200;

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-3">
        {FORMULAS.map((f) => {
          const width = (f.kg / maxKg) * barMaxWidth;
          return (
            <div key={f.key} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs font-medium text-zinc-600 dark:text-zinc-300">{tFormulas(f.key)}</span>
              <div className="flex-1">
                <div className="h-6 rounded-md bg-blue-500/80 dark:bg-blue-400/80" style={{ width: `${width}px` }} />
              </div>
              <span className="w-16 shrink-0 font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-200">{f.kg} kg</span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-sm opacity-80">{d("caption")}</p>
    </SectionCard>
  );
}

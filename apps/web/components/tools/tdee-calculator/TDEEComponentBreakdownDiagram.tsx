"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * Fixed illustrative split of a typical TDEE into its three components —
 * distinct from EnergyBalanceDiagram (which shows the calories-in vs.
 * calories-out balance scale concept, not what TDEE itself is made of).
 */
const COMPONENTS: { key: string; pct: number; colorClass: string }[] = [
  { key: "bmr", pct: 65, colorClass: "bg-blue-500 dark:bg-blue-400" },
  { key: "activity", pct: 25, colorClass: "bg-amber-500 dark:bg-amber-400" },
  { key: "tef", pct: 10, colorClass: "bg-green-500 dark:bg-green-400" },
];

export default function TDEEComponentBreakdownDiagram() {
  const d = useTranslations("tools.tdee-calculator.componentBreakdownDiagram");
  const tComponents = useTranslations("tools.tdee-calculator.componentBreakdownDiagram.components");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4">
        <div className="flex h-8 w-full overflow-hidden rounded-lg">
          {COMPONENTS.map((c) => (
            <div key={c.key} className={c.colorClass} style={{ width: `${c.pct}%` }} />
          ))}
        </div>
        <div className="mt-3 space-y-2">
          {COMPONENTS.map((c) => (
            <div key={c.key} className="flex items-center gap-2 text-sm">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${c.colorClass}`} />
              <span className="flex-1 text-zinc-600 dark:text-zinc-300">{tComponents(c.key)}</span>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{c.pct}%</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-sm opacity-80">{d("caption")}</p>
    </SectionCard>
  );
}

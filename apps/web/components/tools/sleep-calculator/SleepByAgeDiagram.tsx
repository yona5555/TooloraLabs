"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * Fixed reference bars (National Sleep Foundation-style recommended ranges
 * by age group), distinct from SleepCycleDiagram (which visualizes the
 * user's own live-calculated number of 90-minute cycles for one option).
 */
const GROUPS: { key: string; min: number; max: number }[] = [
  { key: "newborn", min: 14, max: 17 },
  { key: "toddler", min: 11, max: 14 },
  { key: "child", min: 9, max: 11 },
  { key: "teen", min: 8, max: 10 },
  { key: "adult", min: 7, max: 9 },
  { key: "olderAdult", min: 7, max: 8 },
];

export default function SleepByAgeDiagram() {
  const d = useTranslations("tools.sleep-calculator.byAgeDiagram");
  const tGroups = useTranslations("tools.sleep-calculator.byAgeDiagram.groups");

  const maxHours = Math.max(...GROUPS.map((g) => g.max));
  const barMaxWidth = 200;

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-3">
        {GROUPS.map((g) => {
          const startPct = (g.min / maxHours) * barMaxWidth;
          const widthPct = ((g.max - g.min) / maxHours) * barMaxWidth;
          return (
            <div key={g.key} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-xs font-medium text-zinc-600 dark:text-zinc-300">{tGroups(g.key)}</span>
              <div className="relative h-6 flex-1 rounded-md bg-zinc-100 dark:bg-zinc-800" style={{ maxWidth: barMaxWidth }}>
                <div className="absolute h-6 rounded-md bg-blue-500/80 dark:bg-blue-400/80" style={{ left: `${startPct}px`, width: `${widthPct}px` }} />
              </div>
              <span className="w-20 shrink-0 font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                {g.min}-{g.max}h
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-sm opacity-80">{d("caption")}</p>
    </SectionCard>
  );
}

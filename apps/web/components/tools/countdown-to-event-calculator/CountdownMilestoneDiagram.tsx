"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * A generic reference progress bar with common milestone points labeled —
 * distinct from CountdownDistanceGauge, which compares specific example
 * event distances rather than illustrating progress-bar milestones.
 */
const MILESTONES = [25, 50, 75, 90];

export default function CountdownMilestoneDiagram() {
  const d = useTranslations("tools.countdown-to-event-calculator.milestoneDiagram");
  const tMilestones = useTranslations("tools.countdown-to-event-calculator.milestoneDiagram.milestones");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4">
        <div className="relative h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="h-3 rounded-full bg-blue-500 dark:bg-blue-400" style={{ width: "90%" }} />
          {MILESTONES.map((m) => (
            <div key={m} className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 bg-white dark:bg-zinc-950" style={{ left: `${m}%` }} />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
          {MILESTONES.map((m) => (
            <span key={m} className="text-xs text-zinc-600 dark:text-zinc-300">
              <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{m}%</span> — {tMilestones(`m${m}`)}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-sm opacity-80">{d("caption")}</p>
    </SectionCard>
  );
}

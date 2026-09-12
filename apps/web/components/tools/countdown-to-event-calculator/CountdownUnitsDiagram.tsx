"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * Fixed reference: how one day breaks down into the smaller units a
 * countdown is measured in — distinct from CountdownDistanceGauge (the
 * live "try it" widget comparing example event distances).
 */
const UNITS: { key: string; value: string }[] = [
  { key: "day", value: "1" },
  { key: "hours", value: "24" },
  { key: "minutes", value: "1,440" },
  { key: "seconds", value: "86,400" },
];

export default function CountdownUnitsDiagram() {
  const d = useTranslations("tools.countdown-to-event-calculator.unitsDiagram");
  const tUnits = useTranslations("tools.countdown-to-event-calculator.unitsDiagram.units");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {UNITS.map((u) => (
          <div key={u.key} className="rounded-xl border border-current/15 p-3 text-center">
            <p className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">{u.value}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{tUnits(u.key)}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-sm opacity-80">{d("caption")}</p>
    </SectionCard>
  );
}

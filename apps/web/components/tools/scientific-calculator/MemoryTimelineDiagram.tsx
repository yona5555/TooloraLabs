"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const STEPS = [
  { action: "M+", delta: 50 },
  { action: "M+", delta: 30 },
  { action: "M−", delta: -10 },
];

/** Type #9 (Timeline with Stations): a real M+/M+/M- sequence, with the memory value running total shown at each station — the persistent-slot behavior that's the actual difference between memory and Ans. */
export default function MemoryTimelineDiagram() {
  const t = useTranslations("tools.scientific-calculator.education.functions.memory");

  const stations = STEPS.reduce<{ action: string; delta: number; total: number }[]>((acc, s) => {
    const previousTotal = acc.length > 0 ? acc[acc.length - 1].total : 0;
    return [...acc, { ...s, total: previousTotal + s.delta }];
  }, []);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-6 flex items-center justify-between gap-1">
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-zinc-300 text-xs font-bold text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">0</div>
          <p className="text-[11px] text-zinc-400">{t("startLabel")}</p>
        </div>
        {stations.map((s, i) => (
          <div key={i} className="flex flex-1 items-center gap-1">
            <div className="h-0.5 flex-1 bg-zinc-200 dark:bg-zinc-700" />
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-blue-500 bg-blue-50 text-xs font-bold text-blue-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-300">{s.total}</div>
              <p className="text-[11px] text-zinc-400">{`${s.action} ${Math.abs(s.delta)}`}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={stations.map((s, i) => ({ label: `${t("worked.step")} ${i + 1}: ${s.action} ${Math.abs(s.delta)}`, value: `${s.total}`, emphasize: i === stations.length - 1, note: i === stations.length - 1 ? t("worked.finalNote") : undefined }))}
        />
      </div>
    </SectionCard>
  );
}

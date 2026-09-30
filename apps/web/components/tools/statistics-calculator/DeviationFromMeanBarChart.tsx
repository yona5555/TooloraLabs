"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { StatisticsCalculator } from "@tooloralabs/tools";

const tool = new StatisticsCalculator();
const VALUES = [8, 12, 15, 9, 16];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #1 (Labeled Bar Chart), signed: every value's real deviation from the mean — the building block variance actually squares and averages, shown here before any squaring happens. */
export default function DeviationFromMeanBarChart() {
  const t = useTranslations("tools.statistics-calculator.education.deviations");
  const output = tool.execute({ values: VALUES }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const { mean } = output.data;

  const deviations = VALUES.map((v) => round2(v - mean));
  const maxAbs = Math.max(...deviations.map((d) => Math.abs(d)), 1);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { mean: round2(mean) })}</p>
      <div dir="ltr" className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex shrink-0 flex-col gap-1.5">
          {VALUES.map((v, i) => {
            const dev = deviations[i];
            const pct = (Math.abs(dev) / maxAbs) * 50;
            return (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-8 shrink-0 font-mono text-zinc-500 dark:text-zinc-400">{v}</span>
                <div className="relative h-5 w-48 rounded bg-zinc-100 dark:bg-zinc-800">
                  <div className="absolute left-1/2 h-full w-px bg-zinc-300 dark:bg-zinc-600" />
                  <div
                    className={`absolute top-0 h-full rounded ${dev >= 0 ? "bg-blue-500" : "bg-red-500"}`}
                    style={dev >= 0 ? { left: "50%", width: `${pct}%` } : { right: "50%", width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 shrink-0 font-mono font-semibold text-zinc-700 dark:text-zinc-200">{dev >= 0 ? `+${dev}` : dev}</span>
              </div>
            );
          })}
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={VALUES.map((v, i) => ({ label: `${v}`, value: `${deviations[i] >= 0 ? "+" : ""}${deviations[i]}` }))}
        />
      </div>
    </SectionCard>
  );
}

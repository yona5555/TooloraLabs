"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ScientificCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const tool = new ScientificCalculator();
const MAX_N = 12;

function log10(n: number): number {
  return Math.log(n) / Math.LN10;
}

/** Type #10 (Log-Scale Magnitude Bar): factorial growth is so explosive a linear scale is useless past n≈8 — this live slider drives the calculator's real factorial operation and places the result on a log scale so every step from 0! to 12! stays visible at once. */
export default function FactorialMagnitudeScale() {
  const t = useTranslations("tools.scientific-calculator.education.factorialMagnitude");
  const [n, setN] = useState(6);

  const output = tool.execute({ operation: "factorial", a: n }, { locale: "en-US" });
  if (!output.success) return null;
  const value = output.data.result;
  const maxLog = log10(tool.execute({ operation: "factorial", a: MAX_N }, { locale: "en-US" }).data.result);
  const pct = value <= 1 ? 2 : (log10(value) / maxLog) * 100;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mx-auto mt-4 max-w-sm">
        <input type="range" min={0} max={MAX_N} step={1} value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full accent-blue-600 dark:accent-blue-400" aria-label={t("sliderLabel")} />
        <p className="mt-1 text-center text-xs font-semibold text-blue-700 dark:text-blue-300">{`n = ${n}`}</p>
      </div>
      <div dir="ltr" className="mt-4 h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out dark:bg-blue-400" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.factorial"), value: `${n}!` },
            { label: t("worked.result"), value: value.toLocaleString("en-US"), emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}

"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ScientificCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const tool = new ScientificCalculator();

/** Type #14 (Balance Indicator): a live signed slider drives the calculator's real abs() operation — the balance shows how far the value and its absolute value are from each other, always meeting exactly when the value is already non-negative. */
export default function SignPolarityBalance() {
  const t = useTranslations("tools.scientific-calculator.education.signPolarity");
  const [x, setX] = useState(-7);

  const absOut = tool.execute({ operation: "abs", a: x }, { locale: "en-US" });
  if (!absOut.success) return null;
  const abs = absOut.data.result;
  const negated = -x;

  const xPct = ((x + 20) / 40) * 100;
  const absPct = ((abs + 20) / 40) * 100;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mx-auto mt-4 max-w-sm">
        <input type="range" min={-20} max={20} step={1} value={x} onChange={(e) => setX(Number(e.target.value))} className="w-full accent-blue-600 dark:accent-blue-400" aria-label={t("sliderLabel")} />
        <p className="mt-1 text-center text-xs font-semibold text-blue-700 dark:text-blue-300">{`x = ${x}`}</p>
      </div>
      <div dir="ltr" className="relative mt-5 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div className="absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-zinc-400 dark:bg-zinc-500" />
        <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-rose-600 transition-all duration-300 dark:border-zinc-900" style={{ left: `${xPct}%` }} />
        <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-emerald-600 transition-all duration-300 dark:border-zinc-900" style={{ left: `${absPct}%` }} />
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: "x", value: `${x}` },
            { label: "|x|", value: `${abs}`, emphasize: true },
            { label: "−x", value: `${negated}` },
          ]}
        />
      </div>
    </SectionCard>
  );
}

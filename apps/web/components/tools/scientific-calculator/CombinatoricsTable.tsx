"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ScientificCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const tool = new ScientificCalculator();

/** Type #17 (Tagged Reference Table): live n and r sliders drive the calculator's real nPr and nCr operations together — dragging either slider updates both rows, showing why permutations always outnumber (or match) combinations for the same pair. */
export default function CombinatoricsTable() {
  const t = useTranslations("tools.scientific-calculator.education.combinatorics");
  const [n, setN] = useState(6);
  const [r, setR] = useState(3);
  const clampedR = Math.min(r, n);

  const nPr = tool.execute({ operation: "nPr", a: n, b: clampedR }, { locale: "en-US" });
  const nCr = tool.execute({ operation: "nCr", a: n, b: clampedR }, { locale: "en-US" });
  if (!nPr.success || !nCr.success) return null;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mx-auto mt-4 max-w-sm space-y-3">
        <div>
          <input type="range" min={1} max={12} step={1} value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full accent-blue-600 dark:accent-blue-400" aria-label={t("nSliderLabel")} />
          <p className="mt-1 text-center text-xs font-semibold text-blue-700 dark:text-blue-300">{`n = ${n}`}</p>
        </div>
        <div>
          <input type="range" min={0} max={n} step={1} value={clampedR} onChange={(e) => setR(Number(e.target.value))} className="w-full accent-emerald-600 dark:accent-emerald-400" aria-label={t("rSliderLabel")} />
          <p className="mt-1 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300">{`r = ${clampedR}`}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: "nPr", value: nPr.data.result.toLocaleString("en-US"), emphasize: true, note: t("worked.orderedNote") },
            { label: "nCr", value: nCr.data.result.toLocaleString("en-US"), note: t("worked.unorderedNote") },
          ]}
        />
      </div>
    </SectionCard>
  );
}

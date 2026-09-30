"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ScientificCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const tool = new ScientificCalculator();

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #1 (Labeled Bar Chart): a live base value, drag its own slider to see the calculator's real square, cube, square-root, and cube-root operations move together — this indicator is not tied to the hero's angle, since powers and roots have no real relationship to an angle. */
export default function PowerRootBarChart() {
  const t = useTranslations("tools.scientific-calculator.education.powerRoot");
  const [x, setX] = useState(4);

  const square = tool.execute({ operation: "square", a: x }, { locale: "en-US" });
  const cube = tool.execute({ operation: "cube", a: x }, { locale: "en-US" });
  const sqrt = tool.execute({ operation: "sqrt", a: x }, { locale: "en-US" });
  const cbrt = tool.execute({ operation: "cbrt", a: x }, { locale: "en-US" });
  if (!square.success || !cube.success || !sqrt.success || !cbrt.success) return null;

  const bars = [
    { label: t("squareLabel"), value: square.data.result, formatted: `${round3(square.data.result)}`, highlight: true },
    { label: t("cubeLabel"), value: cube.data.result, formatted: `${round3(cube.data.result)}` },
    { label: t("sqrtLabel"), value: sqrt.data.result, formatted: `${round3(sqrt.data.result)}` },
    { label: t("cbrtLabel"), value: cbrt.data.result, formatted: `${round3(cbrt.data.result)}` },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mx-auto mt-4 max-w-sm">
        <input type="range" min={0} max={10} step={0.5} value={x} onChange={(e) => setX(Number(e.target.value))} className="w-full accent-blue-600 dark:accent-blue-400" aria-label={t("sliderLabel")} />
        <p className="mt-1 text-center text-xs font-semibold text-blue-700 dark:text-blue-300">{`x = ${x}`}</p>
      </div>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduBarChart bars={bars} ariaLabel={t("title")} />
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={bars.map((b) => ({ label: b.label, value: b.formatted }))} />
      </div>
    </SectionCard>
  );
}

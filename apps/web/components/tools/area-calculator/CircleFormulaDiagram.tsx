"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import AreaLiveShape from "./AreaLiveShape";
import { AreaCalculator } from "@tooloralabs/tools";

const tool = new AreaCalculator();
const RADIUS = 6;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #18 (Formula Diagram): a circle's area is pi times the radius squared — the squared exponent means doubling the radius doesn't double the area, it quadruples it, shown here with the real numbers. */
export default function CircleFormulaDiagram() {
  const t = useTranslations("tools.area-calculator.education.circleFormula");
  const output = tool.execute({ shape: "circle", radius: RADIUS }, { locale: "en-US" });
  const doubled = tool.execute({ shape: "circle", radius: RADIUS * 2 }, { locale: "en-US" });
  if (!output.success || output.data.error || !doubled.success || doubled.data.error) return null;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex items-center justify-center gap-4">
        <div className="w-28 shrink-0">
          <AreaLiveShape shape="circle" radius={RADIUS} />
        </div>
        <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-100">{`π × ${RADIUS}² = ${round2(output.data.area)}`}</p>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.formula"), value: "A = π × r²" },
            { label: t("worked.result"), value: `${round2(output.data.area)}`, emphasize: true },
            { label: t("worked.doubled"), value: `${round2(doubled.data.area)}`, note: t("worked.doubledNote") },
          ]}
        />
      </div>
    </SectionCard>
  );
}

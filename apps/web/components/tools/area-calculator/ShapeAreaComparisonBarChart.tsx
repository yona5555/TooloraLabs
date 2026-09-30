"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { AreaCalculator } from "@tooloralabs/tools";

const tool = new AreaCalculator();
const WIDTH = 10;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #1 (Labeled Bar Chart): a square, circle, and equilateral-triangle-like shape all built from the same 10-unit characteristic width, compared by their real computed area — shape alone changes the area by more than 2x even at identical width. */
export default function ShapeAreaComparisonBarChart() {
  const t = useTranslations("tools.area-calculator.education.shapeComparison");

  const square = tool.execute({ shape: "square", side: WIDTH }, { locale: "en-US" });
  const circle = tool.execute({ shape: "circle", radius: WIDTH / 2 }, { locale: "en-US" });
  const triangle = tool.execute({ shape: "triangle", base: WIDTH, height: (Math.sqrt(3) / 2) * WIDTH }, { locale: "en-US" });
  if (!square.success || square.data.error || !circle.success || circle.data.error || !triangle.success || triangle.data.error) return null;

  const rows = [
    { key: "square", label: t("squareLabel"), value: round2(square.data.area) },
    { key: "circle", label: t("circleLabel"), value: round2(circle.data.area) },
    { key: "triangle", label: t("triangleLabel"), value: round2(triangle.data.area) },
  ].sort((a, b) => b.value - a.value);

  const bars = rows.map((r, i) => ({ label: r.label, value: r.value, formatted: `${r.value}`, highlight: i === 0 }));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { width: WIDTH })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduBarChart bars={bars} ariaLabel={t("title")} />
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={rows.map((r) => ({ label: r.label, value: `${r.value}` }))} />
      </div>
    </SectionCard>
  );
}

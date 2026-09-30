"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { SurfaceAreaCalculator } from "@tooloralabs/tools";

const tool = new SurfaceAreaCalculator();
const DIM = 6;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #1 (Labeled Bar Chart): a cube and a sphere built from the same 6-unit characteristic size (side length vs. diameter), compared by real surface area — shape alone changes the surface area substantially even at matched size. */
export default function ShapeSurfaceAreaComparisonBarChart() {
  const t = useTranslations("tools.surface-area-calculator.education.shapeComparison");

  const cube = tool.execute({ shape: "cube", side: DIM }, { locale: "en-US" });
  const sphere = tool.execute({ shape: "sphere", radius: DIM / 2 }, { locale: "en-US" });
  if (!cube.success || cube.data.error || !sphere.success || sphere.data.error) return null;

  const rows = [
    { key: "cube", label: t("cubeLabel"), value: round2(cube.data.surfaceArea) },
    { key: "sphere", label: t("sphereLabel"), value: round2(sphere.data.surfaceArea) },
  ].sort((a, b) => b.value - a.value);

  const bars = rows.map((r, i) => ({ label: r.label, value: r.value, formatted: `${r.value}`, highlight: i === 0 }));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { dim: DIM })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduBarChart bars={bars} ariaLabel={t("title")} />
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={rows.map((r) => ({ label: r.label, value: `${r.value}` }))} />
      </div>
    </SectionCard>
  );
}

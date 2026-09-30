"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { SurfaceAreaCalculator } from "@tooloralabs/tools";

const tool = new SurfaceAreaCalculator();
const RADIUS = 4;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #18 (Formula Diagram): a sphere's surface area is exactly four times the area of its own great circle (pi r squared) — a genuinely surprising real geometric fact, not an approximation. */
export default function SphereFormulaDiagram() {
  const t = useTranslations("tools.surface-area-calculator.education.sphereFormula");
  const output = tool.execute({ shape: "sphere", radius: RADIUS }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const greatCircle = round2(Math.PI * RADIUS * RADIUS);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex items-center justify-center gap-4">
        <svg viewBox="0 0 100 100" className="h-24 w-24 text-current">
          <circle cx={50} cy={50} r={40} className="fill-blue-600/15 stroke-blue-700 dark:fill-blue-400/15 dark:stroke-blue-300" strokeWidth={2} />
          <ellipse cx={50} cy={50} rx={40} ry={14} className="fill-none stroke-blue-700/50 dark:stroke-blue-300/50" strokeWidth={1.5} strokeDasharray="3 2" />
        </svg>
        <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-100">{`4 × π × ${RADIUS}² = ${round2(output.data.surfaceArea)}`}</p>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.formula"), value: "A = 4 × π × r²" },
            { label: t("worked.greatCircle"), value: `${greatCircle}`, note: t("worked.greatCircleNote") },
            { label: t("worked.result"), value: `${round2(output.data.surfaceArea)}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}

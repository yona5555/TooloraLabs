"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { SurfaceAreaCalculator } from "@tooloralabs/tools";

const tool = new SurfaceAreaCalculator();
const RADIUS = 3;
const HEIGHT = 6;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #18 (Formula Diagram): a cylinder's surface splits into two circular caps plus one rectangular label that wraps around it — the label's width is the circle's own circumference, unrolled flat. */
export default function CylinderFormulaDiagram() {
  const t = useTranslations("tools.surface-area-calculator.education.cylinderFormula");
  const output = tool.execute({ shape: "cylinder", radius: RADIUS, height: HEIGHT }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const caps = round2(2 * Math.PI * RADIUS * RADIUS);
  const lateral = round2(2 * Math.PI * RADIUS * HEIGHT);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex items-center justify-center gap-4">
        <svg viewBox="0 0 100 100" className="h-24 w-24 text-current">
          <ellipse cx={50} cy={22} rx={30} ry={10} className="fill-blue-600/15 stroke-blue-700 dark:fill-blue-400/15 dark:stroke-blue-300" strokeWidth={2} />
          <path d="M 20 22 L 20 78 A 30 10 0 0 0 80 78 L 80 22" className="fill-blue-600/10 stroke-blue-700 dark:fill-blue-400/10 dark:stroke-blue-300" strokeWidth={2} />
          <ellipse cx={50} cy={78} rx={30} ry={10} className="fill-none stroke-blue-700 dark:stroke-blue-300" strokeWidth={2} />
        </svg>
        <p className="font-mono text-base font-bold text-zinc-800 dark:text-zinc-100">{`2π${RADIUS}² + 2π${RADIUS}(${HEIGHT}) = ${round2(output.data.surfaceArea)}`}</p>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.formula"), value: "A = 2πr² + 2πrh" },
            { label: t("worked.caps"), value: `${caps}`, note: t("worked.capsNote") },
            { label: t("worked.lateral"), value: `${lateral}`, note: t("worked.lateralNote") },
            { label: t("worked.result"), value: `${round2(output.data.surfaceArea)}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}

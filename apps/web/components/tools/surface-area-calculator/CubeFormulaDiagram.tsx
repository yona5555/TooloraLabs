"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { SurfaceAreaCalculator } from "@tooloralabs/tools";

const tool = new SurfaceAreaCalculator();
const SIDE = 5;

/** Type #18 (Formula Diagram): a cube's surface area is six identical square faces — the simplest of the six solids this tool supports, since every face shares the exact same side length. */
export default function CubeFormulaDiagram() {
  const t = useTranslations("tools.surface-area-calculator.education.cubeFormula");
  const output = tool.execute({ shape: "cube", side: SIDE }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const oneFace = SIDE * SIDE;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex items-center justify-center gap-4">
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex h-9 w-9 items-center justify-center rounded bg-blue-600/20 text-[10px] font-bold text-blue-700 dark:bg-blue-400/20 dark:text-blue-300">
              {oneFace}
            </div>
          ))}
        </div>
        <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-100">{`6 × ${SIDE}² = ${output.data.surfaceArea}`}</p>
      </div>
      <div className="mt-4">
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.formula"), value: "A = 6s²" }, { label: t("worked.result"), value: `${output.data.surfaceArea}`, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}

"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import AreaLiveShape from "./AreaLiveShape";
import { AreaCalculator } from "@tooloralabs/tools";

const tool = new AreaCalculator();
const BASE = 8;
const HEIGHT = 5;

/** Type #18 (Formula Diagram): a triangle's area is half of base times height — the "half" comes from a triangle always being exactly half of the parallelogram formed by duplicating and rotating it. */
export default function TriangleFormulaDiagram() {
  const t = useTranslations("tools.area-calculator.education.triangleFormula");
  const output = tool.execute({ shape: "triangle", base: BASE, height: HEIGHT }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex items-center justify-center gap-4">
        <div className="w-28 shrink-0">
          <AreaLiveShape shape="triangle" base={BASE} height={HEIGHT} />
        </div>
        <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-100">{`½ × ${BASE} × ${HEIGHT} = ${output.data.area}`}</p>
      </div>
      <div className="mt-4">
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.formula"), value: "A = ½ × b × h" }, { label: t("worked.result"), value: `${output.data.area}`, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}

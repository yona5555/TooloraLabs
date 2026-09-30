"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import AreaLiveShape from "./AreaLiveShape";
import { AreaCalculator } from "@tooloralabs/tools";

const tool = new AreaCalculator();
const SIDE = 7;

/** Type #18 (Formula Diagram): a square's area is its side length multiplied by itself — the simplest of the eight shapes this tool supports, and the one every other formula on this page ultimately reduces to when width equals height. */
export default function SquareFormulaDiagram() {
  const t = useTranslations("tools.area-calculator.education.squareFormula");
  const output = tool.execute({ shape: "square", side: SIDE }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex items-center justify-center gap-4">
        <div className="w-28 shrink-0">
          <AreaLiveShape shape="square" side={SIDE} />
        </div>
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-100">{`${SIDE} × ${SIDE} = ${output.data.area}`}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.formula"), value: "A = s²" }, { label: t("worked.result"), value: `${output.data.area}`, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}

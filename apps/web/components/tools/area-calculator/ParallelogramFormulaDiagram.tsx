"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import AreaLiveShape from "./AreaLiveShape";
import { AreaCalculator } from "@tooloralabs/tools";

const tool = new AreaCalculator();
const BASE = 9;
const HEIGHT = 4;

/** Type #18 (Formula Diagram): a parallelogram's area is base times height, identical in form to a rectangle's — the slanted sides change its shape but not its area, since a triangular sliver cut from one end exactly fills the gap on the other. */
export default function ParallelogramFormulaDiagram() {
  const t = useTranslations("tools.area-calculator.education.parallelogramFormula");
  const output = tool.execute({ shape: "parallelogram", base: BASE, height: HEIGHT }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex items-center justify-center gap-4">
        <div className="w-28 shrink-0">
          <AreaLiveShape shape="parallelogram" base={BASE} height={HEIGHT} />
        </div>
        <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-100">{`${BASE} × ${HEIGHT} = ${output.data.area}`}</p>
      </div>
      <div className="mt-4">
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.formula"), value: "A = b × h" }, { label: t("worked.result"), value: `${output.data.area}`, emphasize: true, note: t("worked.note") }]} />
      </div>
    </SectionCard>
  );
}

"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import AreaLiveShape from "./AreaLiveShape";
import { AreaCalculator } from "@tooloralabs/tools";

const tool = new AreaCalculator();
const BASE1 = 10;
const BASE2 = 6;
const HEIGHT = 5;

/** Type #18 (Formula Diagram): a trapezoid's area averages its two parallel bases, then multiplies by height — genuinely different from every other formula on this page since it has two independent base measurements instead of one. */
export default function TrapezoidFormulaDiagram() {
  const t = useTranslations("tools.area-calculator.education.trapezoidFormula");
  const output = tool.execute({ shape: "trapezoid", base1: BASE1, base2: BASE2, height: HEIGHT }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex items-center justify-center gap-4">
        <div className="w-28 shrink-0">
          <AreaLiveShape shape="trapezoid" base1={BASE1} base2={BASE2} height={HEIGHT} />
        </div>
        <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-100">{`½ × (${BASE1}+${BASE2}) × ${HEIGHT} = ${output.data.area}`}</p>
      </div>
      <div className="mt-4">
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.formula"), value: "A = ½ × (b₁+b₂) × h" }, { label: t("worked.result"), value: `${output.data.area}`, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}

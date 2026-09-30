"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import AreaLiveShape from "./AreaLiveShape";
import { AreaCalculator } from "@tooloralabs/tools";

const tool = new AreaCalculator();
const SEMI_MAJOR = 8;
const SEMI_MINOR = 4;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #18 (Formula Diagram): an ellipse's area is pi times both semi-axes — set the two axes equal and this formula collapses exactly to the circle formula above, since a circle is just a special-case ellipse. */
export default function EllipseFormulaDiagram() {
  const t = useTranslations("tools.area-calculator.education.ellipseFormula");
  const output = tool.execute({ shape: "ellipse", semiMajorAxis: SEMI_MAJOR, semiMinorAxis: SEMI_MINOR }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex items-center justify-center gap-4">
        <div className="w-28 shrink-0">
          <AreaLiveShape shape="ellipse" semiMajorAxis={SEMI_MAJOR} semiMinorAxis={SEMI_MINOR} />
        </div>
        <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-100">{`π × ${SEMI_MAJOR} × ${SEMI_MINOR} = ${round2(output.data.area)}`}</p>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.formula"), value: "A = π × a × b" },
            { label: t("worked.result"), value: `${round2(output.data.area)}`, emphasize: true, note: t("worked.note") },
          ]}
        />
      </div>
    </SectionCard>
  );
}

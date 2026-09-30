"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import AreaLiveShape from "./AreaLiveShape";
import { AreaCalculator } from "@tooloralabs/tools";

const tool = new AreaCalculator();
const RADIUS = 6;
const ANGLE = 90;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #18 (Formula Diagram): a sector's area is the full circle's area scaled down by exactly the fraction of 360 degrees it actually spans — a 90 degree sector is genuinely one quarter of the full circle. */
export default function SectorFormulaDiagram() {
  const t = useTranslations("tools.area-calculator.education.sectorFormula");
  const output = tool.execute({ shape: "sector", radius: RADIUS, angleDegrees: ANGLE }, { locale: "en-US" });
  const fullCircle = tool.execute({ shape: "circle", radius: RADIUS }, { locale: "en-US" });
  if (!output.success || output.data.error || !fullCircle.success || fullCircle.data.error) return null;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex items-center justify-center gap-4">
        <div className="w-28 shrink-0">
          <AreaLiveShape shape="sector" radius={RADIUS} angleDegrees={ANGLE} />
        </div>
        <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-100">{`(${ANGLE}/360) × π × ${RADIUS}² = ${round2(output.data.area)}`}</p>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.formula"), value: "A = (θ/360) × π × r²" },
            { label: t("worked.fullCircle"), value: `${round2(fullCircle.data.area)}` },
            { label: t("worked.result"), value: `${round2(output.data.area)}`, emphasize: true, note: t("worked.note") },
          ]}
        />
      </div>
    </SectionCard>
  );
}

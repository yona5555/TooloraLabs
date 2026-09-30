"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { AreaCalculator } from "@tooloralabs/tools";

const tool = new AreaCalculator();
const SIDE_METERS = 5;
const METERS_TO_FEET = 3.28084;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #11 (Side-by-Side Equivalence): the same real room, one side measured in meters and the other in feet — since area scales with the SQUARE of length, the conversion factor for area is the square of the linear conversion factor, not the factor itself. */
export default function UnitConversionEquivalence() {
  const t = useTranslations("tools.area-calculator.education.unitConversion");
  const metersOut = tool.execute({ shape: "square", side: SIDE_METERS }, { locale: "en-US" });
  const sideFeet = round2(SIDE_METERS * METERS_TO_FEET);
  const feetOut = tool.execute({ shape: "square", side: sideFeet }, { locale: "en-US" });
  if (!metersOut.success || metersOut.data.error || !feetOut.success || feetOut.data.error) return null;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`${round2(metersOut.data.area)} m²`}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{`${SIDE_METERS}m × ${SIDE_METERS}m`}</p>
        </div>
        <span className="text-xl font-bold text-zinc-400 dark:text-zinc-500">=</span>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`${round2(feetOut.data.area)} ft²`}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{`${sideFeet}ft × ${sideFeet}ft`}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.linearFactor"), value: `1 m = ${METERS_TO_FEET} ft` },
            { label: t("worked.areaFactor"), value: `${round2(METERS_TO_FEET ** 2)}`, emphasize: true, note: t("worked.note") },
          ]}
        />
      </div>
    </SectionCard>
  );
}

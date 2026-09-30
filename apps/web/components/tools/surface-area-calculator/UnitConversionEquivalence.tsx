"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { SurfaceAreaCalculator } from "@tooloralabs/tools";

const tool = new SurfaceAreaCalculator();
const SIDE_METERS = 2;
const METERS_TO_FEET = 3.28084;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #11 (Side-by-Side Equivalence): a real storage box's surface area, measured once in meters and once in feet — since area scales with length squared, the conversion factor for surface area is the square of the linear factor. */
export default function UnitConversionEquivalence() {
  const t = useTranslations("tools.surface-area-calculator.education.unitConversion");
  const metersOut = tool.execute({ shape: "cube", side: SIDE_METERS }, { locale: "en-US" });
  const sideFeet = round2(SIDE_METERS * METERS_TO_FEET);
  const feetOut = tool.execute({ shape: "cube", side: sideFeet }, { locale: "en-US" });
  if (!metersOut.success || metersOut.data.error || !feetOut.success || feetOut.data.error) return null;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`${round2(metersOut.data.surfaceArea)} m²`}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{`s = ${SIDE_METERS}m`}</p>
        </div>
        <span className="text-xl font-bold text-zinc-400 dark:text-zinc-500">=</span>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`${round2(feetOut.data.surfaceArea)} ft²`}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{`s = ${sideFeet}ft`}</p>
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

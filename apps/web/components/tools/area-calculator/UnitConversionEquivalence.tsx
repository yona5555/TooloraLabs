"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useAreaLive } from "./AreaLiveContext";
import { parseAreaDims, computeAreaFor, round } from "./areaEducationMath";

const M2_TO_FT2 = 10.7639;
const M2_TO_ACRE = 0.000247105;

/** Type #11 (Side-by-Side Equivalence): the live area re-expressed in square feet and acres — the same real quantity, three different units a visitor might actually need. */
export default function UnitConversionEquivalence() {
  const t = useTranslations("tools.area-calculator.education.unitConversion");
  const { dims } = useAreaLive();
  const n = parseAreaDims(dims);
  const m2 = computeAreaFor(n);
  const ft2 = m2 * M2_TO_FT2;
  const acres = m2 * M2_TO_ACRE;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="flex shrink-0 flex-wrap items-center justify-center gap-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-center dark:border-blue-500/30 dark:bg-blue-500/10">
            <p className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`${round(m2)} m²`}</p>
          </div>
          <span className="text-lg font-bold text-zinc-400">=</span>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{`${round(ft2)} ft²`}</p>
          </div>
          <span className="text-lg font-bold text-zinc-400">=</span>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-center dark:border-amber-500/30 dark:bg-amber-500/10">
            <p className="font-mono text-lg font-bold text-amber-700 dark:text-amber-300">{`${round(acres, 5)} acres`}</p>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.factor"), value: `× ${M2_TO_FT2}` },
            { label: t("worked.result"), value: `${round(ft2)} ft²`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}

"use client";
import { useTranslations } from "next-intl";
import { Gauge, Droplets, Equal } from "lucide-react";
import AutoFitText from "@/components/tool-ui/AutoFitText";
import SectionCard from "@/components/tool-ui/SectionCard";
import FuelWorkedExampleNote from "./FuelWorkedExampleNote";

/** Real MPG <-> L/100km conversion factor (235.215 / mpg = L/100km), worked with a real example. */
const MPG = 30;
const L_PER_100KM = 235.215 / MPG;
const L_PER_100KM_AT_40 = 235.215 / 40;
const L_PER_100KM_AT_20 = 235.215 / 20;

const VALUE_STEPS = ["text-2xl", "text-xl", "text-lg"];

/**
 * §31 Type #11 (Side-by-Side Equivalence), upgraded execution: two gradient
 * cards with an icon each, joined by a circular "=" badge — not two plain
 * bordered boxes with a bare "=" character floating between them.
 */
export default function FuelUnitConversionDiagram() {
  const t = useTranslations("tools.fuel-cost-calculator.unitConversionDiagram");
  const tw = useTranslations("tools.fuel-cost-calculator.workedExample");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="flex shrink-0 items-center justify-center gap-3">
          <div className="flex w-32 flex-col items-center gap-1.5 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 px-4 py-5 text-center shadow-sm dark:from-blue-600 dark:to-blue-900">
            <Gauge size={20} className="text-blue-100" aria-hidden="true" />
            <span className="text-xs font-medium text-blue-100">{t("mpgLabel")}</span>
            <AutoFitText text={`${MPG}`} steps={VALUE_STEPS} allowWrap={false} className="font-mono font-bold text-white" />
          </div>

          <Equal size={18} className="shrink-0 text-current opacity-50" aria-hidden="true" />

          <div className="flex w-32 flex-col items-center gap-1.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 px-4 py-5 text-center shadow-sm dark:from-emerald-600 dark:to-emerald-900">
            <Droplets size={20} className="text-emerald-100" aria-hidden="true" />
            <span className="text-xs font-medium text-emerald-100">{t("l100kmLabel")}</span>
            <AutoFitText text={L_PER_100KM.toFixed(2)} steps={VALUE_STEPS} allowWrap={false} className="font-mono font-bold text-white" />
          </div>
        </div>
        <FuelWorkedExampleNote
          title={tw("title")}
          rows={[
            { label: t("mpgLabel"), value: `${MPG}` },
            { label: t("l100kmLabel"), value: L_PER_100KM.toFixed(2), emphasize: true },
            { label: t("at40Label"), value: `${L_PER_100KM_AT_40.toFixed(2)} L/100km` },
            { label: t("at20Label"), value: `${L_PER_100KM_AT_20.toFixed(2)} L/100km` },
          ]}
        />
      </div>
      <p className="mt-3 text-center text-xs opacity-60">{t("formula")}</p>
    </SectionCard>
  );
}

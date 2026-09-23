import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";
import FuelWorkedExampleNote from "./FuelWorkedExampleNote";

/** Real MPG <-> L/100km conversion factor (235.215 / mpg = L/100km), worked with a real example. */
const MPG = 30;
const L_PER_100KM = 235.215 / MPG;
const L_PER_100KM_AT_40 = 235.215 / 40;
const L_PER_100KM_AT_20 = 235.215 / 20;

export default async function FuelUnitConversionDiagram() {
  const t = await getTranslations("tools.fuel-cost-calculator.unitConversionDiagram");
  const tw = await getTranslations("tools.fuel-cost-calculator.workedExample");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="flex shrink-0 items-center justify-center gap-4 overflow-x-auto">
          <svg width={360} height={90} viewBox="0 0 360 90" role="img" aria-label={t("title")} className="min-w-[320px] text-current">
            <rect x={10} y={20} width={140} height={50} rx={8} className="fill-blue-50 stroke-blue-400 dark:fill-blue-500/10 dark:stroke-blue-400/50" strokeWidth={1.5} />
            <text x={80} y={40} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>
              {t("mpgLabel")}
            </text>
            <text x={80} y={58} textAnchor="middle" fontSize={15} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
              {MPG}
            </text>

            <text x={180} y={50} textAnchor="middle" fontSize={16} fontWeight={700} fill="currentColor" opacity={0.5}>
              =
            </text>

            <rect x={210} y={20} width={140} height={50} rx={8} className="fill-emerald-50 stroke-emerald-400 dark:fill-emerald-500/10 dark:stroke-emerald-400/50" strokeWidth={1.5} />
            <text x={280} y={40} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>
              {t("l100kmLabel")}
            </text>
            <text x={280} y={58} textAnchor="middle" fontSize={15} fontWeight={700} className="fill-emerald-700 dark:fill-emerald-300">
              {L_PER_100KM.toFixed(2)}
            </text>
          </svg>
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

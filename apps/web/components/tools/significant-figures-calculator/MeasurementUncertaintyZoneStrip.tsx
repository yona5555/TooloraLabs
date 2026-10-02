"use client";
import { useTranslations } from "next-intl";
import { countDecimalPlaces } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSignificantFiguresLive } from "./SignificantFiguresLiveContext";

const MAX_DECIMALS = 6;

/** Type #19 (Zone Strip): the live A's real implied uncertainty — ± half of its last decimal place — placed on a strip from coarse to fine measurement precision. */
export default function MeasurementUncertaintyZoneStrip() {
  const t = useTranslations("tools.significant-figures-calculator.education.measurementUncertainty");
  const { dims } = useSignificantFiguresLive();
  const decimalPlaces = Math.min(MAX_DECIMALS, countDecimalPlaces(dims.rawValueA));
  const uncertainty = 0.5 * 10 ** -decimalPlaces;
  const pct = (decimalPlaces / MAX_DECIMALS) * 100;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { value: dims.rawValueA })}</p>
      <div dir="ltr" className="mt-6 w-full">
        <div className="relative h-3 w-full overflow-hidden rounded-full">
          <div className="absolute inset-y-0 left-0 h-full w-full bg-gradient-to-r from-amber-300/70 to-emerald-300/70 dark:from-amber-500/50 dark:to-emerald-500/50" />
          <div className="absolute top-1/2 h-4 w-1.5 -translate-y-1/2 rounded-full bg-blue-700 transition-all duration-300 dark:bg-blue-300" style={{ left: `calc(${pct}% - 3px)` }} />
        </div>
        <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          <span>{t("zones.coarse")}</span>
          <span>{t("zones.fine")}</span>
        </div>
      </div>
      <div className="mt-6">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.decimalPlaces"), value: `${decimalPlaces}` },
            { label: t("worked.impliedUncertainty"), value: `± ${uncertainty}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}

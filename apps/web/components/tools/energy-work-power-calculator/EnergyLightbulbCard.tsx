"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { EnergyWorkPowerMode } from "./types";

type EnergyLightbulbCardProps = {
  mode: EnergyWorkPowerMode;
  headline: number;
  digitStyle: DigitStyle;
};

const BULB_WATTS = 60;

/**
 * A quick everyday-scale comparison against a 60 W lightbulb, computed live
 * from this result's headline value — fills the gap below the mode tabs,
 * matching the Rule-of-72-style bonus card pattern used elsewhere on the
 * site.
 */
export default function EnergyLightbulbCard({ mode, headline, digitStyle }: EnergyLightbulbCardProps) {
  const t = useTranslations("tools.energy-work-power-calculator.lightbulbCard");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 1 });

  const isPower = mode === "power";
  const seconds = !isPower && headline > 0 ? headline / BULB_WATTS : null;
  const ratio = isPower && headline > 0 ? headline / BULB_WATTS : null;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("intro")}</p>
      {seconds !== null && (
        <p className="mt-3 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
          {t("secondsResult", { seconds: fmt(seconds) })}
        </p>
      )}
      {ratio !== null && (
        <p className="mt-3 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
          {t("ratioResult", { ratio: fmt(ratio) })}
        </p>
      )}
    </SectionCard>
  );
}

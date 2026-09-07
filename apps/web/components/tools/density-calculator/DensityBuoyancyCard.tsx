"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";

type DensityBuoyancyCardProps = {
  specificGravity: number;
  digitStyle: DigitStyle;
};

/**
 * A quick "will it float?" fact computed live from the result's own specific
 * gravity — fills the gap that opens up below the mode tabs once the input
 * column runs past the result card, matching the Rule-of-72-style bonus
 * card pattern used elsewhere on the site.
 */
export default function DensityBuoyancyCard({ specificGravity, digitStyle }: DensityBuoyancyCardProps) {
  const t = useTranslations("tools.density-calculator.buoyancyCard");
  const floats = specificGravity > 0 && specificGravity < 1;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("intro")}</p>
      {specificGravity > 0 && (
        <p className="mt-3 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
          {t(floats ? "floatsResult" : "sinksResult", { sg: formatLocalizedNumber(specificGravity, digitStyle, { maximumFractionDigits: 2 }) })}
        </p>
      )}
    </SectionCard>
  );
}

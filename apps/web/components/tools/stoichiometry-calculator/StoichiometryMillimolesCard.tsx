"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";

type StoichiometryMillimolesCardProps = {
  targetMoles: number;
  digitStyle: DigitStyle;
};

export default function StoichiometryMillimolesCard({ targetMoles, digitStyle }: StoichiometryMillimolesCardProps) {
  const t = useTranslations("tools.stoichiometry-calculator.millimolesCard");
  const millimoles = targetMoles * 1000;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("intro")}</p>
      {targetMoles > 0 && (
        <p className="mt-3 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
          {t("result", { millimoles: formatLocalizedNumber(millimoles, digitStyle, { maximumFractionDigits: 2 }) })}
        </p>
      )}
    </SectionCard>
  );
}

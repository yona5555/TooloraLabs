"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";

type RuleOf72CardProps = {
  ratePercent: number;
  digitStyle: DigitStyle;
};

/**
 * The "Rule of 72" — a well-known mental-math shortcut (72 / rate ≈ years to double) — computed
 * live from the tool's own resolved rate. Fills the gap that opens up below the mode tabs once the
 * (longer) input column runs past the result card, with a fact genuinely tied to compound growth.
 */
export default function RuleOf72Card({ ratePercent, digitStyle }: RuleOf72CardProps) {
  const t = useTranslations("tools.compound-interest-calculator.aboveFold");
  const years = ratePercent > 0 ? 72 / ratePercent : null;

  return (
    <SectionCard title={t("ruleOf72Title")}>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("ruleOf72Intro")}</p>
      {years !== null && (
        <p className="mt-3 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
          {t("ruleOf72Result", { rate: formatLocalizedNumber(ratePercent, digitStyle, { maximumFractionDigits: 2 }), years: formatLocalizedNumber(years, digitStyle, { maximumFractionDigits: 1 }) })}
        </p>
      )}
    </SectionCard>
  );
}

"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";

type MolarMassGramCardProps = {
  totalMass: number;
  digitStyle: DigitStyle;
};

export default function MolarMassGramCard({ totalMass, digitStyle }: MolarMassGramCardProps) {
  const t = useTranslations("tools.molar-mass-calculator.gramCard");
  const molesPerGram = totalMass > 0 ? 1 / totalMass : 0;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("intro")}</p>
      {totalMass > 0 && (
        <p className="mt-3 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
          {t("result", { moles: formatLocalizedNumber(molesPerGram, digitStyle, { maximumFractionDigits: 4 }) })}
        </p>
      )}
    </SectionCard>
  );
}

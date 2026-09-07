"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";

type GasLawStpCardProps = {
  volumeLiters: number;
  moles: number;
  digitStyle: DigitStyle;
};

const STP_MOLAR_VOLUME = 22.414;

export default function GasLawStpCard({ volumeLiters, moles, digitStyle }: GasLawStpCardProps) {
  const t = useTranslations("tools.ideal-gas-law-calculator.stpCard");
  const molarVolume = moles !== 0 ? volumeLiters / moles : 0;
  const ratio = molarVolume / STP_MOLAR_VOLUME;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("intro")}</p>
      {molarVolume > 0 && (
        <p className="mt-3 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
          {t("result", { ratio: formatLocalizedNumber(ratio, digitStyle, { maximumFractionDigits: 2 }) })}
        </p>
      )}
    </SectionCard>
  );
}

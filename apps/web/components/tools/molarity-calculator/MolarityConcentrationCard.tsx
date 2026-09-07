"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { MolarityMode } from "./types";

type MolarityConcentrationCardProps = {
  mode: MolarityMode;
  molarity: number;
  c1: number;
  c2: number;
  digitStyle: DigitStyle;
};

const ISOTONIC_SALINE_MOLARITY = 0.154;

export default function MolarityConcentrationCard({ mode, molarity, c1, c2, digitStyle }: MolarityConcentrationCardProps) {
  const t = useTranslations("tools.molarity-calculator.concentrationCard");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  if (mode === "concentration") {
    const ratio = molarity / ISOTONIC_SALINE_MOLARITY;
    return (
      <SectionCard title={t("title")}>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("concentrationIntro")}</p>
        {molarity > 0 && (
          <p className="mt-3 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
            {t("concentrationResult", { ratio: fmt(ratio) })}
          </p>
        )}
      </SectionCard>
    );
  }

  const dilutionFactor = c2 !== 0 ? c1 / c2 : 0;
  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("dilutionIntro")}</p>
      {dilutionFactor > 0 && (
        <p className="mt-3 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
          {t("dilutionResult", { factor: fmt(dilutionFactor) })}
        </p>
      )}
    </SectionCard>
  );
}

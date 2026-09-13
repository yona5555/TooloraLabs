"use client";
import { useTranslations } from "next-intl";
import type { UnitCategory } from "@tooloralabs/tools";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import UnitShareExportModal from "./UnitShareExportModal";
import { UNITS_BY_CATEGORY } from "./units";

const selectClass =
  "rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

type UnitResultProps = {
  category: UnitCategory;
  from: string;
  fromValue: string;
  to: string;
  onToChange: (unit: string) => void;
  result: number | null;
  allConversions: Record<string, number>;
  digitStyle: DigitStyle;
};

export default function UnitResult({ category, from, fromValue, to, onToChange, result, allConversions, digitStyle }: UnitResultProps) {
  const t = useTranslations("tools.unit-converter");

  const money = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 6 });
  const heroValue = result !== null ? `${money(result)} ${t(`units.${to}`)}` : "";

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={
        result !== null ? (
          <UnitShareExportModal
            operationLabel=""
            inputRows={[{ label: t("shareExport.fromValueLabel"), value: `${fromValue} ${t(`units.${from}`)}` }]}
            resultRows={Object.entries(allConversions).map(([unit, value]) => ({
              label: t(`units.${unit}`),
              value: money(value),
            }))}
            heroLabel={t(`units.${to}`)}
            heroValue={heroValue}
            sentence={`${fromValue} ${t(`units.${from}`)} = ${heroValue}.`}
          />
        ) : undefined
      }
    >
      <div className="flex items-center justify-center gap-2">
        <select value={to} onChange={(e) => onToChange(e.target.value)} className={selectClass}>
          {UNITS_BY_CATEGORY[category].map((unit) => (
            <option key={unit} value={unit}>
              {t(`units.${unit}`)}
            </option>
          ))}
        </select>
      </div>

      <p dir="ltr" className="mt-4 text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
        {result !== null ? money(result) : "—"}
      </p>

      {result !== null && (
        <div className="mt-4 flex justify-center">
          <CopyButton text={`${money(result)} ${t(`units.${to}`)}`} />
        </div>
      )}

      <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {t("aboveFold.allUnitsTitle")}
        </p>
        <div className="space-y-1.5">
          {UNITS_BY_CATEGORY[category].map((unit) => (
            <div
              key={unit}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                unit === to
                  ? "bg-blue-50 dark:bg-blue-500/10"
                  : "border border-zinc-100 dark:border-zinc-800/60"
              }`}
            >
              <span className="text-zinc-600 dark:text-zinc-300">{t(`units.${unit}`)}</span>
              <span dir="ltr" className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                {allConversions[unit] !== undefined ? money(allConversions[unit]) : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

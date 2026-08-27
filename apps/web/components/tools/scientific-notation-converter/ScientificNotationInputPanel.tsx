"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { ScientificNotationOperation } from "./types";

const OPERATIONS: ScientificNotationOperation[] = ["toScientific", "toStandard", "multiply", "divide"];

type ScientificNotationInputPanelProps = {
  operation: ScientificNotationOperation;
  onOperationChange: (operation: ScientificNotationOperation) => void;
  standardValue: string;
  onStandardValueChange: (value: string) => void;
  coefficientA: string;
  onCoefficientAChange: (value: string) => void;
  exponentA: string;
  onExponentAChange: (value: string) => void;
  coefficientB: string;
  onCoefficientBChange: (value: string) => void;
  exponentB: string;
  onExponentBChange: (value: string) => void;
};

export default function ScientificNotationInputPanel({
  operation,
  onOperationChange,
  standardValue,
  onStandardValueChange,
  coefficientA,
  onCoefficientAChange,
  exponentA,
  onExponentAChange,
  coefficientB,
  onCoefficientBChange,
  exponentB,
  onExponentBChange,
}: ScientificNotationInputPanelProps) {
  const t = useTranslations("tools.scientific-notation-converter.form");

  const needsSecondValue = operation === "multiply" || operation === "divide";
  const needsPairInput = operation === "toStandard" || needsSecondValue;

  return (
    <SectionCard title={t("inputTitle")}>
      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("operationLabel")}</span>
        <select
          value={operation}
          onChange={(e) => onOperationChange(e.target.value as ScientificNotationOperation)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        >
          {OPERATIONS.map((op) => (
            <option key={op} value={op}>
              {t(`operation.${op}`)}
            </option>
          ))}
        </select>
      </label>

      {operation === "toScientific" && (
        <div className="mt-5">
          <ToolInput
            label={t("standardValueLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("standardValuePlaceholder")}
            value={standardValue}
            onChange={(e) => onStandardValueChange(e.target.value)}
          />
        </div>
      )}

      {needsPairInput && (
        <div className="mt-5 space-y-3">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {needsSecondValue ? t("firstNumberLabel") : t("yourNumberLabel")}
          </span>
          <div dir="ltr" className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <ToolInput
              aria-label={t("coefficientLabel")}
              type="text"
              inputMode="decimal"
              placeholder={t("coefficientPlaceholder")}
              value={coefficientA}
              onChange={(e) => onCoefficientAChange(e.target.value)}
            />
            <span className="text-center text-sm text-zinc-500 dark:text-zinc-400">× 10^</span>
            <ToolInput
              aria-label={t("exponentLabel")}
              type="text"
              inputMode="decimal"
              placeholder={t("exponentPlaceholder")}
              value={exponentA}
              onChange={(e) => onExponentAChange(e.target.value)}
            />
          </div>
        </div>
      )}

      {needsSecondValue && (
        <div className="mt-5 space-y-3">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("secondNumberLabel")}</span>
          <div dir="ltr" className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <ToolInput
              aria-label={t("coefficientLabel")}
              type="text"
              inputMode="decimal"
              placeholder={t("coefficientPlaceholder")}
              value={coefficientB}
              onChange={(e) => onCoefficientBChange(e.target.value)}
            />
            <span className="text-center text-sm text-zinc-500 dark:text-zinc-400">× 10^</span>
            <ToolInput
              aria-label={t("exponentLabel")}
              type="text"
              inputMode="decimal"
              placeholder={t("exponentPlaceholder")}
              value={exponentB}
              onChange={(e) => onExponentBChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </SectionCard>
  );
}

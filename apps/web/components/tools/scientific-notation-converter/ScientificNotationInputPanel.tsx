"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { FAMOUS_CONSTANTS } from "@tooloralabs/tools";
import { coef, sup } from "./sciFormat";
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
  onClear: () => void;
  onLoadConstant: (coefficient: number, exponent: number) => void;
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
  onClear,
  onLoadConstant,
}: ScientificNotationInputPanelProps) {
  const t = useTranslations("tools.scientific-notation-converter.form");

  const needsSecondValue = operation === "multiply" || operation === "divide";
  const needsPairInput = operation === "toStandard" || needsSecondValue;

  return (
    <SectionCard title={t("inputTitle")} className="flex flex-col lg:h-full" bodyClassName="flex flex-1 flex-col p-4 lg:p-6">
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

      <button
        type="button"
        onClick={onClear}
        className="mt-5 flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <RotateCcw size={16} />
        {t("clear")}
      </button>

      {/* §17/§27: quick examples fill the column; one click loads a real constant. */}
      <div className="mt-5 flex flex-1 flex-col border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("examplesTitle")}</span>
        <ul className="mt-2 flex flex-1 flex-col justify-between gap-1.5" data-testid="constants">
          {FAMOUS_CONSTANTS.map((c) => {
            const active = (operation === "toStandard") && Number(coefficientA) === c.coefficient && Number(exponentA) === c.exponent;
            return (
              <li key={c.key}>
                <button
                  type="button"
                  onClick={() => onLoadConstant(c.coefficient, c.exponent)}
                  data-constant={c.key}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-start text-sm transition ${active ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" : "border-zinc-200 hover:border-blue-300 hover:bg-blue-50/60 dark:border-zinc-700 dark:hover:bg-blue-500/5"}`}
                >
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{t(`examples.${c.key}`)}</span>
                  <span dir="ltr" className="shrink-0 font-mono text-xs font-semibold text-blue-700 dark:text-blue-300">{`${coef(c.coefficient, 6)}×10${sup(c.exponent)} ${c.unit}`}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </SectionCard>
  );
}

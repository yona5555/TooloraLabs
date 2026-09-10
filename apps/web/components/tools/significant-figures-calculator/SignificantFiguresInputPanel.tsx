"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { SignificantFiguresOperation } from "./types";

const OPERATIONS: SignificantFiguresOperation[] = ["count", "round", "add", "subtract", "multiply", "divide"];
const ROUND_OPTIONS = [1, 2, 3, 4, 5, 6];

type SignificantFiguresInputPanelProps = {
  operation: SignificantFiguresOperation;
  onOperationChange: (operation: SignificantFiguresOperation) => void;
  valueA: string;
  onValueAChange: (value: string) => void;
  valueB: string;
  onValueBChange: (value: string) => void;
  roundToDigits: string;
  onRoundToDigitsChange: (value: string) => void;
  onClear: () => void;
};

export default function SignificantFiguresInputPanel({
  operation,
  onOperationChange,
  valueA,
  onValueAChange,
  valueB,
  onValueBChange,
  roundToDigits,
  onRoundToDigitsChange,
  onClear,
}: SignificantFiguresInputPanelProps) {
  const t = useTranslations("tools.significant-figures-calculator.form");

  const needsSecondValue = operation === "add" || operation === "subtract" || operation === "multiply" || operation === "divide";

  return (
    <SectionCard title={t("inputTitle")}>
      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("operationLabel")}</span>
        <select
          value={operation}
          onChange={(e) => onOperationChange(e.target.value as SignificantFiguresOperation)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        >
          {OPERATIONS.map((op) => (
            <option key={op} value={op}>
              {t(`operation.${op}`)}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-5">
        <ToolInput
          label={needsSecondValue ? t("firstValueLabel") : t("valueLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("valuePlaceholder")}
          value={valueA}
          onChange={(e) => onValueAChange(e.target.value)}
          dir="ltr"
        />
      </div>

      {needsSecondValue && (
        <div className="mt-5">
          <ToolInput
            label={t("secondValueLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("valuePlaceholder")}
            value={valueB}
            onChange={(e) => onValueBChange(e.target.value)}
            dir="ltr"
          />
        </div>
      )}

      {operation === "round" && (
        <label className="mt-5 block space-y-2">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("roundToLabel")}</span>
          <select
            value={roundToDigits}
            onChange={(e) => onRoundToDigitsChange(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
          >
            {ROUND_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {t("roundToOption", { count: n })}
              </option>
            ))}
          </select>
        </label>
      )}

      <button
        type="button"
        onClick={onClear}
        className="mt-5 flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <RotateCcw size={16} />
        {t("clear")}
      </button>
    </SectionCard>
  );
}

"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { SignificantFiguresOperation } from "./types";

const OPERATIONS: SignificantFiguresOperation[] = ["count", "round", "add", "subtract", "multiply", "divide"];
const ROUND_OPTIONS = [1, 2, 3, 4, 5, 6];

export type SignificantFiguresPreset = { operation: SignificantFiguresOperation; valueA: string; valueB: string; roundToDigits: string };

/** Quick examples that fill the input column with real, loadable cases (§17/§27). */
const PRESETS: SignificantFiguresPreset[] = [
  { operation: "count", valueA: "0.00500", valueB: "2.33", roundToDigits: "3" },
  { operation: "count", valueA: "12300", valueB: "2.33", roundToDigits: "3" },
  { operation: "round", valueA: "3.14159", valueB: "2.33", roundToDigits: "3" },
  { operation: "round", valueA: "0.0045678", valueB: "2.33", roundToDigits: "2" },
  { operation: "add", valueA: "12.5", valueB: "0.234", roundToDigits: "3" },
  { operation: "multiply", valueA: "4.5", valueB: "2.33", roundToDigits: "3" },
  { operation: "divide", valueA: "9.81", valueB: "3.0", roundToDigits: "3" },
];

const SYMBOL: Record<SignificantFiguresOperation, string> = { count: "", round: "→", add: "+", subtract: "−", multiply: "×", divide: "÷" };

function presetExpression(p: SignificantFiguresPreset): string {
  if (p.operation === "count") return p.valueA;
  if (p.operation === "round") return `${p.valueA} → ${p.roundToDigits}`;
  return `${p.valueA} ${SYMBOL[p.operation]} ${p.valueB}`;
}

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
  onPreset: (preset: SignificantFiguresPreset) => void;
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
  onPreset,
}: SignificantFiguresInputPanelProps) {
  const t = useTranslations("tools.significant-figures-calculator.form");
  const tCommon = useTranslations("common.live3d");

  const needsSecondValue = operation === "add" || operation === "subtract" || operation === "multiply" || operation === "divide";

  return (
    <SectionCard title={t("inputTitle")} className="flex flex-col lg:h-full" bodyClassName="flex flex-1 flex-col p-4 lg:p-6">
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

      {/* §17/§27: quick examples fill the column; one click loads a real case. */}
      <div className="mt-5 flex flex-1 flex-col border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{tCommon("quickExamples")}</span>
        <ul className="mt-2 grid flex-1 auto-rows-fr grid-cols-1 gap-1.5">
          {PRESETS.map((preset, i) => {
            const active =
              operation === preset.operation &&
              valueA === preset.valueA &&
              (preset.operation === "count" || preset.operation === "round" || valueB === preset.valueB) &&
              (preset.operation !== "round" || roundToDigits === preset.roundToDigits);
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => onPreset(preset)}
                  className={`flex h-full w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-start text-sm transition ${active ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" : "border-zinc-200 hover:border-blue-300 hover:bg-blue-50/60 dark:border-zinc-700 dark:hover:bg-blue-500/5"}`}
                >
                  <span className="truncate font-medium text-zinc-800 dark:text-zinc-200">{t(`operation.${preset.operation}`)}</span>
                  <span dir="ltr" className="shrink-0 font-mono text-xs font-semibold text-blue-700 dark:text-blue-300">{presetExpression(preset)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </SectionCard>
  );
}

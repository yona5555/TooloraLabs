"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { FractionOperation } from "./types";

const OPERATIONS: FractionOperation[] = ["add", "subtract", "multiply", "divide"];

type FractionInputPanelProps = {
  operation: FractionOperation;
  onOperationChange: (operation: FractionOperation) => void;
  numeratorA: string;
  onNumeratorAChange: (value: string) => void;
  denominatorA: string;
  onDenominatorAChange: (value: string) => void;
  numeratorB: string;
  onNumeratorBChange: (value: string) => void;
  denominatorB: string;
  onDenominatorBChange: (value: string) => void;
};

export default function FractionInputPanel({
  operation,
  onOperationChange,
  numeratorA,
  onNumeratorAChange,
  denominatorA,
  onDenominatorAChange,
  numeratorB,
  onNumeratorBChange,
  denominatorB,
  onDenominatorBChange,
}: FractionInputPanelProps) {
  const t = useTranslations("tools.fraction-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("operationLabel")}</span>
        <select
          value={operation}
          onChange={(e) => onOperationChange(e.target.value as FractionOperation)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        >
          {OPERATIONS.map((op) => (
            <option key={op} value={op}>
              {t(`operation.${op}`)}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-5 space-y-3">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("fractionALabel")}</span>
        <div dir="ltr" className="grid grid-cols-2 gap-3">
          <ToolInput
            aria-label={t("numeratorLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("numeratorPlaceholder")}
            value={numeratorA}
            onChange={(e) => onNumeratorAChange(e.target.value)}
          />
          <ToolInput
            aria-label={t("denominatorLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("denominatorPlaceholder")}
            value={denominatorA}
            onChange={(e) => onDenominatorAChange(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("fractionBLabel")}</span>
        <div dir="ltr" className="grid grid-cols-2 gap-3">
          <ToolInput
            aria-label={t("numeratorLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("numeratorPlaceholder")}
            value={numeratorB}
            onChange={(e) => onNumeratorBChange(e.target.value)}
          />
          <ToolInput
            aria-label={t("denominatorLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("denominatorPlaceholder")}
            value={denominatorB}
            onChange={(e) => onDenominatorBChange(e.target.value)}
          />
        </div>
      </div>
    </SectionCard>
  );
}

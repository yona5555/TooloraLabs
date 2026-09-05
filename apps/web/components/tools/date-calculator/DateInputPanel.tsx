"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import DateModeTabs from "./DateModeTabs";
import { DATE_UNITS, type DateCalculatorMode, type DateOperation, type DateUnit } from "./types";

type Props = {
  mode: DateCalculatorMode;
  onModeChange: (mode: DateCalculatorMode) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  unit: DateUnit;
  onUnitChange: (unit: DateUnit) => void;
  operation: DateOperation;
  onOperationChange: (operation: DateOperation) => void;
};

export default function DateInputPanel({
  mode,
  onModeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  amount,
  onAmountChange,
  unit,
  onUnitChange,
  operation,
  onOperationChange,
}: Props) {
  const t = useTranslations("tools.date-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-4">
        <DateModeTabs mode={mode} onModeChange={onModeChange} />
      </div>

      <div className="space-y-3">
        <ToolInput label={mode === "difference" ? t("startDate") : t("baseDate")} type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} />

        {mode === "difference" ? (
          <ToolInput label={t("endDate")} type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} />
        ) : (
          <>
            <div className="flex gap-2">
              {(["add", "subtract"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onOperationChange(value)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    operation === value
                      ? "border-blue-400 bg-blue-600 text-white"
                      : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  {t(`operations.${value}`)}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ToolInput label={t("amount")} type="text" inputMode="numeric" value={amount} onChange={(e) => onAmountChange(e.target.value)} />
              <div>
                <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("unit")}</span>
                <select
                  value={unit}
                  onChange={(e) => onUnitChange(e.target.value as DateUnit)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
                >
                  {DATE_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {t(`units.${u}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </SectionCard>
  );
}

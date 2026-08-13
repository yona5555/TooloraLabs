"use client";
import { useTranslations } from "next-intl";
import type { FileSizeUnit, FileSizeStandard } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type FileSizeInputPanelProps = {
  value: string;
  onValueChange: (value: string) => void;
  unit: FileSizeUnit;
  onUnitChange: (unit: FileSizeUnit) => void;
  standard: FileSizeStandard;
  onStandardChange: (standard: FileSizeStandard) => void;
};

const UNITS: FileSizeUnit[] = ["B", "KB", "MB", "GB", "TB", "PB"];

const selectClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

export default function FileSizeInputPanel({
  value,
  onValueChange,
  unit,
  onUnitChange,
  standard,
  onStandardChange,
}: FileSizeInputPanelProps) {
  const t = useTranslations("tools.file-size-converter.form");
  const tUnits = useTranslations("tools.file-size-converter.units");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <ToolInput
            label={t("valueLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("valuePlaceholder")}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
          />
          <label className="block space-y-2">
            <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {t("unitLabel")}
            </span>
            <select value={unit} onChange={(e) => onUnitChange(e.target.value as FileSizeUnit)} className={selectClass}>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {tUnits(u)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("standardLabel")}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={`flex cursor-pointer flex-col rounded-xl border px-4 py-3 text-sm transition ${
                standard === "decimal"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                  : "border-zinc-300 dark:border-zinc-700"
              }`}
            >
              <span className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-100">
                <input
                  type="radio"
                  name="fsc-standard"
                  checked={standard === "decimal"}
                  onChange={() => onStandardChange("decimal")}
                />
                {t("standardDecimal")}
              </span>
              <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("standardDecimalHint")}</span>
            </label>
            <label
              className={`flex cursor-pointer flex-col rounded-xl border px-4 py-3 text-sm transition ${
                standard === "binary"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                  : "border-zinc-300 dark:border-zinc-700"
              }`}
            >
              <span className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-100">
                <input
                  type="radio"
                  name="fsc-standard"
                  checked={standard === "binary"}
                  onChange={() => onStandardChange("binary")}
                />
                {t("standardBinary")}
              </span>
              <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("standardBinaryHint")}</span>
            </label>
          </div>
        </fieldset>
      </div>
    </SectionCard>
  );
}

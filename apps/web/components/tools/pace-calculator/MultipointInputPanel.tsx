"use client";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import type { DistanceUnit } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import TimeInputGroup from "./TimeInputGroup";
import { emptyMultipointRow, MAX_MULTIPOINT_ROWS, type MultipointRowDraft } from "./types";

const selectClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

type MultipointInputPanelProps = {
  unit: DistanceUnit;
  onUnitChange: (unit: DistanceUnit) => void;
  rows: MultipointRowDraft[];
  onChange: (rows: MultipointRowDraft[]) => void;
};

export default function MultipointInputPanel({ unit, onUnitChange, rows, onChange }: MultipointInputPanelProps) {
  const t = useTranslations("tools.pace-calculator.multipoint");

  function updateRow(index: number, patch: Partial<MultipointRowDraft>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }
  function addRow() {
    if (rows.length < MAX_MULTIPOINT_ROWS) onChange([...rows, emptyMultipointRow()]);
  }
  function removeRow(index: number) {
    if (rows.length > 2) onChange(rows.filter((_, i) => i !== index));
  }

  return (
    <SectionCard title={t("inputTitle")}>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>

      <div className="mt-3">
        <select value={unit} onChange={(e) => onUnitChange(e.target.value as DistanceUnit)} className={selectClass} aria-label={t("unitLabel")}>
          <option value="km">{t("unitKm")}</option>
          <option value="mi">{t("unitMi")}</option>
        </select>
      </div>

      <div className="mt-4 space-y-4">
        {rows.map((row, index) => (
          <div key={index} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {t("checkpointLabel", { number: index + 1 })}
              </span>
              {rows.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  aria-label={t("removeRow")}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="space-y-3">
              <ToolInput
                label={t("columnDistance", { unit: unit === "km" ? t("unitKm") : t("unitMi") })}
                type="text"
                inputMode="decimal"
                value={row.distance}
                onChange={(e) => updateRow(index, { distance: e.target.value })}
              />
              <TimeInputGroup
                label={t("columnTime")}
                hours={row.hours}
                minutes={row.minutes}
                seconds={row.seconds}
                onHoursChange={(value) => updateRow(index, { hours: value })}
                onMinutesChange={(value) => updateRow(index, { minutes: value })}
                onSecondsChange={(value) => updateRow(index, { seconds: value })}
              />
            </div>
          </div>
        ))}
      </div>

      {rows.length < MAX_MULTIPOINT_ROWS && (
        <button
          type="button"
          onClick={addRow}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Plus size={16} />
          {t("addPoint")}
        </button>
      )}
    </SectionCard>
  );
}

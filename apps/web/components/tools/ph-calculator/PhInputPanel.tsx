"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { PhOperation } from "./types";

type PhInputPanelProps = {
  operation: PhOperation;
  onOperationChange: (operation: PhOperation) => void;
  hConcentration: string;
  onHConcentrationChange: (value: string) => void;
  pH: string;
  onPHChange: (value: string) => void;
  ohConcentration: string;
  onOhConcentrationChange: (value: string) => void;
  pOH: string;
  onPOHChange: (value: string) => void;
};

export default function PhInputPanel({
  operation,
  onOperationChange,
  hConcentration,
  onHConcentrationChange,
  pH,
  onPHChange,
  ohConcentration,
  onOhConcentrationChange,
  pOH,
  onPOHChange,
}: PhInputPanelProps) {
  const t = useTranslations("tools.ph-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("operationLabel")}</span>
        <select
          value={operation}
          onChange={(e) => onOperationChange(e.target.value as PhOperation)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        >
          <option value="fromPH">{t("operation.fromPH")}</option>
          <option value="fromH">{t("operation.fromH")}</option>
          <option value="fromPOH">{t("operation.fromPOH")}</option>
          <option value="fromOH">{t("operation.fromOH")}</option>
        </select>
      </label>

      <div className="mt-5 space-y-5">
        {operation === "fromPH" && (
          <ToolInput
            label={t("pHLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("pHPlaceholder")}
            value={pH}
            onChange={(e) => onPHChange(e.target.value)}
          />
        )}
        {operation === "fromH" && (
          <ToolInput
            label={t("hLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("hPlaceholder")}
            value={hConcentration}
            onChange={(e) => onHConcentrationChange(e.target.value)}
          />
        )}
        {operation === "fromPOH" && (
          <ToolInput
            label={t("pOHLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("pOHPlaceholder")}
            value={pOH}
            onChange={(e) => onPOHChange(e.target.value)}
          />
        )}
        {operation === "fromOH" && (
          <ToolInput
            label={t("ohLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("ohPlaceholder")}
            value={ohConcentration}
            onChange={(e) => onOhConcentrationChange(e.target.value)}
          />
        )}
      </div>
    </SectionCard>
  );
}

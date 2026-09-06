"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import PhModeTabs from "./PhModeTabs";
import PhVariablesDiagram from "./PhVariablesDiagram";
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
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
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
  onCalculate,
  onClear,
}: PhInputPanelProps) {
  const t = useTranslations("tools.ph-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("operationLabel")}</span>
        <PhModeTabs operation={operation} onOperationChange={onOperationChange} />
      </div>

      <PhVariablesDiagram
        solved={operation}
        labels={{ fromPH: "pH", fromH: "[H⁺]", fromPOH: "pOH", fromOH: "[OH⁻]" }}
        caption={t("variablesCaption")}
      />

      <form onSubmit={onCalculate} className="mt-4 space-y-5">
        {operation === "fromPH" && (
          <ToolInput label={t("pHLabel")} type="text" inputMode="decimal" placeholder={t("pHPlaceholder")} value={pH} onChange={(e) => onPHChange(e.target.value)} />
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
          <ToolInput label={t("pOHLabel")} type="text" inputMode="decimal" placeholder={t("pOHPlaceholder")} value={pOH} onChange={(e) => onPOHChange(e.target.value)} />
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

        <div className="flex flex-wrap gap-4">
          <ToolButton type="submit">{t("calculate")}</ToolButton>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t("clear")}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
